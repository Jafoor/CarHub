package controller

import (
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/libs/utils"
)

// --- VehicleBrand Handlers ---

type CreateVehicleBrandInput struct {
	Name          string `json:"name"`
	DisplayName   string `json:"display_name"`
	VehicleTypeID uint   `json:"vehicle_type_id"`
	IsActive      *bool  `json:"is_active"`
}

func (c *SettingsController) CreateVehicleBrand(ctx *fiber.Ctx) error {
	var input CreateVehicleBrandInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	if input.Name == "" || input.DisplayName == "" || input.VehicleTypeID == 0 {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Name, Display Name and Vehicle Type ID are required", nil)
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	vehicleBrand := &models.VehicleBrand{
		Name:          input.Name,
		DisplayName:   input.DisplayName,
		VehicleTypeID: input.VehicleTypeID,
		IsActive:      isActive,
	}

	if err := c.repo.CreateVehicleBrand(database.WriteDB, vehicleBrand); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create vehicle brand", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle brand created successfully", vehicleBrand)
}

func (c *SettingsController) ListVehicleBrands(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")

	var vehicleTypeID *uint
	if vid := ctx.Query("vehicle_type_id"); vid != "" {
		id, err := strconv.Atoi(vid)
		if err == nil {
			uid := uint(id)
			vehicleTypeID = &uid
		}
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	vehicleBrands, total, err := c.repo.ListVehicleBrands(offset, limit, search, vehicleTypeID)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to list vehicle brands", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle brands retrieved successfully", fiber.Map{
		"items": vehicleBrands,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (c *SettingsController) GetVehicleBrand(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	vehicleBrand, err := c.repo.GetVehicleBrand(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get vehicle brand", err.Error())
	}
	if vehicleBrand == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Vehicle brand not found", nil)
	}

	return utils.SuccessResponse(ctx, "Vehicle brand retrieved successfully", vehicleBrand)
}

func (c *SettingsController) UpdateVehicleBrand(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	var input CreateVehicleBrandInput // Reusing input struct
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	vehicleBrand, err := c.repo.GetVehicleBrand(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get vehicle brand", err.Error())
	}
	if vehicleBrand == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Vehicle brand not found", nil)
	}

	if input.Name != "" {
		vehicleBrand.Name = input.Name
	}
	if input.DisplayName != "" {
		vehicleBrand.DisplayName = input.DisplayName
	}
	if input.VehicleTypeID != 0 {
		vehicleBrand.VehicleTypeID = input.VehicleTypeID
	}
	if input.IsActive != nil {
		vehicleBrand.IsActive = *input.IsActive
	}

	if err := c.repo.UpdateVehicleBrand(database.WriteDB, vehicleBrand); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update vehicle brand", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle brand updated successfully", vehicleBrand)
}

func (c *SettingsController) DeleteVehicleBrand(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	vehicleBrand, err := c.repo.GetVehicleBrand(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get vehicle brand", err.Error())
	}
	if vehicleBrand == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Vehicle brand not found", nil)
	}

	if err := c.repo.DeleteVehicleBrand(database.WriteDB, uint(id)); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete vehicle brand", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle brand deleted successfully", nil)
}

// Public Endpoint
func (c *SettingsController) GetVehicleBrandsByVehicleType(ctx *fiber.Ctx) error {
	vehicleTypeID, err := strconv.Atoi(ctx.Params("vehicleTypeID"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid Vehicle Type ID", nil)
	}

	vehicleBrands, err := c.repo.GetVehicleBrandsByVehicleType(uint(vehicleTypeID))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get vehicle brands", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle brands retrieved successfully", vehicleBrands)
}
