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

	adminGroup.Get("/profile", authCtrl.GetProfile)
	adminGroup.Put("/profile", authCtrl.UpdateProfile)
	adminGroup.Put("/profile/password", authCtrl.UpdatePassword)

	// RBAC endpoints (require super admin)
	rbacService := service.NewRBACService(adminRepo, roleRepo, permissionRepo)
	rbacCtrl := controller.NewRBACController(rbacService)

	// RBAC management routes (super admin only)
	adminGroup.Get("/roles", middleware.RequireSuperAdmin(), rbacCtrl.ListRoles)
	adminGroup.Post("/roles", middleware.RequireSuperAdmin(), rbacCtrl.CreateRole)
	adminGroup.Get("/roles/:roleId", middleware.RequireSuperAdmin(), rbacCtrl.GetRole)
	adminGroup.Put("/roles/:roleId", middleware.RequireSuperAdmin(), rbacCtrl.UpdateRole)
	adminGroup.Delete("/roles/:roleId", middleware.RequireSuperAdmin(), rbacCtrl.DeleteRole)
	adminGroup.Post("/roles/assign", middleware.RequireSuperAdmin(), rbacCtrl.AssignRoleToAdmin)
	adminGroup.Post("/permissions/assign", middleware.RequireSuperAdmin(), rbacCtrl.AssignPermissionToRole)
	adminGroup.Get("/:adminId/roles", middleware.RequireSuperAdmin(), rbacCtrl.GetAdminRoles)
	adminGroup.Get("/roles/:roleId/permissions", middleware.RequireSuperAdmin(), rbacCtrl.GetRolePermissions)
	adminGroup.Get("/permissions", middleware.RequireSuperAdmin(), rbacCtrl.ListPermissions)
	adminGroup.Post("/permissions", middleware.RequireSuperAdmin(), rbacCtrl.CreatePermission)
	adminGroup.Get("/permissions/:permissionId", middleware.RequireSuperAdmin(), rbacCtrl.GetPermission)
	adminGroup.Put("/permissions/:permissionId", middleware.RequireSuperAdmin(), rbacCtrl.UpdatePermission)
	adminGroup.Delete("/permissions/:permissionId", middleware.RequireSuperAdmin(), rbacCtrl.DeletePermission)

	// User Management (Admin or Super Admin)
	userCtrl := controller.NewAdminUserController()
	adminGroup.Post("/users", middleware.RequireRoles("super_admin", "admin"), userCtrl.CreateAdminUser)
	adminGroup.Get("/users", middleware.RequireRoles("super_admin", "admin"), userCtrl.ListAdminUsers)
	adminGroup.Put("/users/:id", middleware.RequireRoles("super_admin", "admin"), userCtrl.UpdateAdminUser)
	adminGroup.Delete("/users/:id", middleware.RequireRoles("super_admin", "admin"), userCtrl.DeleteAdminUser)
}
