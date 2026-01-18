// services/partner/repository/partner_repository.go
package repository

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type PartnerRepository interface {
	Create(tx *gorm.DB, partner *models.Partner) error
	FindByEmail(email string) (*models.Partner, error)
	Update(tx *gorm.DB, partner *models.Partner) error
	FindByID(id uint) (*models.Partner, error)
}

type partnerRepository struct{}

func NewPartnerRepository() PartnerRepository {
	return &partnerRepository{}
}

func (r *partnerRepository) Create(tx *gorm.DB, partner *models.Partner) error {
	return tx.Create(partner).Error
}

func (r *partnerRepository) Update(tx *gorm.DB, partner *models.Partner) error {
	return tx.Save(partner).Error
}

func (r *partnerRepository) FindByEmail(email string) (*models.Partner, error) {
	var partner models.Partner
	err := database.ReadDB.Where("email = ?", email).First(&partner).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &partner, nil
}

// In partner_repository.go
func (r *partnerRepository) FindByID(id uint) (*models.Partner, error) {
	var p models.Partner
	err := database.ReadDB.First(&p, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}