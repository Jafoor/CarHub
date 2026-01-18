package middleware

import (
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/auth"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/admin/repository"
)

const (
	AdminIDKey   = "admin_id"
	AdminClaimsKey = "admin_claims"
)

// RequireAdminAuth validates admin JWT token and checks if admin is active
func RequireAdminAuth() fiber.Handler {
	adminRepo := repository.NewAdminRepository()

	return func(c *fiber.Ctx) error {
		// Extract token from Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Authorization header required", nil)
		}

		// Extract Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid authorization header format", nil)
		}

		token := parts[1]

		// Verify token
		claims, err := auth.VerifyAdminToken(token)
		if err != nil {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token", nil)
		}

		// Check if admin exists and is active
		admin, err := adminRepo.FindByID(claims.AdminID)
		if err != nil || admin == nil {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Admin not found", nil)
		}

		if !admin.IsActive {
			return utils.ErrorResponse(c, http.StatusForbidden, "Admin account is inactive", nil)
		}

		// Store admin info in context for downstream handlers
		c.Locals(AdminIDKey, claims.AdminID)
		c.Locals(AdminClaimsKey, claims)

		return c.Next()
	}
}

// RequireSuperAdmin checks if admin has super_admin role
func RequireSuperAdmin() fiber.Handler {
	adminRepo := repository.NewAdminRepository()

	return func(c *fiber.Ctx) error {
		// First ensure admin is authenticated
		adminID, ok := c.Locals(AdminIDKey).(uint)
		if !ok {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Admin authentication required", nil)
		}

		// Get admin roles
		roles, err := adminRepo.GetAdminRoles(adminID)
		if err != nil {
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve admin roles", nil)
		}

		// Check if admin has super_admin role
		for _, role := range roles {
			if role.IsSuperAdmin || role.Name == "super_admin" {
				return c.Next()
			}
		}

		return utils.ErrorResponse(c, http.StatusForbidden, "Super admin access required", nil)
	}
}

// RequirePermission creates a middleware that checks if admin has the required permission
// Super admins automatically pass, non-super admins must have the specific permission
func RequirePermission(permissionName string) fiber.Handler {
	permissionRepo := repository.NewAdminPermissionRepository()

	return func(c *fiber.Ctx) error {
		// First ensure admin is authenticated
		adminID, ok := c.Locals(AdminIDKey).(uint)
		if !ok {
			return utils.ErrorResponse(c, http.StatusUnauthorized, "Admin authentication required", nil)
		}

		// Check permission (HasPermission already handles super admin bypass)
		hasPermission, err := permissionRepo.HasPermission(adminID, permissionName)
		if err != nil {
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to check permission", nil)
		}

		if !hasPermission {
			return utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions", nil)
		}

		return c.Next()
	}
}

// GetAdminID extracts admin ID from context
func GetAdminID(c *fiber.Ctx) (uint, error) {
	adminID, ok := c.Locals(AdminIDKey).(uint)
	if !ok {
		return 0, fiber.NewError(http.StatusUnauthorized, "Admin ID not found in context")
	}
	return adminID, nil
}

// GetAdminClaims extracts admin claims from context
func GetAdminClaims(c *fiber.Ctx) (*auth.AdminClaims, error) {
	claims, ok := c.Locals(AdminClaimsKey).(*auth.AdminClaims)
	if !ok {
		return nil, fiber.NewError(http.StatusUnauthorized, "Admin claims not found in context")
	}
	return claims, nil
}
