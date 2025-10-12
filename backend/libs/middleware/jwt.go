package middleware

import (
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/auth"
	"github.com/jafoor/carhub/libs/utils"
)

func JWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Missing Authorization header")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid token format")
		}

		tokenStr := parts[1]
		claims, err := auth.ValidateJWT(tokenStr)
		if err != nil {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token")
		}

		// Inject user info into context
		c.Locals("user_id", claims.UserID)
		c.Locals("name", claims.Name)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}
