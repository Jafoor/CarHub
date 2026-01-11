// services/partner/controller/otp_controller.go
package controller

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/partner/service"
)

type OTPController struct {
	service service.OTPService
}

func NewOTPController(s service.OTPService) *OTPController {
	return &OTPController{service: s}
}

type VerifyOTPRequest struct {
	Email    string `json:"email" validate:"required,email"`
	OTPCode  string `json:"otp_code" validate:"required,len=6"`
}

type ResendOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// VerifyOTP handles OTP verification
func (oc *OTPController) VerifyOTP(c *fiber.Ctx) error {
	var req VerifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if err := oc.service.VerifyOTP(req.Email, req.OTPCode); err != nil {
		switch err.Error() {
		case "partner_not_found", "invalid_or_expired_otp":
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired OTP", nil)
		case "database_error":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Something went wrong", nil)
		default:
			return utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		}
	}

	return utils.SuccessResponse(c, "Email verified successfully", nil)
}

// ResendOTP sends a new OTP if allowed
func (oc *OTPController) ResendOTP(c *fiber.Ctx) error {
	var req ResendOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if err := oc.service.ResendOTP(req.Email); err != nil {
		switch err.Error() {
		case "partner_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Partner not found", nil)
		case "email_already_verified":
			return utils.ErrorResponse(c, http.StatusBadRequest, "Email already verified", nil)
		case "otp_already_sent_wait_for_expiry":
			return utils.ErrorResponse(c, http.StatusTooManyRequests, "Please wait until current OTP expires", nil)
		case "database_error", "otp_generation_failed":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to send OTP", nil)
		default:
			return utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		}
	}

	return utils.SuccessResponse(c, "OTP resent successfully", nil)
}