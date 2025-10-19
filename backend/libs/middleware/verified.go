// libs/middleware/verified.go
package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// RequireVerified middleware checks if user is verified
func RequireVerified() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userToken, ok := c.Locals("user_token").(*jwt.Token)
		if !ok || userToken == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Unauthorized: missing token",
			})
		}

		claims, ok := userToken.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid token claims",
			})
		}

		if isVerified, exists := claims["is_verified"]; exists {
			if verified, ok := isVerified.(bool); ok && !verified {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"success": false,
					"message": "Account verification required",
				})
			}
		}

		return c.Next()
	}
}
