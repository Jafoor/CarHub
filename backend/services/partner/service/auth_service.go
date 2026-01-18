// services/partner/service/auth_service.go
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
	otpRepo "github.com/jafoor/carhub/libs/repository"
	"github.com/jafoor/carhub/services/partner/repository"
	"gorm.io/gorm"
)

type SigninInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"` // seconds
}

type AuthService interface {
	Signin(req SigninInput) (*TokenResponse, error)
	RefreshToken(refreshToken string) (*TokenResponse, error)
}

type authService struct {
	partnerRepo        repository.PartnerRepository
	refreshTokenRepo   otpRepo.PartnerRefreshTokenRepository
}

func NewAuthService(
	partnerRepo repository.PartnerRepository,
	refreshTokenRepo otpRepo.PartnerRefreshTokenRepository,
) AuthService {
	return &authService{
		partnerRepo:      partnerRepo,
		refreshTokenRepo: refreshTokenRepo,
	}
}

// hashToken creates SHA256 hash of token for secure storage
func hashToken(token string) (string, error) {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:]), nil
}

// Signin handles partner login with email verification check
func (s *authService) Signin(req SigninInput) (*TokenResponse, error) {
	// Find partner by email
	partner, err := s.partnerRepo.FindByEmail(req.Email)
	if err != nil || partner == nil {
		return nil, errors.New("invalid_credentials")
	}

	// Must be email verified to sign in
	if !partner.EmailVerified {
		return nil, errors.New("invalid_credentials")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(partner.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid_credentials")
	}

	var resp *TokenResponse

	// Execute in transaction
	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		// 🔥 CRITICAL: Delete any existing refresh token first
		if err := s.refreshTokenRepo.DeleteByPartnerID(tx, partner.ID); err != nil {
			return err
		}

		// Generate new access token
		accessToken, err := auth.GeneratePartnerAccessToken(partner)
		if err != nil {
			return err
		}

		// Generate new refresh token
		refreshToken, err := auth.GeneratePartnerRefreshToken(partner)
		if err != nil {
			return err
		}

		// Hash refresh token for secure storage
		refreshHash, err := hashToken(refreshToken)
		if err != nil {
			return err
		}

		// Create new refresh token record
		rt := &models.PartnerRefreshToken{
			PartnerID: partner.ID,
			TokenHash: refreshHash,
			ExpiresAt: time.Now().Add(time.Hour * 24 * time.Duration(config.App.RefreshTokenTTL)),
		}
		if err := s.refreshTokenRepo.Create(tx, rt); err != nil {
			return err
		}

		resp = &TokenResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    config.App.AccessTokenTTL * 60, // convert minutes to seconds
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
	claims, err := auth.VerifyPartnerToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid_refresh_token")
	}

	// Hash the provided refresh token
	refreshHash, err := hashToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid_refresh_token")
	}

	// Find stored refresh token by partner ID
	stored, err := s.refreshTokenRepo.FindByPartnerID(claims.PartnerID)
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

	// Get partner
	partner, err := s.partnerRepo.FindByID(claims.PartnerID)
	if err != nil || partner == nil {
		return nil, errors.New("partner_not_found")
	}

	var resp *TokenResponse

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		// 🔥 Delete old refresh token
		if err := s.refreshTokenRepo.DeleteByPartnerID(tx, partner.ID); err != nil {
			return err
		}

		// Generate new tokens
		newAccessToken, err := auth.GeneratePartnerAccessToken(partner)
		if err != nil {
			return err
		}

		newRefreshToken, err := auth.GeneratePartnerRefreshToken(partner)
		if err != nil {
			return err
		}

		// Hash new refresh token
		newRefreshHash, err := hashToken(newRefreshToken)
		if err != nil {
			return err
		}

		// Save new refresh token
		newRT := &models.PartnerRefreshToken{
			PartnerID: partner.ID,
			TokenHash: newRefreshHash,
			ExpiresAt: time.Now().Add(time.Hour * 24 * time.Duration(config.App.RefreshTokenTTL)),
		}
		if err := s.refreshTokenRepo.Create(tx, newRT); err != nil {
			return err
		}

		resp = &TokenResponse{
			AccessToken:  newAccessToken,
			RefreshToken: newRefreshToken,
			ExpiresIn:    config.App.AccessTokenTTL * 60,
		}
		return nil
	})

	if err != nil {
		return nil, errors.New("token_refresh_failed")
	}

	return resp, nil
}