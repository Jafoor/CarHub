package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type AdminPermissionRepository interface {
	Create(tx *gorm.DB, permission *models.AdminPermission) error
	FindAll() ([]models.AdminPermission, error)
	FindByName(name string) (*models.AdminPermission, error)
	AssignPermissionToRole(tx *gorm.DB, roleID, permissionID uint) error
	GetRolePermissions(roleID uint) ([]models.AdminPermission, error)
	HasPermission(adminID uint, permissionName string) (bool, error)
}

type adminPermissionRepository struct{}

func NewAdminPermissionRepository() AdminPermissionRepository {
	return &adminPermissionRepository{}
}

func (r *adminPermissionRepository) Create(tx *gorm.DB, permission *models.AdminPermission) error {
	return tx.Create(permission).Error
}

func (r *adminPermissionRepository) FindAll() ([]models.AdminPermission, error) {
	var permissions []models.AdminPermission
	err := database.ReadDB.Find(&permissions).Error
	return permissions, err
}

func (r *adminPermissionRepository) FindByName(name string) (*models.AdminPermission, error) {
	var permission models.AdminPermission
	err := database.ReadDB.Where("name = ?", name).First(&permission).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &permission, nil
}

func (r *adminPermissionRepository) AssignPermissionToRole(tx *gorm.DB, roleID, permissionID uint) error {
	type RolePermission struct {
		RoleID       uint `gorm:"primaryKey"`
		PermissionID uint `gorm:"primaryKey"`
	}
	return tx.Create(&RolePermission{RoleID: roleID, PermissionID: permissionID}).Error
}

func (r *adminPermissionRepository) GetRolePermissions(roleID uint) ([]models.AdminPermission, error) {
	var permissions []models.AdminPermission
	err := database.ReadDB.
		Joins("JOIN admin_role_permissions ON admin_permissions.id = admin_role_permissions.permission_id").
		Where("admin_role_permissions.role_id = ?", roleID).
		Find(&permissions).Error
	return permissions, err
}

// HasPermission checks if admin has the required permission
func (r *adminPermissionRepository) HasPermission(adminID uint, permissionName string) (bool, error) {
	// First, check if admin has super admin role
	var superAdminCount int64
	err := database.ReadDB.
		Table("admins").
		Joins("JOIN admin_user_roles ON admins.id = admin_user_roles.admin_id").
		Joins("JOIN admin_roles ON admin_user_roles.role_id = admin_roles.id").
		Where("admins.id = ? AND admin_roles.is_super_admin = true", adminID).
		Count(&superAdminCount).Error
	
	if err != nil {
		return false, err
	}
	
	if superAdminCount > 0 {
		return true, nil // Super admin has all permissions
	}

	// Normal RBAC check
	var count int64
	err = database.ReadDB.
		Table("admins").
		Joins("JOIN admin_user_roles ON admins.id = admin_user_roles.admin_id").
		Joins("JOIN admin_role_permissions ON admin_user_roles.role_id = admin_role_permissions.role_id").
		Joins("JOIN admin_permissions ON admin_role_permissions.permission_id = admin_permissions.id").
		Where("admins.id = ? AND admin_permissions.name = ?", adminID, permissionName).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}