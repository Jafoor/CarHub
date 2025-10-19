package controller

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/vehicles/service"
)

type BrandController struct {
	service service.BrandService
}

func NewBrandController(service service.BrandService) *BrandController {
	return &BrandController{service: service}
}

func (bc *BrandController) CreateBrand(c *fiber.Ctx) error {
	var req service.BrandRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	brand, err := bc.service.CreateBrand(req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Brand created successfully", brand)
}

func (bc *BrandController) UpdateBrand(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid brand ID", nil)
	}

	var req service.BrandRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	brand, err := bc.service.UpdateBrand(uint(id), req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Brand updated successfully", brand)
}

func (bc *BrandController) GetBrand(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid brand ID", nil)
	}

	brand, err := bc.service.GetBrand(uint(id))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "brand not found", nil)
	}

	return utils.SuccessResponse(c, "", brand)
}

func (bc *BrandController) GetAllBrands(c *fiber.Ctx) error {
	brands, err := bc.service.GetAllBrands()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "", brands)
}

func (bc *BrandController) GetBrandsByVehicleType(c *fiber.Ctx) error {
	vehicleTypeID, err := strconv.ParseUint(c.Params("vehicleTypeId"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid vehicle type ID", nil)
	}

	brands, err := bc.service.GetBrandsByVehicleType(uint(vehicleTypeID))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "", brands)
}

func (bc *BrandController) GetBrands(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	vehicleTypeID, _ := strconv.ParseUint(c.Query("vehicle_type_id", "0"), 10, 32)

	brands, pagination, err := bc.service.GetBrandsWithPagination(page, limit, search, uint(vehicleTypeID))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	response := map[string]interface{}{
		"data":       brands,
		"pagination": pagination,
	}

	return utils.SuccessResponse(c, "Brands retrieved successfully", response)
}

func (bc *BrandController) DeleteBrand(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid brand ID", nil)
	}

	if err := bc.service.DeleteBrand(uint(id)); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Brand deleted successfully", nil)
}
