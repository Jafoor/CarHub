package middleware

import (
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jafoor/carhub/libs/auth"
	"github.com/jafoor/carhub/libs/utils"
)

func JWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Missing Authorization header", nil)
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid token format", nil)
		}
		tokenStr := parts[1]
		token, err := auth.VerifyToken(tokenStr)
		if err != nil {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token", nil)
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid token claims", nil)
		}
		// Extract claims using map indexing
		userID, ok := claims["id"].(float64) // JWT numbers are float64
		if !ok {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID in token", nil)
		}
		name, _ := claims["name"].(string) // Use underscore if field might not exist
		role, ok := claims["role"].(string)
		if !ok {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid role in token", nil)
		}
		email, _ := claims["email"].(string)
		isVerified, _ := claims["is_verified"].(bool)

		// Inject user info into context
		c.Locals("user_id", uint(userID)) // Convert float64 to uint
		c.Locals("name", name)
		c.Locals("role", role)
		c.Locals("email", email)
		c.Locals("is_verified", isVerified)
		c.Locals("user_token", token) // Store the entire token if needed

		return c.Next()
	}
}
