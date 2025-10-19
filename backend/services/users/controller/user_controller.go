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
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	token, err := uc.service.Signup(input)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "User created successfully", token)
}

func (uc *UserController) Signin(c *fiber.Ctx) error {
	var input service.SigninInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	token, err := uc.service.Signin(input)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Login successful", token)
}

func (uc *UserController) RefreshToken(c *fiber.Ctx) error {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token"`
	}

	var req RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	if req.RefreshToken == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "refresh token is required", nil)
	}

	tokenResponse, err := uc.service.RefreshToken(req.RefreshToken)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Token refreshed successfully", tokenResponse)
}

func (uc *UserController) GetUsers(c *fiber.Ctx) error {
	// Get query parameters
	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}

	limit := c.QueryInt("limit", 10)
	if limit < 1 || limit > 100 {
		limit = 10
	}

	search := c.Query("search", "")
	role := c.Query("role", "")
	sortBy := c.Query("sortBy", "created_at")
	sortOrder := c.Query("sortOrder", "desc")

	// Create pagination request
	paginationReq := service.UserPaginationRequest{
		Page:      page,
		Limit:     limit,
		Search:    search,
		Role:      role,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}

	// Call service to get users
	users, pagination, err := uc.service.GetUsers(paginationReq)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	response := map[string]interface{}{
		"data": users,
		"pagination": map[string]interface{}{
			"page":       pagination.Page,
			"limit":      pagination.Limit,
			"total":      pagination.Total,
			"totalPages": pagination.TotalPages,
		},
	}

	return utils.SuccessResponse(c, "Users retrieved successfully", response)
}

func (uc *UserController) Profile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	user, err := uc.service.GetProfile(userID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "user not found", nil)
	}

	return utils.SuccessResponse(c, "", user)
}

func (uc *UserController) Logout(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	err := uc.service.Logout(userID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "logged out successfully", nil)
}
