// libs/auth/jwt.go
package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/models"
)

type PartnerClaims struct {
	PartnerID  uint   `json:"partner_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	TokenType  string `json:"token_type,omitempty"`
	jwt.RegisteredClaims
}

type AdminClaims struct {
	AdminID   uint     `json:"admin_id"`
	FirstName string   `json:"first_name"`
	LastName  string   `json:"last_name"`
	Roles     []string `json:"roles"` // Array of role names
	TokenType string   `json:"token_type,omitempty"`
	jwt.RegisteredClaims
}

// GeneratePartnerAccessToken - short-lived (e.g., 15 minutes)
func GeneratePartnerAccessToken(partner *models.Partner) (string, error) {
	expirationTime := time.Now().Add(time.Minute * time.Duration(config.App.AccessTokenTTL))
	claims := &PartnerClaims{
		PartnerID: partner.ID,
		FirstName: partner.FirstName,
		LastName:  partner.LastName,
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.App.JWTSecret))
}

// GeneratePartnerRefreshToken - long-lived (e.g., 7 days)
func GeneratePartnerRefreshToken(partner *models.Partner) (string, error) {
	// ⚠️ CRITICAL: Use REFRESH_TOKEN_TTL (not AccessTokenTTL)
	expirationTime := time.Now().Add(time.Hour * 24 * time.Duration(config.App.RefreshTokenTTL)) // e.g., 7 days
	claims := &PartnerClaims{
		PartnerID: partner.ID,
		FirstName: partner.FirstName,
		LastName:  partner.LastName,
		TokenType: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.App.JWTSecret))
}

func VerifyPartnerToken(tokenStr string) (*PartnerClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &PartnerClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.App.JWTSecret), nil
	})
	if err != nil {
		return nil, errors.New("invalid token")
	}

	if claims, ok := token.Claims.(*PartnerClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// GenerateAdminAccessToken - short-lived (e.g., 30 minutes for admin)
func GenerateAdminAccessToken(admin *models.Admin, roles []models.AdminRole) (string, error) {
	expirationTime := time.Now().Add(time.Minute * time.Duration(config.App.AdminAccessTokenTTL))
	
	// Extract role names
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}
	
	claims := &AdminClaims{
		AdminID:   admin.ID,
		FirstName: admin.FirstName,
		LastName:  admin.LastName,
		Roles:     roleNames,
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.App.JWTSecret))
}

// GenerateAdminRefreshToken - long-lived (e.g., 30 days for admin)
func GenerateAdminRefreshToken(admin *models.Admin, roles []models.AdminRole) (string, error) {
	expirationTime := time.Now().Add(time.Hour * 24 * time.Duration(config.App.AdminRefreshTokenTTL))
	
	// Extract role names
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}
	
	claims := &AdminClaims{
		AdminID:   admin.ID,
		FirstName: admin.FirstName,
		LastName:  admin.LastName,
		Roles:     roleNames,
		TokenType: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.App.JWTSecret))
}

func VerifyAdminToken(tokenStr string) (*AdminClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &AdminClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.App.JWTSecret), nil
	})
	if err != nil {
		return nil, errors.New("invalid token")
	}

	if claims, ok := token.Claims.(*AdminClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}