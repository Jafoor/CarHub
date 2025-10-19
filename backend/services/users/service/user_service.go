package service

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math"
	"math/big"
	"strings"
	"time"

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

type UserPaginationRequest struct {
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	Search    string `json:"search"`
	Role      string `json:"role"`
	SortBy    string `json:"sortBy"`
	SortOrder string `json:"sortOrder"`
}

type PaginationInfo struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

type UserResponse struct {
	ID          uint       `json:"id"`
	FullName    string     `json:"full_name"`
	Email       string     `json:"email"`
	Phone       string     `json:"phone"`
	Role        string     `json:"role"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
}

type UserProfileResponse struct {
	ID          uint       `json:"id"`
	FullName    string     `json:"full_name"`
	Email       string     `json:"email"`
	Phone       string     `json:"phone"`
	Role        string     `json:"role"`
	IsVerified  bool       `json:"is_verified"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type UserService interface {
	Signup(req SignupInput) (*TokenResponse, error)
	Signin(req SigninInput) (*TokenResponse, error)
	RefreshToken(refreshToken string) (*TokenResponse, error)
	GetProfile(userID uint) (*UserProfileResponse, error)
	GetUsers(req UserPaginationRequest) ([]UserResponse, *PaginationInfo, error)
	Logout(userID uint) error

	VerifyOTP(userID uint, otpCode string) error
	ResendOTP(userID uint) error
	AdminLogin(req SigninInput) (*TokenResponse, error)
}

type userService struct {
	userRepo repository.UserRepository
	otpRepo  repository.OTPRepository
}

func NewUserService(userRepo repository.UserRepository, otpRepo repository.OTPRepository) UserService {
	return &userService{
		userRepo: userRepo,
		otpRepo:  otpRepo,
	}
}

// Utility functions
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func hashToken(t string) (string, error) {
	hash := sha256.Sum256([]byte(t))
	return hex.EncodeToString(hash[:]), nil
}

func verifyToken(storedHash, providedToken string) bool {
	// Hash the provided token and compare with stored hash
	providedHash, err := hashToken(providedToken)
	if err != nil {
		return false
	}
	return storedHash == providedHash
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

	// Check if user already exists
	existingUser, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}

	if req.Phone != "" {
		existingUserByPhone, err := s.userRepo.FindByPhone(req.Phone)
		if err != nil {
			return nil, fmt.Errorf("database error: %w", err)
		}
		if existingUserByPhone != nil {
			return nil, errors.New("user already exists")
		}
	}

	if existingUser != nil {
		return nil, errors.New("user already exists")
	}

	roleName := req.Role
	if roleName == "" {
		roleName = "user"
	}
	role, err := s.userRepo.FindRoleByName(roleName)
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
		IsVerified:   false, // User starts as unverified
	}

	var tokenResponse *TokenResponse

	err = executeTransaction(func(tx *gorm.DB) error {
		// Create user
		if err := s.userRepo.Create(tx, user); err != nil {
			return err
		}

		// Generate OTP for verification
		otp, err := s.generateOTP(user.ID, "signup")
		if err != nil {
			return err
		}

		if err := s.otpRepo.Create(tx, otp); err != nil {
			return err
		}

		// For non-admin users, don't generate tokens until verified
		if roleName != "admin" {
			// Generate limited access token for unverified users
			accessToken, _, err := auth.GenerateUnverifiedAccessToken(user)
			if err != nil {
				return err
			}

			tokenResponse = &TokenResponse{
				AccessToken:  accessToken,
				RefreshToken: "",                            // No refresh token for unverified users
				ExpiresIn:    config.App.UnverifiedTokenTTL, // Shorter TTL
			}
		}

		return nil
	})

	return tokenResponse, err
}

func (s *userService) AdminLogin(req SigninInput) (*TokenResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Find user
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	// Strict admin checks
	if user.Role.Name != "admin" {
		return nil, errors.New("access denied: admin role required")
	}

	if !user.IsVerified {
		return nil, errors.New("account not verified. Please verify your email first")
	}

	// Verify password
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
		refreshPlain, err := auth.GenerateRefreshToken(user)
		if err != nil {
			return err
		}
		refreshHash, err := hashToken(refreshPlain)
		if err != nil {
			return err
		}

		rt := &models.RefreshToken{
			UserID:    user.ID,
			TokenHash: refreshHash,
			ExpiresAt: time.Now().Add(time.Duration(config.App.RefreshTokenTTL) * time.Second),
		}
		if err := s.userRepo.ReplaceRefreshToken(tx, rt); err != nil {
			return err
		}

		// Update last login
		now := time.Now()
		user.LastLoginAt = &now
		if updateErr := s.userRepo.Update(tx, user); updateErr != nil {
			logger.Log.Warn().Err(updateErr).Msg("failed updating last login")
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

func (s *userService) VerifyOTP(userID uint, otpCode string) error {
	// Find valid OTP
	otp, err := s.otpRepo.FindValidOTP(userID, otpCode, "signup")
	if err != nil {
		return err
	}

	if otp == nil {
		return errors.New("invalid or expired OTP")
	}

	return executeTransaction(func(tx *gorm.DB) error {
		// Mark OTP as used
		if err := s.otpRepo.MarkAsUsed(tx, otp.ID); err != nil {
			return err
		}

		// Update user as verified
		var user models.User
		if err := tx.First(&user, userID).Error; err != nil {
			return err
		}

		user.IsVerified = true
		return tx.Save(&user).Error
	})
}

func (s *userService) ResendOTP(userID uint) error {
	// Check OTP limits (max 3 OTPs per hour)
	count, err := s.otpRepo.CountRecentOTPs(userID, "signup", time.Hour)
	if err != nil {
		return err
	}

	if count >= 3 {
		return errors.New("OTP limit exceeded. Please try again later")
	}

	// Generate new OTP
	otp, err := s.generateOTP(userID, "signup")
	if err != nil {
		return err
	}

	return executeTransaction(func(tx *gorm.DB) error {
		return s.otpRepo.Create(tx, otp)
	})
}

func (s *userService) generateOTP(userID uint, purpose string) (*models.OTP, error) {
	// Generate 6-digit OTP
	otpCode, err := generateRandomOTP(6)
	if err != nil {
		return nil, err
	}

	return &models.OTP{
		UserID:    userID,
		OTPCode:   otpCode,
		Purpose:   purpose,
		ExpiresAt: time.Now().Add(30 * time.Minute), // 30 minutes expiry
		Used:      false,
	}, nil
}

func generateRandomOTP(length int) (string, error) {
	const digits = "0123456789"
	otp := make([]byte, length)

	for i := range otp {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		otp[i] = digits[num.Int64()]
	}

	return string(otp), nil
}

func (s *userService) Signin(req SigninInput) (*TokenResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Find user (read outside transaction)
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsVerified {
		return nil, errors.New("account not verified. Please verify your email first")
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
		refreshPlain, err := auth.GenerateRefreshToken(user)
		if err != nil {
			return err
		}
		refreshHash, err := hashToken(refreshPlain)
		if err != nil {
			return err
		}

		rt := &models.RefreshToken{
			UserID:    user.ID,
			TokenHash: refreshHash,
			ExpiresAt: time.Now().Add(time.Duration(config.App.RefreshTokenTTL) * time.Second),
		}
		if err := s.userRepo.ReplaceRefreshToken(tx, rt); err != nil {
			return err
		}

		// Update last login (non-critical)
		now := time.Now()
		user.LastLoginAt = &now
		if updateErr := s.userRepo.Update(tx, user); updateErr != nil {
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

func (s *userService) RefreshToken(refreshToken string) (*TokenResponse, error) {
	if refreshToken == "" {
		return nil, errors.New("refresh token is required")
	}

	var tokenResponse *TokenResponse

	err := executeTransaction(func(tx *gorm.DB) error {
		// Get the user ID from refresh token without loading all tokens
		userID, err := auth.ExtractUserIDFromRefreshToken(refreshToken)
		if err != nil {
			return errors.New("invalid refresh token")
		}

		// Get user's refresh token from database
		tokens, err := s.userRepo.FindRefreshTokensByUser(userID)
		if err != nil || len(tokens) == 0 {
			return errors.New("invalid refresh token")
		}

		// Since we maintain only one token per user, we can safely check the first one
		token := tokens[0]

		// Verify the token
		if token.Revoked {
			return errors.New("refresh token revoked")
		}

		if time.Now().After(token.ExpiresAt) {
			return errors.New("refresh token expired")
		}

		if !verifyToken(token.TokenHash, refreshToken) {
			return errors.New("invalid refresh token")
		}

		// Get user details
		var user models.User
		if err := database.ReadDB.Preload("Role").First(&user, userID).Error; err != nil {
			return errors.New("user not found")
		}

		// Generate new access token
		accessToken, _, err := auth.GenerateAccessToken(&user)
		if err != nil {
			return err
		}

		// Generate new refresh token (rotate refresh token)
		refreshPlain, err := auth.GenerateRefreshToken(&user)
		if err != nil {
			return err
		}
		newRefreshHash, err := hashToken(refreshPlain)
		if err != nil {
			return err
		}

		// Replace the old refresh token with new one
		newRt := &models.RefreshToken{
			UserID:    userID,
			TokenHash: newRefreshHash,
			ExpiresAt: time.Now().Add(time.Duration(config.App.RefreshTokenTTL) * time.Second),
		}

		if err := s.userRepo.ReplaceRefreshToken(tx, newRt); err != nil {
			return err
		}

		// ✅ FIXED: Return the plain refresh token, not the hashed one
		tokenResponse = &TokenResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshPlain, // This should be the plain token
			ExpiresIn:    config.App.AccessTokenTTL,
		}
		return nil
	})

	return tokenResponse, err
}

func (s *userService) GetUsers(req UserPaginationRequest) ([]UserResponse, *PaginationInfo, error) {
	var users []models.User
	var total int64

	// Build query with ReadDB (for read operations)
	query := database.ReadDB.Model(&models.User{}).Preload("Role")

	// Apply search filter
	if req.Search != "" {
		searchPattern := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where("LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?",
			searchPattern, searchPattern, searchPattern)
	}

	// Apply role filter
	if req.Role != "" {
		query = query.Joins("JOIN roles ON users.role_id = roles.id").
			Where("roles.name = ?", req.Role)
	}

	// Count total records for pagination
	if err := query.Count(&total).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to count users: %w", err)
	}

	// Calculate offset
	offset := (req.Page - 1) * req.Limit

	// Validate and set sort parameters
	validSortFields := map[string]bool{
		"created_at":    true,
		"updated_at":    true,
		"full_name":     true,
		"email":         true,
		"last_login_at": true,
	}

	sortBy := req.SortBy
	if !validSortFields[sortBy] {
		sortBy = "created_at"
	}

	sortOrder := strings.ToUpper(req.SortOrder)
	if sortOrder != "ASC" && sortOrder != "DESC" {
		sortOrder = "DESC"
	}

	// Apply sorting and pagination
	query = query.Order(sortBy + " " + sortOrder).
		Offset(offset).
		Limit(req.Limit)

	// Execute query
	if err := query.Find(&users).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to fetch users: %w", err)
	}

	// Convert to response format
	userResponses := make([]UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = UserResponse{
			ID:          user.ID,
			FullName:    user.FullName,
			Email:       user.Email,
			Phone:       user.Phone,
			Role:        user.Role.Name,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			LastLoginAt: user.LastLoginAt,
		}
	}

	// Calculate pagination info
	totalPages := int(math.Ceil(float64(total) / float64(req.Limit)))
	if totalPages < 1 {
		totalPages = 1
	}

	pagination := &PaginationInfo{
		Page:       req.Page,
		Limit:      req.Limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return userResponses, pagination, nil
}

func (s *userService) GetProfile(userID uint) (*UserProfileResponse, error) {
	// Read operation - no transaction needed
	var user models.User
	err := database.ReadDB.Preload("Role").First(&user, userID).Error
	if err != nil {
		return nil, err
	}
	user.PasswordHash = ""

	profile := &UserProfileResponse{
		ID:          user.ID,
		FullName:    user.FullName,
		Email:       user.Email,
		Phone:       user.Phone,
		Role:        user.Role.Name, // Just the role name, not the entire role object
		IsVerified:  user.IsVerified,
		LastLoginAt: user.LastLoginAt,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}

	return profile, nil
}

func (s *userService) Logout(userID uint) error {
	// Delete all refresh tokens for this user within transaction
	return executeTransaction(func(tx *gorm.DB) error {
		// Delete all refresh tokens for the user
		if err := tx.Where("user_id = ?", userID).Delete(&models.RefreshToken{}).Error; err != nil {
			return err
		}
		return nil
	})
}
