package utils

import "github.com/gofiber/fiber/v2"

type JSONResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

func SuccessResponse(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(fiber.StatusOK).JSON(JSONResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func ErrorResponse(c *fiber.Ctx, status int, message string, data interface{}) error {
	return c.Status(status).JSON(JSONResponse{
		Success: false,
		Message: message,
		Data:    data, // pass nil to return "data": null
	})
}
