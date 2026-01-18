// services/admin/controller/auth_controller.go
package controller

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/middleware"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/admin/service"
)

type AuthController struct {
	service service.AuthService
}

func NewAuthController(s service.AuthService) *AuthController {
	return &AuthController{service: s}
}

func (ac *AuthController) Signin(c *fiber.Ctx) error {
	var input service.SigninInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	token, err := ac.service.Signin(input)
	if err != nil {
		switch err.Error() {
		case "invalid_credentials":
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid credentials", nil)
		case "account_inactive":
			return utils.ErrorResponse(c, http.StatusForbidden, "Account is inactive", nil)
		case "failed_to_get_roles":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve roles", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Login failed", nil)
		}
	}

	return utils.SuccessResponse(c, "Login successful", token)
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

func (ac *AuthController) RefreshToken(c *fiber.Ctx) error {
	var req RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.RefreshToken == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "refresh_token is required", nil)
	}

	token, err := ac.service.RefreshToken(req.RefreshToken)
	if err != nil {
		switch err.Error() {
		case "invalid_refresh_token", "refresh_token_expired":
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired refresh token", nil)
		case "admin_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Admin not found", nil)
		case "account_inactive":
			return utils.ErrorResponse(c, http.StatusForbidden, "Account is inactive", nil)
		case "failed_to_get_roles":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve roles", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Token refresh failed", nil)
		}
	}

	return utils.SuccessResponse(c, "Token refreshed", token)
}

type UpdateProfileRequest struct {
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	Phone     *string `json:"phone,omitempty"`
}

func (ac *AuthController) UpdateProfile(c *fiber.Ctx) error {
	adminID, err := middleware.GetAdminID(c)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusUnauthorized, "Admin authentication required", nil)
	}

	var req UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	input := service.UpdateProfileInput{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     req.Phone,
	}

	profile, err := ac.service.UpdateProfile(adminID, input)
	if err != nil {
		switch err.Error() {
		case "admin_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Admin not found", nil)
		case "failed_to_update_profile":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update profile", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update profile", nil)
		}
	}

	return utils.SuccessResponse(c, "Profile updated successfully", profile)
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (ac *AuthController) UpdatePassword(c *fiber.Ctx) error {
	adminID, err := middleware.GetAdminID(c)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusUnauthorized, "Admin authentication required", nil)
	}

	var req UpdatePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "current_password and new_password are required", nil)
	}

	input := service.UpdatePasswordInput{
		CurrentPassword: req.CurrentPassword,
		NewPassword:     req.NewPassword,
	}

	if err := ac.service.UpdatePassword(adminID, input); err != nil {
		switch err.Error() {
		case "admin_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Admin not found", nil)
		case "invalid_current_password":
			return utils.ErrorResponse(c, http.StatusBadRequest, "Current password is incorrect", nil)
		case "weak_password":
			return utils.ErrorResponse(c, http.StatusBadRequest, "Password does not meet requirements", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update password", nil)
		}
	}

	return utils.SuccessResponse(c, "Password updated successfully", nil)
}

func (ac *AuthController) GetProfile(c *fiber.Ctx) error {
	adminID, err := middleware.GetAdminID(c)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusUnauthorized, "Admin authentication required", nil)
	}

	profile, err := ac.service.GetProfile(adminID)
	if err != nil {
		switch err.Error() {
		case "admin_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Admin not found", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve profile", nil)
		}
	}

	return utils.SuccessResponse(c, "Profile retrieved successfully", profile)
}
