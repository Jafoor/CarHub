// libs/auth/jwt.go
package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/models"
)

// GenerateAccessToken generates a JWT token for authenticated users
func GenerateAccessToken(user *models.User) (string, *jwt.Token, error) {
	expirationTime := time.Now().Add(time.Duration(config.App.AccessTokenTTL) * time.Second)

	claims := &jwt.MapClaims{
		"id":          user.ID,
		"email":       user.Email,
		"role":        user.Role.Name,
		"is_verified": user.IsVerified,
		"exp":         expirationTime.Unix(),
		"iat":         time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.App.JWTSecret))

	return tokenString, token, err
}

// GenerateRefreshToken generates a refresh token
func GenerateRefreshToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(time.Duration(config.App.RefreshTokenTTL) * time.Second)

	claims := &jwt.MapClaims{
		"id":  user.ID,
		"exp": expirationTime.Unix(),
		"iat": time.Now().Unix(),
		"typ": "refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.App.JWTSecret))

	return tokenString, err
}

// GenerateUnverifiedAccessToken generates a limited token for unverified users
func GenerateUnverifiedAccessToken(user *models.User) (string, *jwt.Token, error) {
	expirationTime := time.Now().Add(time.Duration(config.App.UnverifiedTokenTTL) * time.Second)

	claims := &jwt.MapClaims{
		"id":          user.ID,
		"email":       user.Email,
		"role":        user.Role.Name,
		"is_verified": user.IsVerified,
		"exp":         expirationTime.Unix(),
		"iat":         time.Now().Unix(),
		"limited":     true, // Mark as limited access token
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.App.JWTSecret))

	return tokenString, token, err
}

// VerifyToken verifies and parses a JWT token
func VerifyToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(config.App.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return token, nil
}

// VerifyTokenAndCheckVerified verifies token and checks if user is verified
func VerifyTokenAndCheckVerified(tokenString string) (*jwt.Token, error) {
	token, err := VerifyToken(tokenString)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	// For certain endpoints, require verified users
	if isVerified, exists := claims["is_verified"]; exists {
		if verified, ok := isVerified.(bool); ok && !verified {
			return nil, errors.New("account not verified")
		}
	}

	return token, nil
}

// ExtractUserIDFromToken extracts user ID from JWT token
func ExtractUserIDFromToken(tokenString string) (uint, error) {
	token, err := VerifyToken(tokenString)
	if err != nil {
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid token claims")
	}

	userID, ok := claims["id"].(float64)
	if !ok {
		return 0, errors.New("invalid user ID in token")
	}

	return uint(userID), nil
}

// ExtractUserIDFromRefreshToken extracts user ID from refresh token
func ExtractUserIDFromRefreshToken(tokenString string) (uint, error) {
	token, err := VerifyToken(tokenString)
	if err != nil {
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid token claims")
	}

	// Check if it's a refresh token
	if tokenType, exists := claims["typ"]; !exists || tokenType != "refresh" {
		return 0, errors.New("invalid token type")
	}

	userID, ok := claims["id"].(float64)
	if !ok {
		return 0, errors.New("invalid user ID in token")
	}

	return uint(userID), nil
}

// IsTokenLimited checks if the token has limited access (for unverified users)
func IsTokenLimited(token *jwt.Token) bool {
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return false
	}

	if limited, exists := claims["limited"]; exists {
		if isLimited, ok := limited.(bool); ok {
			return isLimited
		}
	}
	return false
}

// GetUserClaims extracts user claims from token
func GetUserClaims(token *jwt.Token) (jwt.MapClaims, error) {
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}
	return claims, nil
}
