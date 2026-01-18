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