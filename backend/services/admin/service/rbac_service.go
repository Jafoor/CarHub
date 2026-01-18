// services/admin/service/rbac_service.go
package service

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/services/admin/repository"
	"gorm.io/gorm"
)

type RBACService interface {
	AssignRoleToAdmin(adminID, roleID uint) error
	AssignPermissionToRole(roleID, permissionID uint) error
	GetAdminRoles(adminID uint) ([]models.AdminRole, error)
	GetRolePermissions(roleID uint) ([]models.AdminPermission, error)
}

type rbacService struct {
	adminRepo        repository.AdminRepository
	roleRepo         repository.AdminRoleRepository
	permissionRepo   repository.AdminPermissionRepository
}

func NewRBACService(
	adminRepo repository.AdminRepository,
	roleRepo repository.AdminRoleRepository,
	permissionRepo repository.AdminPermissionRepository,
) RBACService {
	return &rbacService{
		adminRepo:      adminRepo,
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
	}
}

// AssignRoleToAdmin assigns a role to an admin
func (s *rbacService) AssignRoleToAdmin(adminID, roleID uint) error {
	// Validate admin exists
	admin, err := s.adminRepo.FindByID(adminID)
	if err != nil {
		return errors.New("failed_to_find_admin")
	}
	if admin == nil {
		return errors.New("admin_not_found")
	}

	// Validate role exists
	role, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		return errors.New("failed_to_find_role")
	}
	if role == nil {
		return errors.New("role_not_found")
	}

	// Check if assignment already exists
	existingRoles, err := s.adminRepo.GetAdminRoles(adminID)
	if err != nil {
		return errors.New("failed_to_check_existing_roles")
	}
	for _, r := range existingRoles {
		if r.ID == roleID {
			return errors.New("role_already_assigned")
		}
	}

	// Assign role in transaction
	return database.ExecuteTransaction(func(tx *gorm.DB) error {
		return s.adminRepo.AssignRoleToAdmin(tx, adminID, roleID)
	})
}

// AssignPermissionToRole assigns a permission to a role
func (s *rbacService) AssignPermissionToRole(roleID, permissionID uint) error {
	// Validate role exists
	role, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		return errors.New("failed_to_find_role")
	}
	if role == nil {
		return errors.New("role_not_found")
	}

	// Validate permission exists by checking all permissions
	allPermissions, err := s.permissionRepo.FindAll()
	if err != nil {
		return errors.New("failed_to_check_permissions")
	}
	permissionExists := false
	for _, p := range allPermissions {
		if p.ID == permissionID {
			permissionExists = true
			break
		}
	}
	if !permissionExists {
		return errors.New("permission_not_found")
	}

	// Check if assignment already exists
	existingPermissions, err := s.permissionRepo.GetRolePermissions(roleID)
	if err != nil {
		return errors.New("failed_to_check_existing_permissions")
	}
	for _, p := range existingPermissions {
		if p.ID == permissionID {
			return errors.New("permission_already_assigned")
		}
	}

	// Assign permission in transaction
	return database.ExecuteTransaction(func(tx *gorm.DB) error {
		return s.permissionRepo.AssignPermissionToRole(tx, roleID, permissionID)
	})
}

// GetAdminRoles retrieves all roles assigned to an admin
func (s *rbacService) GetAdminRoles(adminID uint) ([]models.AdminRole, error) {
	// Validate admin exists
	admin, err := s.adminRepo.FindByID(adminID)
	if err != nil {
		return nil, errors.New("failed_to_find_admin")
	}
	if admin == nil {
		return nil, errors.New("admin_not_found")
	}

	return s.adminRepo.GetAdminRoles(adminID)
}

// GetRolePermissions retrieves all permissions assigned to a role
func (s *rbacService) GetRolePermissions(roleID uint) ([]models.AdminPermission, error) {
	// Validate role exists
	role, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		return nil, errors.New("failed_to_find_role")
	}
	if role == nil {
		return nil, errors.New("role_not_found")
	}

	return s.permissionRepo.GetRolePermissions(roleID)
}
