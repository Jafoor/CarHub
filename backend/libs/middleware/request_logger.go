package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jafoor/carhub/libs/logger"
)

// RequestLogger logs start/end of each HTTP request with a request ID
func RequestLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Generate request ID
		reqID := c.Get("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}
		c.Locals("request_id", reqID)

		start := time.Now()

		// Log request start
		logger.Info().
			Str("request_id", reqID).
			Str("method", c.Method()).
			Str("path", c.Path()).
			Msg("Request started")

		// Proceed with request
		err := c.Next()

		// Log request end
		duration := time.Since(start)
		status := c.Response().StatusCode()
		logger.Info().
			Str("request_id", reqID).
			Str("method", c.Method()).
			Str("path", c.Path()).
			Int("status", status).
			Dur("duration", duration).
			Msg("Request completed")

		return err
	}
}
