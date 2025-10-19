// services/users/routes/user_routes.go
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
	otpRepo := repository.NewOTPRepository()
	userService := service.NewUserService(userRepo, otpRepo)
	userCtrl := controller.NewUserController(userService)
	adminCtrl := controller.NewAdminController(userService)
	otpCtrl := controller.NewOTPController(userService)

	// Public routes
	v1.Post("/auth/signup", userCtrl.Signup)
	v1.Post("/auth/signin", userCtrl.Signin)
	v1.Post("/auth/admin/login", adminCtrl.AdminLogin) // Separate admin login
	v1.Post("/auth/refresh", userCtrl.RefreshToken)

	// OTP routes (require authentication but not verification)
	auth := v1.Group("/auth", middleware.JWTAuth())
	auth.Post("/verify-otp", otpCtrl.VerifyOTP)
	auth.Post("/resend-otp", otpCtrl.ResendOTP)

	// Secured routes (require verified users)
	secured := v1.Group("/users", middleware.JWTAuth(), middleware.RequireVerified())
	secured.Get("/profile", middleware.RequireRole("user", "admin"), userCtrl.Profile)
	secured.Post("/logout", userCtrl.Logout)
	secured.Get("/", middleware.RequireRole("admin"), userCtrl.GetUsers)
}
