package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/logger"
	"github.com/jafoor/carhub/libs/middleware"
	adminRoutes "github.com/jafoor/carhub/services/admin/routes"
	partnerRoutes "github.com/jafoor/carhub/services/partner/routes"
)

func main() {
	config.LoadConfig()

	database.Connect(database.DBConfig{
		WriteDSN: config.App.WriteDBUrl,
		ReadDSN:  config.App.ReadDBUrl,
	})

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://127.0.0.1:3000", // Your Next.js frontend URL
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours
	}))

	app.Use(middleware.RequestLogger())
	app.Use(middleware.Recovery())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "CarHub API Running 🚗"})
	})

	partnerRoutes.RegisterPartnerRoutes(app)
	adminRoutes.RegisterAdminRoutes(app)

	port := config.App.ServerPort
	logger.Log.Info().Msgf("Server running on port %s", port)
	app.Listen(fmt.Sprintf(":%s", port))
}
