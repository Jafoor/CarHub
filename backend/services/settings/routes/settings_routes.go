package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/middleware"
	"github.com/jafoor/carhub/services/settings/controller"
)

func RegisterSettingsRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")
	settingsGroup := v1.Group("/settings", middleware.RequireAdminAuth())

	settingsCtrl := controller.NewSettingsController()

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
}
