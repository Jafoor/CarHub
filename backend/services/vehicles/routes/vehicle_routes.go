package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/middleware"
	"github.com/jafoor/carhub/services/vehicles/controller"
	"github.com/jafoor/carhub/services/vehicles/repository"
	"github.com/jafoor/carhub/services/vehicles/service"
)

func RegisterVehicleRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")

	// Initialize dependencies
	vehicleTypeRepo := repository.NewVehicleTypeRepository()
	brandRepo := repository.NewBrandRepository()

	vehicleTypeService := service.NewVehicleTypeService(vehicleTypeRepo)
	brandService := service.NewBrandService(brandRepo)

	vehicleTypeCtrl := controller.NewVehicleTypeController(vehicleTypeService)
	brandCtrl := controller.NewBrandController(brandService)

	// Vehicle Type Routes
	vehicleTypes := v1.Group("/vehicle-types", middleware.JWTAuth(), middleware.RequireVerified())
	vehicleTypes.Post("/", middleware.RequireRole("admin"), vehicleTypeCtrl.CreateVehicleType)
	vehicleTypes.Put("/:id", middleware.RequireRole("admin"), vehicleTypeCtrl.UpdateVehicleType)
	vehicleTypes.Get("/", vehicleTypeCtrl.GetVehicleTypes)
	vehicleTypes.Get("/all", vehicleTypeCtrl.GetAllVehicleTypes)
	vehicleTypes.Get("/:id", vehicleTypeCtrl.GetVehicleType)
	vehicleTypes.Delete("/:id", middleware.RequireRole("admin"), vehicleTypeCtrl.DeleteVehicleType)

	// Brand Routes
	brands := v1.Group("/brands", middleware.JWTAuth(), middleware.RequireVerified())
	brands.Post("/", middleware.RequireRole("admin"), brandCtrl.CreateBrand)
	brands.Put("/:id", middleware.RequireRole("admin"), brandCtrl.UpdateBrand)
	brands.Get("/", brandCtrl.GetBrands)
	brands.Get("/all", brandCtrl.GetAllBrands)
	brands.Get("/vehicle-type/:vehicleTypeId", brandCtrl.GetBrandsByVehicleType)
	brands.Get("/:id", brandCtrl.GetBrand)
	brands.Delete("/:id", middleware.RequireRole("admin"), brandCtrl.DeleteBrand)
}
