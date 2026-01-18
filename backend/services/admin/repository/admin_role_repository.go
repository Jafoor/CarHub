package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type AdminRoleRepository interface {
	Create(tx *gorm.DB, role *models.AdminRole) error
	FindAll() ([]models.AdminRole, error)
	FindByID(id uint) (*models.AdminRole, error)
	FindByName(name string) (*models.AdminRole, error)
}

type adminRoleRepository struct{}

func NewAdminRoleRepository() AdminRoleRepository {
	return &adminRoleRepository{}
}

func (r *adminRoleRepository) Create(tx *gorm.DB, role *models.AdminRole) error {
	return tx.Create(role).Error
}

func (r *adminRoleRepository) FindAll() ([]models.AdminRole, error) {
	var roles []models.AdminRole
	err := database.ReadDB.Find(&roles).Error
	return roles, err
}

func (r *adminRoleRepository) FindByID(id uint) (*models.AdminRole, error) {
	var role models.AdminRole
	err := database.ReadDB.First(&role, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &role, nil
}

func (r *adminRoleRepository) FindByName(name string) (*models.AdminRole, error) {
	var role models.AdminRole
	err := database.ReadDB.Where("name = ?", name).First(&role).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &role, nil
}