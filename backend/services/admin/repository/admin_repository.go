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
	
	query := database.ReadDB.Model(&models.Admin{})

	// Apply filters
	if val, ok := filter["email"]; ok && val != "" {
		query = query.Where("email = ?", val)
	}
	if val, ok := filter["phone"]; ok && val != "" {
		query = query.Where("phone = ?", val)
	}

	// Apply search (First Name or Last Name)
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ?", searchPattern, searchPattern)
	}

	// Count total before pagination
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&admins).Error
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