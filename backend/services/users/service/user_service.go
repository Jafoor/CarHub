package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jafoor/carhub/libs/auth"
	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/logger"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/services/users/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type SignupInput struct {
	FullName string
	Email    string
	Phone    string
	Password string
	Role     string
}

type SigninInput struct {
	Email    string
	Password string
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type UserService interface {
	Signup(req SignupInput) (*TokenResponse, error)
	Signin(req SigninInput) (*TokenResponse, error)
	GetProfile(userID uint) (*models.User, error)
	Logout(userID uint, refreshToken string) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

// Utility functions
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func hashToken(t string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(t), bcrypt.DefaultCost)
	return string(bytes), err
}

// Enhanced transaction helper
type txOperation func(tx *gorm.DB) error

func executeTransaction(op txOperation) error {
	return database.WriteDB.Transaction(func(tx *gorm.DB) error {
		return op(tx)
	})
}

// Business Logic
func (s *userService) Signup(req SignupInput) (*TokenResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" || req.FullName == "" {
		return nil, errors.New("missing required fields")
	}

	existingUser, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}

	if existingUser != nil {
		// Now this will only be true if a user was actually found
		logger.Log.Info().Str("email", req.Email).Msg("user already exists during signup")
		return nil, errors.New("user already exists")
	}

	roleName := req.Role
	if roleName == "" {
		roleName = "user"
	}
	role, err := s.repo.FindRoleByName(roleName)
	if err != nil {
		return nil, errors.New("role not found")
	}

	pwHash, err := hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		FullName:     req.FullName,
		Email:        req.Email,
		Phone:        req.Phone,
		PasswordHash: pwHash,
		RoleID:       role.ID,
	}

	var tokenResponse *TokenResponse

	err = executeTransaction(func(tx *gorm.DB) error {
		// Create user
		if err := s.repo.Create(tx, user); err != nil {
			return err
		}

		// Preload role within transaction
		if err := tx.Preload("Role").First(user, user.ID).Error; err != nil {
			return err
		}

		// Generate tokens
		accessToken, _, err := auth.GenerateAccessToken(user)
		if err != nil {
			return err
		}

		refreshPlain := uuid.New().String()
		refreshHash, err := hashToken(refreshPlain)
		if err != nil {
			return err
		}

		// Create refresh token
		rt := &models.RefreshToken{
			UserID:    user.ID,
			TokenHash: refreshHash,
			ExpiresAt: time.Now().Add(time.Duration(config.App.RefreshTokenTTL) * time.Second),
		}
		if err := s.repo.CreateRefreshToken(tx, rt); err != nil {
			return err
		}

		tokenResponse = &TokenResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshPlain,
			ExpiresIn:    config.App.AccessTokenTTL,
		}
		return nil
	})

	return tokenResponse, err
}

func (s *userService) Signin(req SigninInput) (*TokenResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Find user (read outside transaction)
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	var tokenResponse *TokenResponse

	err = executeTransaction(func(tx *gorm.DB) error {
		// Generate access token
		accessToken, _, err := auth.GenerateAccessToken(user)
		if err != nil {
			return err
		}

		// Create refresh token
		refreshPlain := uuid.New().String()
		refreshHash, err := hashToken(refreshPlain)
		if err != nil {
			return err
		}

		rt := &models.RefreshToken{
			UserID:    user.ID,
			TokenHash: refreshHash,
			ExpiresAt: time.Now().Add(time.Duration(config.App.RefreshTokenTTL) * time.Second),
		}
		if err := s.repo.CreateRefreshToken(tx, rt); err != nil {
			return err
		}

		// Update last login (non-critical)
		now := time.Now()
		user.LastLoginAt = &now
		if updateErr := s.repo.Update(tx, user); updateErr != nil {
			logger.Log.Warn().Err(updateErr).Msg("failed updating last login")
			// Continue despite this error
		}

		tokenResponse = &TokenResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshPlain,
			ExpiresIn:    config.App.AccessTokenTTL,
		}
		return nil
	})

	return tokenResponse, err
}

func (s *userService) GetProfile(userID uint) (*models.User, error) {
	// Read operation - no transaction needed
	var user models.User
	err := database.ReadDB.Preload("Role").First(&user, userID).Error
	return &user, err
}

func (s *userService) Logout(userID uint, refreshToken string) error {
	// Find tokens (read outside transaction)
	tokens, err := s.repo.FindRefreshTokensByUser(userID)
	if err != nil {
		return err
	}

	// Find matching token
	var tokenToRevoke *models.RefreshToken
	for i, tok := range tokens {
		if bcrypt.CompareHashAndPassword([]byte(tok.TokenHash), []byte(refreshToken)) == nil {
			tokenToRevoke = &tokens[i]
			break
		}
	}

	if tokenToRevoke == nil {
		return errors.New("refresh token not found")
	}

	// Revoke within transaction
	return executeTransaction(func(tx *gorm.DB) error {
		tokenToRevoke.Revoked = true
		return tx.Save(tokenToRevoke).Error
	})
}
