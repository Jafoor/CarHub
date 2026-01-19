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

type CreateRoleRequest struct {
	Name         string  `json:"name"`
	DisplayName  string  `json:"display_name"`
	Description  *string `json:"description"`
	IsDefault    bool    `json:"is_default"`
	IsSuperAdmin bool    `json:"is_super_admin"`
}

type UpdateRoleRequest struct {
	Name         string  `json:"name"`
	DisplayName  string  `json:"display_name"`
	Description  *string `json:"description"`
	IsDefault    bool    `json:"is_default"`
	IsSuperAdmin bool    `json:"is_super_admin"`
}

type CreatePermissionRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type UpdatePermissionRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
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

func (rc *RBACController) ListRoles(c *fiber.Ctx) error {
	roles, err := rc.service.ListRoles()
	if err != nil {
		return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve roles", nil)
	}
	return utils.SuccessResponse(c, "Roles retrieved successfully", roles)
}

func (rc *RBACController) CreateRole(c *fiber.Ctx) error {
	var req CreateRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.Name == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "name is required", nil)
	}

	input := service.CreateRoleInput{
		Name:         req.Name,
		DisplayName:  req.DisplayName,
		Description:  req.Description,
		IsDefault:    req.IsDefault,
		IsSuperAdmin: req.IsSuperAdmin,
	}

	role, err := rc.service.CreateRole(input)
	if err != nil {
		switch err.Error() {
		case "role_exists":
			return utils.ErrorResponse(c, http.StatusConflict, "Role with this name already exists", nil)
		case "invalid_role_data":
			return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid role data", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create role", nil)
		}
	}

	return utils.SuccessResponse(c, "Role created successfully", role)
}

func (rc *RBACController) GetRole(c *fiber.Ctx) error {
	roleIDStr := c.Params("roleId")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid role_id", nil)
	}

	role, err := rc.service.GetRole(uint(roleID))
	if err != nil {
		switch err.Error() {
		case "role_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Role not found", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve role", nil)
		}
	}

	return utils.SuccessResponse(c, "Role retrieved successfully", role)
}

func (rc *RBACController) UpdateRole(c *fiber.Ctx) error {
	roleIDStr := c.Params("roleId")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid role_id", nil)
	}

	var req UpdateRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.Name == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "name is required", nil)
	}

	input := service.UpdateRoleInput{
		Name:         req.Name,
		DisplayName:  req.DisplayName,
		Description:  req.Description,
		IsDefault:    req.IsDefault,
		IsSuperAdmin: req.IsSuperAdmin,
	}

	role, err := rc.service.UpdateRole(uint(roleID), input)
	if err != nil {
		switch err.Error() {
		case "role_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Role not found", nil)
		case "role_exists":
			return utils.ErrorResponse(c, http.StatusConflict, "Role with this name already exists", nil)
		case "invalid_role_data":
			return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid role data", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update role", nil)
		}
	}

	return utils.SuccessResponse(c, "Role updated successfully", role)
}

func (rc *RBACController) DeleteRole(c *fiber.Ctx) error {
	roleIDStr := c.Params("roleId")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid role_id", nil)
	}

	err = rc.service.DeleteRole(uint(roleID))
	if err != nil {
		switch err.Error() {
		case "role_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Role not found", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete role", nil)
		}
	}

	return utils.SuccessResponse(c, "Role deleted successfully", nil)
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

func (rc *RBACController) ListPermissions(c *fiber.Ctx) error {
	permissions, err := rc.service.ListPermissions()
	if err != nil {
		return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve permissions", nil)
	}
	return utils.SuccessResponse(c, "Permissions retrieved successfully", permissions)
}

func (rc *RBACController) CreatePermission(c *fiber.Ctx) error {
	var req CreatePermissionRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.Name == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "name is required", nil)
	}

	input := service.CreatePermissionInput{
		Name:        req.Name,
		Description: req.Description,
	}

	permission, err := rc.service.CreatePermission(input)
	if err != nil {
		switch err.Error() {
		case "permission_exists":
			return utils.ErrorResponse(c, http.StatusConflict, "Permission with this name already exists", nil)
		case "invalid_permission_data":
			return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid permission data", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create permission", nil)
		}
	}

	return utils.SuccessResponse(c, "Permission created successfully", permission)
}

func (rc *RBACController) GetPermission(c *fiber.Ctx) error {
	permissionIDStr := c.Params("permissionId")
	permissionID, err := strconv.ParseUint(permissionIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid permission_id", nil)
	}

	permission, err := rc.service.GetPermission(uint(permissionID))
	if err != nil {
		switch err.Error() {
		case "permission_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Permission not found", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve permission", nil)
		}
	}

	return utils.SuccessResponse(c, "Permission retrieved successfully", permission)
}

func (rc *RBACController) UpdatePermission(c *fiber.Ctx) error {
	permissionIDStr := c.Params("permissionId")
	permissionID, err := strconv.ParseUint(permissionIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid permission_id", nil)
	}

	var req UpdatePermissionRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	if req.Name == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "name is required", nil)
	}

	input := service.UpdatePermissionInput{
		Name:        req.Name,
		Description: req.Description,
	}

	permission, err := rc.service.UpdatePermission(uint(permissionID), input)
	if err != nil {
		switch err.Error() {
		case "permission_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Permission not found", nil)
		case "permission_exists":
			return utils.ErrorResponse(c, http.StatusConflict, "Permission with this name already exists", nil)
		case "invalid_permission_data":
			return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid permission data", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update permission", nil)
		}
	}

	return utils.SuccessResponse(c, "Permission updated successfully", permission)
}

func (rc *RBACController) DeletePermission(c *fiber.Ctx) error {
	permissionIDStr := c.Params("permissionId")
	permissionID, err := strconv.ParseUint(permissionIDStr, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid permission_id", nil)
	}

	err = rc.service.DeletePermission(uint(permissionID))
	if err != nil {
		switch err.Error() {
		case "permission_not_found":
			return utils.ErrorResponse(c, http.StatusNotFound, "Permission not found", nil)
		default:
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete permission", nil)
		}
	}

	return utils.SuccessResponse(c, "Permission deleted successfully", nil)
}
