package controller

import (
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/settings/repository"
)

type SettingsController struct {
	repo repository.SettingsRepository
}

func NewSettingsController(repo repository.SettingsRepository) *SettingsController {
	return &SettingsController{repo: repo}
}

// --- Region Handlers ---

type CreateRegionInput struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	IsActive    *bool  `json:"is_active"`
}

func (c *SettingsController) CreateRegion(ctx *fiber.Ctx) error {
	var input CreateRegionInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	if input.Name == "" || input.DisplayName == "" {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Name and Display Name are required", nil)
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	region := &models.Region{
		Name:        input.Name,
		DisplayName: input.DisplayName,
		IsActive:    isActive,
	}

	if err := c.repo.CreateRegion(database.WriteDB, region); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create region", err.Error())
	}

	return utils.SuccessResponse(ctx, "Region created successfully", region)
}

func (c *SettingsController) ListRegions(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	regions, total, err := c.repo.ListRegions(offset, limit, search)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to list regions", err.Error())
	}

	return utils.SuccessResponse(ctx, "Regions retrieved successfully", fiber.Map{
		"items": regions,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (c *SettingsController) GetRegion(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	region, err := c.repo.GetRegion(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get region", err.Error())
	}
	if region == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Region not found", nil)
	}

	return utils.SuccessResponse(ctx, "Region retrieved successfully", region)
}

func (c *SettingsController) UpdateRegion(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	var input CreateRegionInput // Reusing input struct
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	region, err := c.repo.GetRegion(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get region", err.Error())
	}
	if region == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Region not found", nil)
	}

	if input.Name != "" {
		region.Name = input.Name
	}
	if input.DisplayName != "" {
		region.DisplayName = input.DisplayName
	}
	if input.IsActive != nil {
		region.IsActive = *input.IsActive
	}

	if err := c.repo.UpdateRegion(database.WriteDB, region); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update region", err.Error())
	}

	return utils.SuccessResponse(ctx, "Region updated successfully", region)
}

func (c *SettingsController) DeleteRegion(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	region, err := c.repo.GetRegion(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get region", err.Error())
	}
	if region == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Region not found", nil)
	}

	if err := c.repo.DeleteRegion(database.WriteDB, uint(id)); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete region", err.Error())
	}

	return utils.SuccessResponse(ctx, "Region deleted successfully", nil)
}

// --- City Handlers ---

type CreateCityInput struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	RegionID    uint   `json:"region_id"`
	IsActive    *bool  `json:"is_active"`
}

func (c *SettingsController) CreateCity(ctx *fiber.Ctx) error {
	var input CreateCityInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	if input.Name == "" || input.DisplayName == "" || input.RegionID == 0 {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Name, Display Name and Region ID are required", nil)
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	city := &models.City{
		Name:        input.Name,
		DisplayName: input.DisplayName,
		RegionID:    input.RegionID,
		IsActive:    isActive,
	}

	if err := c.repo.CreateCity(database.WriteDB, city); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create city", err.Error())
	}

	return utils.SuccessResponse(ctx, "City created successfully", city)
}

func (c *SettingsController) ListCities(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")
	
	var regionID *uint
	if rid := ctx.Query("region_id"); rid != "" {
		id, err := strconv.Atoi(rid)
		if err == nil {
			uid := uint(id)
			regionID = &uid
		}
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	cities, total, err := c.repo.ListCities(offset, limit, search, regionID)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to list cities", err.Error())
	}

	return utils.SuccessResponse(ctx, "Cities retrieved successfully", fiber.Map{
		"items": cities,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (c *SettingsController) GetCity(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	city, err := c.repo.GetCity(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get city", err.Error())
	}
	if city == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "City not found", nil)
	}

	return utils.SuccessResponse(ctx, "City retrieved successfully", city)
}

func (c *SettingsController) UpdateCity(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	var input CreateCityInput // Reusing input struct
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	city, err := c.repo.GetCity(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get city", err.Error())
	}
	if city == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "City not found", nil)
	}

	if input.Name != "" {
		city.Name = input.Name
	}
	if input.DisplayName != "" {
		city.DisplayName = input.DisplayName
	}
	if input.RegionID != 0 {
		city.RegionID = input.RegionID
	}
	if input.IsActive != nil {
		city.IsActive = *input.IsActive
	}

	if err := c.repo.UpdateCity(database.WriteDB, city); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update city", err.Error())
	}

	return utils.SuccessResponse(ctx, "City updated successfully", city)
}

func (c *SettingsController) DeleteCity(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	city, err := c.repo.GetCity(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get city", err.Error())
	}
	if city == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "City not found", nil)
	}

	if err := c.repo.DeleteCity(database.WriteDB, uint(id)); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete city", err.Error())
	}

	return utils.SuccessResponse(ctx, "City deleted successfully", nil)
}

// --- Area Handlers ---

type CreateAreaInput struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	CityID      uint   `json:"city_id"`
	IsActive    *bool  `json:"is_active"`
}

func (c *SettingsController) CreateArea(ctx *fiber.Ctx) error {
	var input CreateAreaInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	if input.Name == "" || input.DisplayName == "" || input.CityID == 0 {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Name, Display Name and City ID are required", nil)
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	area := &models.Area{
		Name:        input.Name,
		DisplayName: input.DisplayName,
		CityID:      input.CityID,
		IsActive:    isActive,
	}

	if err := c.repo.CreateArea(database.WriteDB, area); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create area", err.Error())
	}

	return utils.SuccessResponse(ctx, "Area created successfully", area)
}

func (c *SettingsController) ListAreas(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")
	
	var cityID *uint
	if cid := ctx.Query("city_id"); cid != "" {
		id, err := strconv.Atoi(cid)
		if err == nil {
			uid := uint(id)
			cityID = &uid
		}
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	areas, total, err := c.repo.ListAreas(offset, limit, search, cityID)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to list areas", err.Error())
	}

	return utils.SuccessResponse(ctx, "Areas retrieved successfully", fiber.Map{
		"items": areas,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (c *SettingsController) GetArea(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	area, err := c.repo.GetArea(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get area", err.Error())
	}
	if area == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Area not found", nil)
	}

	return utils.SuccessResponse(ctx, "Area retrieved successfully", area)
}

func (c *SettingsController) UpdateArea(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	var input CreateAreaInput // Reusing input struct
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	area, err := c.repo.GetArea(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get area", err.Error())
	}
	if area == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Area not found", nil)
	}

	if input.Name != "" {
		area.Name = input.Name
	}
	if input.DisplayName != "" {
		area.DisplayName = input.DisplayName
	}
	if input.CityID != 0 {
		area.CityID = input.CityID
	}
	if input.IsActive != nil {
		area.IsActive = *input.IsActive
	}

	if err := c.repo.UpdateArea(database.WriteDB, area); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update area", err.Error())
	}

	return utils.SuccessResponse(ctx, "Area updated successfully", area)
}

func (c *SettingsController) DeleteArea(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	area, err := c.repo.GetArea(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get area", err.Error())
	}
	if area == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Area not found", nil)
	}

	if err := c.repo.DeleteArea(database.WriteDB, uint(id)); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete area", err.Error())
	}

	return utils.SuccessResponse(ctx, "Area deleted successfully", nil)
}

// --- VehicleType Handlers ---

type CreateVehicleTypeInput struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	IsActive    *bool  `json:"is_active"`
}

func (c *SettingsController) CreateVehicleType(ctx *fiber.Ctx) error {
	var input CreateVehicleTypeInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	if input.Name == "" || input.DisplayName == "" {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Name and Display Name are required", nil)
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	vehicleType := &models.VehicleType{
		Name:        input.Name,
		DisplayName: input.DisplayName,
		IsActive:    isActive,
	}

	if err := c.repo.CreateVehicleType(database.WriteDB, vehicleType); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create vehicle type", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle type created successfully", vehicleType)
}

func (c *SettingsController) ListVehicleTypes(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	vehicleTypes, total, err := c.repo.ListVehicleTypes(offset, limit, search)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to list vehicle types", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle types retrieved successfully", fiber.Map{
		"items": vehicleTypes,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (c *SettingsController) GetVehicleType(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	vehicleType, err := c.repo.GetVehicleType(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get vehicle type", err.Error())
	}
	if vehicleType == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Vehicle type not found", nil)
	}

	return utils.SuccessResponse(ctx, "Vehicle type retrieved successfully", vehicleType)
}

func (c *SettingsController) UpdateVehicleType(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	var input CreateVehicleTypeInput // Reusing input struct
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err.Error())
	}

	vehicleType, err := c.repo.GetVehicleType(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get vehicle type", err.Error())
	}
	if vehicleType == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Vehicle type not found", nil)
	}

	if input.Name != "" {
		vehicleType.Name = input.Name
	}
	if input.DisplayName != "" {
		vehicleType.DisplayName = input.DisplayName
	}
	if input.IsActive != nil {
		vehicleType.IsActive = *input.IsActive
	}

	if err := c.repo.UpdateVehicleType(database.WriteDB, vehicleType); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update vehicle type", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle type updated successfully", vehicleType)
}

func (c *SettingsController) DeleteVehicleType(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	vehicleType, err := c.repo.GetVehicleType(uint(id))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get vehicle type", err.Error())
	}
	if vehicleType == nil {
		return utils.ErrorResponse(ctx, http.StatusNotFound, "Vehicle type not found", nil)
	}

	if err := c.repo.DeleteVehicleType(database.WriteDB, uint(id)); err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete vehicle type", err.Error())
	}

	return utils.SuccessResponse(ctx, "Vehicle type deleted successfully", nil)
}
