// services/users/controller/otp_controller.go
package controller

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/users/service"
)

type OTPController struct {
	service service.UserService
}

func NewOTPController(s service.UserService) *OTPController {
	return &OTPController{service: s}
}

func (oc *OTPController) VerifyOTP(c *fiber.Ctx) error {
	type VerifyRequest struct {
		OTPCode string `json:"otp_code"`
	}

	var req VerifyRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	userID := c.Locals("user_id").(uint)

	if err := oc.service.VerifyOTP(userID, req.OTPCode); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "OTP verified successfully", nil)
}

func (oc *OTPController) ResendOTP(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	if err := oc.service.ResendOTP(userID); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "OTP sent successfully", nil)
}
