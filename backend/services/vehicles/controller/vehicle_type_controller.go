package controller

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/vehicles/service"
)

type VehicleTypeController struct {
	service service.VehicleTypeService
}

func NewVehicleTypeController(service service.VehicleTypeService) *VehicleTypeController {
	return &VehicleTypeController{service: service}
}

func (vc *VehicleTypeController) CreateVehicleType(c *fiber.Ctx) error {
	var req service.VehicleTypeRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	vehicleType, err := vc.service.CreateVehicleType(req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Vehicle type created successfully", vehicleType)
}

func (vc *VehicleTypeController) UpdateVehicleType(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid vehicle type ID", nil)
	}

	var req service.VehicleTypeRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid request", nil)
	}

	vehicleType, err := vc.service.UpdateVehicleType(uint(id), req)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Vehicle type updated successfully", vehicleType)
}

func (vc *VehicleTypeController) GetVehicleType(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid vehicle type ID", nil)
	}

	vehicleType, err := vc.service.GetVehicleType(uint(id))
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "vehicle type not found", nil)
	}

	return utils.SuccessResponse(c, "", vehicleType)
}

func (vc *VehicleTypeController) GetAllVehicleTypes(c *fiber.Ctx) error {
	vehicleTypes, err := vc.service.GetAllVehicleTypes()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "", vehicleTypes)
}

func (vc *VehicleTypeController) GetVehicleTypes(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	vehicleTypes, pagination, err := vc.service.GetVehicleTypesWithPagination(page, limit, search)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	response := map[string]interface{}{
		"data":       vehicleTypes,
		"pagination": pagination,
	}

	return utils.SuccessResponse(c, "Vehicle types retrieved successfully", response)
}

func (vc *VehicleTypeController) DeleteVehicleType(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "invalid vehicle type ID", nil)
	}

	if err := vc.service.DeleteVehicleType(uint(id)); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, err.Error(), nil)
	}

	return utils.SuccessResponse(c, "Vehicle type deleted successfully", nil)
}
