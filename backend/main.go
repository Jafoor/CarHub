package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/logger"
	"github.com/jafoor/carhub/libs/middleware"
	"github.com/jafoor/carhub/services/users/routes"
)

func main() {
	config.LoadConfig()

	database.Connect(database.DBConfig{
		WriteDSN: config.App.WriteDBUrl,
		ReadDSN:  config.App.ReadDBUrl,
	})

	app := fiber.New()

	app.Use(middleware.RequestLogger())
	app.Use(middleware.Recovery())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "CarHub API Running 🚗"})
	})

	routes.RegisterUserRoutes(app)

	port := config.App.ServerPort
	logger.Log.Info().Msgf("Server running on port %s", port)
	app.Listen(fmt.Sprintf(":%s", port))
}
