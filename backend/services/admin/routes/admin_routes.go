// services/admin/routes/admin_routes.go
package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/middleware"
	adminRefreshTokenRepo "github.com/jafoor/carhub/libs/repository"
	"github.com/jafoor/carhub/services/admin/controller"
	"github.com/jafoor/carhub/services/admin/repository"
	"github.com/jafoor/carhub/services/admin/service"
)

func RegisterAdminRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")

	// Dependencies
	adminRepo := repository.NewAdminRepository()
	roleRepo := repository.NewAdminRoleRepository()
	permissionRepo := repository.NewAdminPermissionRepository()
	refreshTokenRepo := adminRefreshTokenRepo.NewAdminRefreshTokenRepository()

	// Auth endpoints (public)
	authService := service.NewAuthService(adminRepo, refreshTokenRepo)
	authCtrl := controller.NewAuthController(authService)

	v1.Post("/admin/signin", authCtrl.Signin)
	v1.Post("/admin/refresh", authCtrl.RefreshToken)

	// Protected admin routes group
	adminGroup := v1.Group("/admin", middleware.RequireAdminAuth())

	// RBAC endpoints (require super admin)
	rbacService := service.NewRBACService(adminRepo, roleRepo, permissionRepo)
	rbacCtrl := controller.NewRBACController(rbacService)

	// RBAC management routes (super admin only)
	adminGroup.Post("/roles/assign", middleware.RequireSuperAdmin(), rbacCtrl.AssignRoleToAdmin)
	adminGroup.Post("/permissions/assign", middleware.RequireSuperAdmin(), rbacCtrl.AssignPermissionToRole)
	adminGroup.Get("/:adminId/roles", middleware.RequireSuperAdmin(), rbacCtrl.GetAdminRoles)
	adminGroup.Get("/roles/:roleId/permissions", middleware.RequireSuperAdmin(), rbacCtrl.GetRolePermissions)
}
