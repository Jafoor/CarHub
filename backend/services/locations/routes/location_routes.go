package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/middleware"
	"github.com/jafoor/carhub/services/locations/controller"
	"github.com/jafoor/carhub/services/locations/repository"
	"github.com/jafoor/carhub/services/locations/service"
)

func RegisterLocationRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")

	// Initialize dependencies
	divisionRepo := repository.NewDivisionRepository()
	districtRepo := repository.NewDistrictRepository()

	divisionService := service.NewDivisionService(divisionRepo)
	districtService := service.NewDistrictService(districtRepo)

	divisionCtrl := controller.NewDivisionController(divisionService)
	districtCtrl := controller.NewDistrictController(districtService)

	// Division Routes
	divisions := v1.Group("/divisions", middleware.JWTAuth(), middleware.RequireVerified())
	divisions.Post("/", middleware.RequireRole("admin"), divisionCtrl.CreateDivision)
	divisions.Put("/:id", middleware.RequireRole("admin"), divisionCtrl.UpdateDivision)
	divisions.Get("/", divisionCtrl.GetDivisions)
	divisions.Get("/all", divisionCtrl.GetAllDivisions)
	divisions.Get("/:id", divisionCtrl.GetDivision)
	divisions.Delete("/:id", middleware.RequireRole("admin"), divisionCtrl.DeleteDivision)

	// District Routes
	districts := v1.Group("/districts", middleware.JWTAuth(), middleware.RequireVerified())
	districts.Post("/", middleware.RequireRole("admin"), districtCtrl.CreateDistrict)
	districts.Put("/:id", middleware.RequireRole("admin"), districtCtrl.UpdateDistrict)
	districts.Get("/", districtCtrl.GetDistricts)
	districts.Get("/all", districtCtrl.GetAllDistricts)
	districts.Get("/division/:divisionId", districtCtrl.GetDistrictsByDivision)
	districts.Get("/:id", districtCtrl.GetDistrict)
	districts.Delete("/:id", middleware.RequireRole("admin"), districtCtrl.DeleteDistrict)
}
