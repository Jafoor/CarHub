package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/middleware"
	"github.com/jafoor/carhub/services/users/controller"
	"github.com/jafoor/carhub/services/users/repository"
	"github.com/jafoor/carhub/services/users/service"
)

func RegisterUserRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")

	// Initialize dependencies
	userRepo := repository.NewUserRepository()
	userService := service.NewUserService(userRepo)
	userCtrl := controller.NewUserController(userService)

	v1.Post("/auth/signup", userCtrl.Signup)
	v1.Post("/auth/signin", userCtrl.Signin)
	v1.Post("/auth/refresh", userCtrl.RefreshToken)

	secured := v1.Group("/users", middleware.JWTAuth())
	secured.Get("/profile", middleware.RequireRole("user", "admin"), userCtrl.Profile)
	secured.Post("/logout", userCtrl.Logout)
	secured.Get("/", middleware.RequireRole("admin"), userCtrl.GetUsers)

}
