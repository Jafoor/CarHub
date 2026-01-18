// services/admin/controller/rbac_controller.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/admin/service"
)

type RBACController struct {
	service service.RBACService
}

func NewRBACController(s service.RBACService) *RBACController {
	return &RBACController{service: s}
}

type AssignRoleToAdminRequest struct {
	AdminID uint `json:"admin_id" validate:"required"`
	RoleID  uint `json:"role_id" validate:"required"`
}

// AssignRoleToAdmin assigns a role to an admin
func (rc *RBACController) AssignRoleToAdmin(c *fiber.Ctx) error {
	var req AssignRoleToAdminRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.AdminID == 0 || req.RoleID == 0 {
		return utils.ErrorResponse(c, http.StatusBadRequest, "admin_id and role_id are required", nil)
	}

	err := rc.service.AssignRoleToAdmin(req.AdminID, req.RoleID)
	if err != nil {
		switch err.Error() {
		case "admin_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Admin not found", nil)
		case "role_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Role not found", nil)
		case "role_already_assigned":
			return utils.ErrorResponse(c, http.StatusConflict, "Role already assigned to admin", nil)
		case "failed_to_find_admin", "failed_to_find_role", "failed_to_check_existing_roles":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to process request", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to assign role", nil)
		}
	}

	return utils.SuccessResponse(c, "Role assigned successfully", nil)
}

type AssignPermissionToRoleRequest struct {
	RoleID       uint `json:"role_id" validate:"required"`
	PermissionID uint `json:"permission_id" validate:"required"`
}

// AssignPermissionToRole assigns a permission to a role
func (rc *RBACController) AssignPermissionToRole(c *fiber.Ctx) error {
	var req AssignPermissionToRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.RoleID == 0 || req.PermissionID == 0 {
		return utils.ErrorResponse(c, http.StatusBadRequest, "role_id and permission_id are required", nil)
	}

	err := rc.service.AssignPermissionToRole(req.RoleID, req.PermissionID)
	if err != nil {
		switch err.Error() {
		case "role_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Role not found", nil)
		case "permission_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Permission not found", nil)
		case "permission_already_assigned":
			return utils.ErrorResponse(c, http.StatusConflict, "Permission already assigned to role", nil)
		case "failed_to_find_role", "failed_to_check_permissions", "failed_to_check_existing_permissions":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to process request", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to assign permission", nil)
		}
	}

	return utils.SuccessResponse(c, "Permission assigned successfully", nil)
}

// GetAdminRoles retrieves all roles assigned to an admin
func (rc *RBACController) GetAdminRoles(c *fiber.Ctx) error {
	adminIDStr := c.Params("adminId")
	adminID, err := strconv.ParseUint(adminIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid admin_id", nil)
	}

	roles, err := rc.service.GetAdminRoles(uint(adminID))
	if err != nil {
		switch err.Error() {
		case "admin_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Admin not found", nil)
		case "failed_to_find_admin":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve admin", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve roles", nil)
		}
	}

	return utils.SuccessResponse(c, "Roles retrieved successfully", roles)
}

// GetRolePermissions retrieves all permissions assigned to a role
func (rc *RBACController) GetRolePermissions(c *fiber.Ctx) error {
	roleIDStr := c.Params("roleId")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid role_id", nil)
	}

	permissions, err := rc.service.GetRolePermissions(uint(roleID))
	if err != nil {
		switch err.Error() {
		case "role_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Role not found", nil)
		case "failed_to_find_role":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve role", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve permissions", nil)
		}
	}

	return utils.SuccessResponse(c, "Permissions retrieved successfully", permissions)
}
