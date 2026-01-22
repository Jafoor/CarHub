package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/middleware"
	"github.com/jafoor/carhub/services/settings/controller"
	"github.com/jafoor/carhub/services/settings/repository"
)

func RegisterSettingsRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")
	settingsGroup := v1.Group("/settings", middleware.RequireAdminAuth())

	settingsRepo := repository.NewSettingsRepository()
	settingsCtrl := controller.NewSettingsController(settingsRepo)

	// Middleware to restrict modification to admin or super_admin
	// Note: RequireRoles("admin") allows both "admin" and "super_admin" roles (super_admin bypass)
	restrictModification := middleware.RequireRoles("admin")

	// Region Routes
	settingsGroup.Post("/regions", restrictModification, settingsCtrl.CreateRegion)
	settingsGroup.Get("/regions", settingsCtrl.ListRegions)
	settingsGroup.Get("/regions/:id", settingsCtrl.GetRegion)
	settingsGroup.Put("/regions/:id", restrictModification, settingsCtrl.UpdateRegion)
	settingsGroup.Delete("/regions/:id", restrictModification, settingsCtrl.DeleteRegion)

	// City Routes
	settingsGroup.Post("/cities", restrictModification, settingsCtrl.CreateCity)
	settingsGroup.Get("/cities", settingsCtrl.ListCities)
	settingsGroup.Get("/cities/:id", settingsCtrl.GetCity)
	settingsGroup.Put("/cities/:id", restrictModification, settingsCtrl.UpdateCity)
	settingsGroup.Delete("/cities/:id", restrictModification, settingsCtrl.DeleteCity)

	// Area Routes
	settingsGroup.Post("/areas", restrictModification, settingsCtrl.CreateArea)
	settingsGroup.Get("/areas", settingsCtrl.ListAreas)
	settingsGroup.Get("/areas/:id", settingsCtrl.GetArea)
	settingsGroup.Put("/areas/:id", restrictModification, settingsCtrl.UpdateArea)
	settingsGroup.Delete("/areas/:id", restrictModification, settingsCtrl.DeleteArea)

	// Vehicle Type Routes
	settingsGroup.Post("/vehicle-types", restrictModification, settingsCtrl.CreateVehicleType)
	settingsGroup.Get("/vehicle-types", settingsCtrl.ListVehicleTypes)
	settingsGroup.Get("/vehicle-types/:id", settingsCtrl.GetVehicleType)
	settingsGroup.Put("/vehicle-types/:id", restrictModification, settingsCtrl.UpdateVehicleType)
	settingsGroup.Delete("/vehicle-types/:id", restrictModification, settingsCtrl.DeleteVehicleType)

	// Vehicle Brand Routes
	settingsGroup.Post("/vehicle-brands", restrictModification, settingsCtrl.CreateVehicleBrand)
	settingsGroup.Get("/vehicle-brands", settingsCtrl.ListVehicleBrands)
	settingsGroup.Get("/vehicle-brands/:id", settingsCtrl.GetVehicleBrand)
	settingsGroup.Put("/vehicle-brands/:id", restrictModification, settingsCtrl.UpdateVehicleBrand)
	settingsGroup.Delete("/vehicle-brands/:id", restrictModification, settingsCtrl.DeleteVehicleBrand)

	// Public Routes (No Auth)
	publicGroup := v1.Group("/public/settings")
	publicGroup.Get("/vehicle-brands/by-vehicle-type/:vehicleTypeID", settingsCtrl.GetVehicleBrandsByVehicleType)
}
