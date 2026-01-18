// services/admin/controller/auth_controller.go
package controller

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
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
