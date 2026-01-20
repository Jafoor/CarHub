// libs/repository/admin_repository.go
package repository

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type AdminRepository interface {
	Create(tx *gorm.DB, admin *models.Admin) error
	FindByEmail(email string) (*models.Admin, error)
	FindByID(id uint) (*models.Admin, error)
	Update(tx *gorm.DB, admin *models.Admin) error
	Delete(tx *gorm.DB, id uint) error
	List(offset, limit int, filter map[string]interface{}, search string) ([]models.Admin, int64, error)
	GetAdminRoles(adminID uint) ([]models.AdminRole, error)
	AssignRoleToAdmin(tx *gorm.DB, adminID, roleID uint) error
	ClearAdminRoles(tx *gorm.DB, adminID uint) error
	FindByEmailUnscoped(email string) (*models.Admin, error)
}

type adminRepository struct{}

func NewAdminRepository() AdminRepository {
	return &adminRepository{}
}

func (r *adminRepository) Create(tx *gorm.DB, admin *models.Admin) error {
	return tx.Create(admin).Error
}

func (r *adminRepository) FindByEmail(email string) (*models.Admin, error) {
	var admin models.Admin
	err := database.ReadDB.Where("email = ?", email).First(&admin).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &admin, nil
}

func (r *adminRepository) FindByEmailUnscoped(email string) (*models.Admin, error) {
	var admin models.Admin
	err := database.ReadDB.Unscoped().Where("email = ?", email).First(&admin).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &admin, nil
}

func (r *adminRepository) FindByID(id uint) (*models.Admin, error) {
	var admin models.Admin
	err := database.ReadDB.First(&admin, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &admin, nil
}

func (r *adminRepository) Update(tx *gorm.DB, admin *models.Admin) error {
	return tx.Save(admin).Error
}

func (r *adminRepository) Delete(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.Admin{}, id).Error
}

func (r *adminRepository) List(offset, limit int, filter map[string]interface{}, search string) ([]models.Admin, int64, error) {
	var admins []models.Admin
	var total int64
	
	query := database.ReadDB.Table("admins")

	// Apply filters
	if val, ok := filter["email"]; ok && val != "" {
		query = query.Where("admins.email = ?", val)
	}
	if val, ok := filter["phone"]; ok && val != "" {
		query = query.Where("admins.phone = ?", val)
	}
	if val, ok := filter["is_active"]; ok {
		query = query.Where("admins.is_active = ?", val)
	}
	if val, ok := filter["role_id"]; ok {
		query = query.Joins("JOIN admin_user_roles ON admins.id = admin_user_roles.admin_id").
			Where("admin_user_roles.role_id = ?", val)
	}

	// Apply search (First Name or Last Name)
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("admins.first_name ILIKE ? OR admins.last_name ILIKE ?", searchPattern, searchPattern)
	}

	// Count total before pagination
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination with eager loading
	// Use Select("admins.*") only if strictly necessary, but with Table("admins") and Model, default * is usually fine.
	// However, to be safe against the join ambiguity, let's explicitly select admins.* but ensure it works by using the Table context.
	// Actually, if we don't have joins (common case), we don't need it. 
	// If we DO have joins, we need it.
	// Let's conditionally add it again, but this time we are using Table("admins") at the start.
	
	if _, ok := filter["role_id"]; ok {
		query = query.Select("admins.*")
	}

	err := query.Model(&models.Admin{}).Preload("Roles").Order("admins.created_at DESC").Offset(offset).Limit(limit).Find(&admins).Error
	
	return admins, total, err
}

func (r *adminRepository) GetAdminRoles(adminID uint) ([]models.AdminRole, error) {
	var roles []models.AdminRole
	err := database.ReadDB.
		Joins("JOIN admin_user_roles ON admin_roles.id = admin_user_roles.role_id").
		Where("admin_user_roles.admin_id = ?", adminID).
		Find(&roles).Error
	return roles, err
}

func (r *adminRepository) AssignRoleToAdmin(tx *gorm.DB, adminID, roleID uint) error {
	type AdminUserRole struct {
		AdminID uint `gorm:"primaryKey"`
		RoleID  uint `gorm:"primaryKey"`
	}
	return tx.Table("admin_user_roles").Create(&AdminUserRole{
		AdminID: adminID,
		RoleID:  roleID,
	}).Error
}

func (r *adminRepository) ClearAdminRoles(tx *gorm.DB, adminID uint) error {
	return tx.Table("admin_user_roles").Where("admin_id = ?", adminID).Delete(nil).Error
}
