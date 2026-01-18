// services/partner/routes/partner_routes.go
package routes

import (
	"github.com/gofiber/fiber/v2"
	otpRepository "github.com/jafoor/carhub/libs/repository"
	"github.com/jafoor/carhub/services/partner/controller"
	"github.com/jafoor/carhub/services/partner/repository"
	"github.com/jafoor/carhub/services/partner/service"
)

func RegisterPartnerRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")

	// Dependencies
	partnerRepo := repository.NewPartnerRepository()
	otpRepo := otpRepository.NewOTPRepository()
	refreshTokenRepo := otpRepository.NewPartnerRefreshTokenRepository()

	partnerService := service.NewPartnerService(partnerRepo, otpRepo)
	partnerCtrl := controller.NewPartnerController(partnerService)

	// Public routes
	v1.Post("/partners/signup", partnerCtrl.Signup)

	// OTP endpoints
	otpService := service.NewOTPService(partnerRepo, otpRepo)
	otpCtrl := controller.NewOTPController(otpService)
	v1.Post("/partners/verify-otp", otpCtrl.VerifyOTP)
	v1.Post("/partners/resend-otp", otpCtrl.ResendOTP)

	// Add to RegisterPartnerRoutes
	authService := service.NewAuthService(partnerRepo, refreshTokenRepo)
	authCtrl := controller.NewAuthController(authService)

	v1.Post("/partners/signin", authCtrl.Signin)
	v1.Post("/partners/refresh", authCtrl.RefreshToken)
}