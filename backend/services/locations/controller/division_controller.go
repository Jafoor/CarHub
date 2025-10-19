package controller

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/locations/service"
)

type DivisionController struct {
	service service.DivisionService
}

func NewDivisionController(service service.DivisionService) *DivisionController {
	return &DivisionController{service: service}
}

func (dc *DivisionController) CreateDivision(c *fiber.Ctx) error {
	var req service.DivisionRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	division, err := dc.service.CreateDivision(req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Division created successfully", division)
}

func (dc *DivisionController) UpdateDivision(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid division ID", nil)
	}

	var req service.DivisionRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	division, err := dc.service.UpdateDivision(uint(id), req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Division updated successfully", division)
}

func (dc *DivisionController) GetDivision(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid division ID", nil)
	}

	division, err := dc.service.GetDivision(uint(id))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "division not found", nil)
	}

	return utils.SuccessResponse(c, "", division)
}

func (dc *DivisionController) GetAllDivisions(c *fiber.Ctx) error {
	divisions, err := dc.service.GetAllDivisions()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "", divisions)
}

func (dc *DivisionController) GetDivisions(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	divisions, pagination, err := dc.service.GetDivisionsWithPagination(page, limit, search)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	response := map[string]interface{}{
		"data":       divisions,
		"pagination": pagination,
	}

	return utils.SuccessResponse(c, "Divisions retrieved successfully", response)
}

func (dc *DivisionController) DeleteDivision(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid division ID", nil)
	}

	if err := dc.service.DeleteDivision(uint(id)); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Division deleted successfully", nil)
}
