// services/admin/service/auth_service.go
package service

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/jafoor/carhub/libs/auth"
	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	adminRefreshTokenRepo "github.com/jafoor/carhub/libs/repository"
	"github.com/jafoor/carhub/services/admin/repository"
	"gorm.io/gorm"
)

type SigninInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type TokenResponse struct {
	AccessToken  string   `json:"access_token"`
	RefreshToken string   `json:"refresh_token"`
	ExpiresIn    int64    `json:"expires_in"` // seconds
	Roles        []string `json:"roles"`
}

type AuthService interface {
	Signin(req SigninInput) (*TokenResponse, error)
	RefreshToken(refreshToken string) (*TokenResponse, error)
}

type authService struct {
	adminRepo        repository.AdminRepository
	refreshTokenRepo adminRefreshTokenRepo.AdminRefreshTokenRepository
}

func NewAuthService(
	adminRepo repository.AdminRepository,
	refreshTokenRepo adminRefreshTokenRepo.AdminRefreshTokenRepository,
) AuthService {
	return &authService{
		adminRepo:        adminRepo,
		refreshTokenRepo: refreshTokenRepo,
	}
}

// hashToken creates SHA256 hash of token for secure storage
func hashToken(token string) (string, error) {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:]), nil
}

// Signin handles admin login
func (s *authService) Signin(req SigninInput) (*TokenResponse, error) {
	// Find admin by email
	admin, err := s.adminRepo.FindByEmail(req.Email)
	if err != nil || admin == nil {
		return nil, errors.New("invalid_credentials")
	}

	// Check if admin is active
	if !admin.IsActive {
		return nil, errors.New("account_inactive")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid_credentials")
	}

	// Get admin roles
	roles, err := s.adminRepo.GetAdminRoles(admin.ID)
	if err != nil {
		return nil, errors.New("failed_to_get_roles")
	}

	var resp *TokenResponse

	// Execute in transaction
	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		// Delete any existing refresh token first
		if err := s.refreshTokenRepo.DeleteByAdminID(tx, admin.ID); err != nil {
			return err
		}

		// Generate new access token
		accessToken, err := auth.GenerateAdminAccessToken(admin, roles)
		if err != nil {
			return err
		}

		// Generate new refresh token
		refreshToken, err := auth.GenerateAdminRefreshToken(admin, roles)
		if err != nil {
			return err
		}

		// Hash refresh token for secure storage
		refreshHash, err := hashToken(refreshToken)
		if err != nil {
			return err
		}

		// Create new refresh token record
		rt := &models.AdminRefreshToken{
			AdminID:   admin.ID,
			TokenHash: refreshHash,
			ExpiresAt: time.Now().Add(time.Hour * 24 * time.Duration(config.App.AdminRefreshTokenTTL)),
		}
		if err := s.refreshTokenRepo.Create(tx, rt); err != nil {
			return err
		}

		// Extract role names for response
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Update last login time
		now := time.Now()
		admin.LastLoginAt = &now
		if err := s.adminRepo.Update(tx, admin); err != nil {
			return err
		}

		resp = &TokenResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    config.App.AdminAccessTokenTTL * 60, // convert minutes to seconds
			Roles:        roleNames,
		}
		return nil
	})

	if err != nil {
		return nil, errors.New("login_failed")
	}

	return resp, nil
}

// RefreshToken handles token rotation
func (s *authService) RefreshToken(refreshToken string) (*TokenResponse, error) {
	// Verify and parse refresh token
	claims, err := auth.VerifyAdminToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid_refresh_token")
	}

	// Hash the provided refresh token
	refreshHash, err := hashToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid_refresh_token")
	}

	// Find stored refresh token by admin ID
	stored, err := s.refreshTokenRepo.FindByAdminID(claims.AdminID)
	if err != nil || stored == nil {
		return nil, errors.New("invalid_refresh_token")
	}

	// Verify hash matches
	if refreshHash != stored.TokenHash {
		return nil, errors.New("invalid_refresh_token")
	}

	// Check if token is expired
	if time.Now().After(stored.ExpiresAt) {
		return nil, errors.New("refresh_token_expired")
	}

	// Get admin
	admin, err := s.adminRepo.FindByID(claims.AdminID)
	if err != nil || admin == nil {
		return nil, errors.New("admin_not_found")
	}

	// Check if admin is still active
	if !admin.IsActive {
		return nil, errors.New("account_inactive")
	}

	// Get admin roles
	roles, err := s.adminRepo.GetAdminRoles(admin.ID)
	if err != nil {
		return nil, errors.New("failed_to_get_roles")
	}

	var resp *TokenResponse

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		// Delete old refresh token
		if err := s.refreshTokenRepo.DeleteByAdminID(tx, admin.ID); err != nil {
			return err
		}

		// Generate new tokens
		newAccessToken, err := auth.GenerateAdminAccessToken(admin, roles)
		if err != nil {
			return err
		}

		newRefreshToken, err := auth.GenerateAdminRefreshToken(admin, roles)
		if err != nil {
			return err
		}

		// Hash new refresh token
		newRefreshHash, err := hashToken(newRefreshToken)
		if err != nil {
			return err
		}

		// Save new refresh token
		newRT := &models.AdminRefreshToken{
			AdminID:   admin.ID,
			TokenHash: newRefreshHash,
			ExpiresAt: time.Now().Add(time.Hour * 24 * time.Duration(config.App.AdminRefreshTokenTTL)),
		}
		if err := s.refreshTokenRepo.Create(tx, newRT); err != nil {
			return err
		}

		// Extract role names for response
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		resp = &TokenResponse{
			AccessToken:  newAccessToken,
			RefreshToken: newRefreshToken,
			ExpiresIn:    config.App.AdminAccessTokenTTL * 60,
			Roles:        roleNames,
		}
		return nil
	})

	if err != nil {
		return nil, errors.New("token_refresh_failed")
	}

	return resp, nil
}
