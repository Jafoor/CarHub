package controller

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/users/service"
)

type UserController struct {
	service service.UserService
}

func NewUserController(s service.UserService) *UserController {
	return &UserController{service: s}
}

func (uc *UserController) Signup(c *fiber.Ctx) error {
	var input service.SignupInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request")
	}

	token, err := uc.service.Signup(input)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, "User created successfully", token)
}

func (uc *UserController) Signin(c *fiber.Ctx) error {
	var input service.SigninInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request")
	}

	token, err := uc.service.Signin(input)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, err.Error())
	}

	return utils.SuccessResponse(c, "Login successful", token)
}

func (uc *UserController) Profile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	user, err := uc.service.GetProfile(userID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user not found")
	}

	return utils.SuccessResponse(c, "", user)
}

func (uc *UserController) Logout(c *fiber.Ctx) error {
	type Req struct {
		RefreshToken string `json:"refresh_token"`
	}

	var req Req
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request body")
	}

	userID := c.Locals("user_id").(uint)
	err := uc.service.Logout(userID, req.RefreshToken)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, "logged out successfully", nil)
}
