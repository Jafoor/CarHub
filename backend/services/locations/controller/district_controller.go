package controller

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/locations/service"
)

type DistrictController struct {
	service service.DistrictService
}

func NewDistrictController(service service.DistrictService) *DistrictController {
	return &DistrictController{service: service}
}

func (dc *DistrictController) CreateDistrict(c *fiber.Ctx) error {
	var req service.DistrictRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	district, err := dc.service.CreateDistrict(req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "District created successfully", district)
}

func (dc *DistrictController) UpdateDistrict(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid district ID", nil)
	}

	var req service.DistrictRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	district, err := dc.service.UpdateDistrict(uint(id), req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "District updated successfully", district)
}

func (dc *DistrictController) GetDistrict(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid district ID", nil)
	}

	district, err := dc.service.GetDistrict(uint(id))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "district not found", nil)
	}

	return utils.SuccessResponse(c, "", district)
}

func (dc *DistrictController) GetAllDistricts(c *fiber.Ctx) error {
	districts, err := dc.service.GetAllDistricts()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "", districts)
}

func (dc *DistrictController) GetDistrictsByDivision(c *fiber.Ctx) error {
	divisionID, err := strconv.ParseUint(c.Params("divisionId"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid division ID", nil)
	}

	districts, err := dc.service.GetDistrictsByDivision(uint(divisionID))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "", districts)
}

func (dc *DistrictController) GetDistricts(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	divisionID, _ := strconv.ParseUint(c.Query("division_id", "0"), 10, 32)

	districts, pagination, err := dc.service.GetDistrictsWithPagination(page, limit, search, uint(divisionID))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	response := map[string]interface{}{
		"data":       districts,
		"pagination": pagination,
	}

	return utils.SuccessResponse(c, "Districts retrieved successfully", response)
}

func (dc *DistrictController) DeleteDistrict(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid district ID", nil)
	}

	if err := dc.service.DeleteDistrict(uint(id)); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "District deleted successfully", nil)
}
