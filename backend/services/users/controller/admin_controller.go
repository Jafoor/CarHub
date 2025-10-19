// services/users/controller/admin_controller.go
package controller

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/users/service"
)

type AdminController struct {
	service service.UserService
}

func NewAdminController(s service.UserService) *AdminController {
	return &AdminController{service: s}
}

func (ac *AdminController) AdminLogin(c *fiber.Ctx) error {
	var input service.SigninInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	token, err := ac.service.AdminLogin(input)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Admin login successful", token)
}
