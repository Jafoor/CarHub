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
	CreateRole(input CreateRoleInput) (*models.AdminRole, error)
	UpdateRole(roleID uint, input UpdateRoleInput) (*models.AdminRole, error)
	DeleteRole(roleID uint) error
	GetRole(roleID uint) (*models.AdminRole, error)
	ListRoles() ([]models.AdminRole, error)
	CreatePermission(input CreatePermissionInput) (*models.AdminPermission, error)
	UpdatePermission(permissionID uint, input UpdatePermissionInput) (*models.AdminPermission, error)
	DeletePermission(permissionID uint) error
	GetPermission(permissionID uint) (*models.AdminPermission, error)
	ListPermissions() ([]models.AdminPermission, error)
}

type rbacService struct {
	adminRepo        repository.AdminRepository
	roleRepo         repository.AdminRoleRepository
	permissionRepo   repository.AdminPermissionRepository
}

type CreateRoleInput struct {
	Name         string
	DisplayName  string
	Description  *string
	IsDefault    bool
	IsSuperAdmin bool
}

type UpdateRoleInput struct {
	Name         string
	DisplayName  string
	Description  *string
	IsDefault    bool
	IsSuperAdmin bool
}

type CreatePermissionInput struct {
	Name        string
	Description *string
}

type UpdatePermissionInput struct {
	Name        string
	Description *string
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

func (s *rbacService) CreateRole(input CreateRoleInput) (*models.AdminRole, error) {
	if input.Name == "" {
		return nil, errors.New("invalid_role_data")
	}

	existing, err := s.roleRepo.FindByName(input.Name)
	if err != nil {
		return nil, errors.New("failed_to_create_role")
	}
	if existing != nil {
		return nil, errors.New("role_exists")
	}

	role := &models.AdminRole{
		Name:         input.Name,
		DisplayName:  input.DisplayName,
		Description:  input.Description,
		IsDefault:    input.IsDefault,
		IsSuperAdmin: input.IsSuperAdmin,
	}

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		return s.roleRepo.Create(tx, role)
	})
	if err != nil {
		return nil, errors.New("failed_to_create_role")
	}

	return role, nil
}

func (s *rbacService) UpdateRole(roleID uint, input UpdateRoleInput) (*models.AdminRole, error) {
	role, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		return nil, errors.New("failed_to_update_role")
	}
	if role == nil {
		return nil, errors.New("role_not_found")
	}

	if input.Name == "" {
		return nil, errors.New("invalid_role_data")
	}

	if input.Name != role.Name {
		existing, err := s.roleRepo.FindByName(input.Name)
		if err != nil {
			return nil, errors.New("failed_to_update_role")
		}
		if existing != nil && existing.ID != roleID {
			return nil, errors.New("role_exists")
		}
	}

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		role.Name = input.Name
		role.DisplayName = input.DisplayName
		role.Description = input.Description
		role.IsDefault = input.IsDefault
		role.IsSuperAdmin = input.IsSuperAdmin
		return s.roleRepo.Update(tx, role)
	})
	if err != nil {
		return nil, errors.New("failed_to_update_role")
	}

	return role, nil
}

func (s *rbacService) DeleteRole(roleID uint) error {
	role, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		return errors.New("failed_to_delete_role")
	}
	if role == nil {
		return errors.New("role_not_found")
	}

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		if err := tx.Table("admin_user_roles").Where("role_id = ?", roleID).Delete(nil).Error; err != nil {
			return err
		}
		if err := tx.Table("admin_role_permissions").Where("role_id = ?", roleID).Delete(nil).Error; err != nil {
			return err
		}
		return s.roleRepo.Delete(tx, roleID)
	})
	if err != nil {
		return errors.New("failed_to_delete_role")
	}

	return nil
}

func (s *rbacService) GetRole(roleID uint) (*models.AdminRole, error) {
	role, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		return nil, errors.New("failed_to_get_role")
	}
	if role == nil {
		return nil, errors.New("role_not_found")
	}
	return role, nil
}

func (s *rbacService) ListRoles() ([]models.AdminRole, error) {
	roles, err := s.roleRepo.FindAll()
	if err != nil {
		return nil, errors.New("failed_to_list_roles")
	}
	return roles, nil
}

func (s *rbacService) CreatePermission(input CreatePermissionInput) (*models.AdminPermission, error) {
	if input.Name == "" {
		return nil, errors.New("invalid_permission_data")
	}

	existing, err := s.permissionRepo.FindByName(input.Name)
	if err != nil {
		return nil, errors.New("failed_to_create_permission")
	}
	if existing != nil {
		return nil, errors.New("permission_exists")
	}

	permission := &models.AdminPermission{
		Name:        input.Name,
		Description: input.Description,
	}

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		return s.permissionRepo.Create(tx, permission)
	})
	if err != nil {
		return nil, errors.New("failed_to_create_permission")
	}

	return permission, nil
}

func (s *rbacService) UpdatePermission(permissionID uint, input UpdatePermissionInput) (*models.AdminPermission, error) {
	permission, err := s.permissionRepo.FindByID(permissionID)
	if err != nil {
		return nil, errors.New("failed_to_update_permission")
	}
	if permission == nil {
		return nil, errors.New("permission_not_found")
	}

	if input.Name == "" {
		return nil, errors.New("invalid_permission_data")
	}

	if input.Name != permission.Name {
		existing, err := s.permissionRepo.FindByName(input.Name)
		if err != nil {
			return nil, errors.New("failed_to_update_permission")
		}
		if existing != nil && existing.ID != permissionID {
			return nil, errors.New("permission_exists")
		}
	}

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		permission.Name = input.Name
		permission.Description = input.Description
		return s.permissionRepo.Update(tx, permission)
	})
	if err != nil {
		return nil, errors.New("failed_to_update_permission")
	}

	return permission, nil
}

func (s *rbacService) DeletePermission(permissionID uint) error {
	permission, err := s.permissionRepo.FindByID(permissionID)
	if err != nil {
		return errors.New("failed_to_delete_permission")
	}
	if permission == nil {
		return errors.New("permission_not_found")
	}

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		if err := tx.Table("admin_role_permissions").Where("permission_id = ?", permissionID).Delete(nil).Error; err != nil {
			return err
		}
		return s.permissionRepo.Delete(tx, permissionID)
	})
	if err != nil {
		return errors.New("failed_to_delete_permission")
	}

	return nil
}

func (s *rbacService) GetPermission(permissionID uint) (*models.AdminPermission, error) {
	permission, err := s.permissionRepo.FindByID(permissionID)
	if err != nil {
		return nil, errors.New("failed_to_get_permission")
	}
	if permission == nil {
		return nil, errors.New("permission_not_found")
	}
	return permission, nil
}

func (s *rbacService) ListPermissions() ([]models.AdminPermission, error) {
	permissions, err := s.permissionRepo.FindAll()
	if err != nil {
		return nil, errors.New("failed_to_list_permissions")
	}
	return permissions, nil
}
