package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/logger"
	"github.com/jafoor/carhub/libs/models"
)

type Claims struct {
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateAccessToken(u *models.User) (string, string, error) {
	// create a jti
	jti := uuid.Must(uuid.NewV6()).String()
	now := time.Now()
	exp := now.Add(time.Duration(config.App.AccessTokenTTL) * time.Second)

	claims := Claims{
		UserID: u.ID,
		Name:   u.FullName,
		Role:   "", // we'll set below if Role is preloaded
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(exp),
			ID:        jti,
			Subject:   string(rune(u.ID)),
		},
	}

	if u.Role.Name != "" {
		claims.Role = u.Role.Name
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(config.App.JWTSecret))
	if err != nil {
		logger.Log.Error().Err(err).Msg("failed to sign access token")
		return "", "", err
	}
	return signed, jti, nil
}

func ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(config.App.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

func ValidateJWT(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(config.App.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	return claims, nil
}
