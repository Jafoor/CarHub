// services/partner/repository/partner_repository.go
package repository

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	model "github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type PartnerRepository interface {
	Create(tx *gorm.DB, partner *model.Partner) error
	FindByEmail(email string) (*model.Partner, error)
	Update(tx *gorm.DB, partner *model.Partner) error
}

type partnerRepository struct{}

func NewPartnerRepository() PartnerRepository {
	return &partnerRepository{}
}

func (r *partnerRepository) Create(tx *gorm.DB, partner *model.Partner) error {
	return tx.Create(partner).Error
}

func (r *partnerRepository) Update(tx *gorm.DB, partner *model.Partner) error {
	return tx.Save(partner).Error
}

func (r *partnerRepository) FindByEmail(email string) (*model.Partner, error) {
	var partner model.Partner
	err := database.ReadDB.Where("email = ?", email).First(&partner).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &partner, nil
}