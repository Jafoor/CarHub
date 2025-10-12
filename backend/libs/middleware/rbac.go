package middleware

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
)

func RequireRole(roles ...string) fiber.Handler {
	roleMap := make(map[string]bool)
	for _, r := range roles {
		roleMap[r] = true
	}

	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("role").(string)
		if !ok {
			return utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
		}

		if !roleMap[userRole] {
			return utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
		}

		return c.Next()
	}
}
