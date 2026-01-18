// libs/repository/admin_refresh_token_repository.go
package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type AdminRefreshTokenRepository interface {
	Create(tx *gorm.DB, token *models.AdminRefreshToken) error
	FindByAdminID(adminID uint) (*models.AdminRefreshToken, error)
	DeleteByAdminID(tx *gorm.DB, adminID uint) error
}

type adminRefreshTokenRepository struct{}

func NewAdminRefreshTokenRepository() AdminRefreshTokenRepository {
	return &adminRefreshTokenRepository{}
}

func (r *adminRefreshTokenRepository) Create(tx *gorm.DB, token *models.AdminRefreshToken) error {
	return tx.Create(token).Error
}

func (r *adminRefreshTokenRepository) FindByAdminID(adminID uint) (*models.AdminRefreshToken, error) {
	var token models.AdminRefreshToken
	err := database.ReadDB.Where("admin_id = ?", adminID).First(&token).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

func (r *adminRefreshTokenRepository) DeleteByAdminID(tx *gorm.DB, adminID uint) error {
	return tx.Where("admin_id = ?", adminID).Delete(&models.AdminRefreshToken{}).Error
}
