// libs/repository/partner_refresh_token_repository.go
package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type PartnerRefreshTokenRepository interface {
	Create(tx *gorm.DB, token *models.PartnerRefreshToken) error
	FindByPartnerID(partnerID uint) (*models.PartnerRefreshToken, error)
	DeleteByPartnerID(tx *gorm.DB, partnerID uint) error
}

type partnerRefreshTokenRepository struct{}

func NewPartnerRefreshTokenRepository() PartnerRefreshTokenRepository {
	return &partnerRefreshTokenRepository{}
}

func (r *partnerRefreshTokenRepository) Create(tx *gorm.DB, token *models.PartnerRefreshToken) error {
	return tx.Create(token).Error
}

func (r *partnerRefreshTokenRepository) FindByPartnerID(partnerID uint) (*models.PartnerRefreshToken, error) {
	var token models.PartnerRefreshToken
	err := database.ReadDB.Where("partner_id = ?", partnerID).First(&token).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

func (r *partnerRefreshTokenRepository) DeleteByPartnerID(tx *gorm.DB, partnerID uint) error {
	return tx.Where("partner_id = ?", partnerID).Delete(&models.PartnerRefreshToken{}).Error
}