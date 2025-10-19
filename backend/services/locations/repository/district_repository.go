package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type DistrictRepository interface {
	Create(tx *gorm.DB, district *models.District) error
	Update(tx *gorm.DB, district *models.District) error
	FindByID(id uint) (*models.District, error)
	FindAllActive() ([]models.District, error)
	FindByDivision(divisionID uint) ([]models.District, error)
	FindWithPagination(page, limit int, search string, divisionID uint) ([]models.District, int64, error)
	Delete(tx *gorm.DB, id uint) error
}

type districtRepository struct{}

func NewDistrictRepository() DistrictRepository {
	return &districtRepository{}
}

func (r *districtRepository) Create(tx *gorm.DB, district *models.District) error {
	return tx.Create(district).Error
}

func (r *districtRepository) Update(tx *gorm.DB, district *models.District) error {
	return tx.Save(district).Error
}

func (r *districtRepository) FindByID(id uint) (*models.District, error) {
	var district models.District
	err := database.ReadDB.Preload("Division").First(&district, id).Error
	if err != nil {
		return nil, err
	}
	return &district, nil
}

func (r *districtRepository) FindAllActive() ([]models.District, error) {
	var districts []models.District
	err := database.ReadDB.Preload("Division").
		Where("is_active = ?", true).
		Order("name ASC").Find(&districts).Error
	return districts, err
}

func (r *districtRepository) FindByDivision(divisionID uint) ([]models.District, error) {
	var districts []models.District
	err := database.ReadDB.Preload("Division").
		Where("division_id = ? AND is_active = ?", divisionID, true).
		Order("name ASC").Find(&districts).Error
	return districts, err
}

func (r *districtRepository) FindWithPagination(page, limit int, search string, divisionID uint) ([]models.District, int64, error) {
	var districts []models.District
	var total int64

	query := database.ReadDB.Model(&models.District{}).Preload("Division")

	if search != "" {
		query = query.Where("name ILIKE ? OR bn_name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if divisionID > 0 {
		query = query.Where("division_id = ?", divisionID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&districts).Error

	return districts, total, err
}

func (r *districtRepository) Delete(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.District{}, id).Error
}
