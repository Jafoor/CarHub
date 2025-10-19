package middleware

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/logger"
	"github.com/jafoor/carhub/libs/utils"
)

func Recovery() fiber.Handler {
	return func(c *fiber.Ctx) (err error) {
		defer func() {
			if r := recover(); r != nil {
				logger.Error().Err(err).Msg("panic recovered")
				utils.ErrorResponse(c, http.StatusInternalServerError, "Internal server error", nil)
			}
		}()
		return c.Next()
	}
}
