package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type BrandRepository interface {
	Create(tx *gorm.DB, brand *models.Brand) error
	Update(tx *gorm.DB, brand *models.Brand) error
	FindByID(id uint) (*models.Brand, error)
	FindAllActive() ([]models.Brand, error)
	FindByVehicleType(vehicleTypeID uint) ([]models.Brand, error)
	FindWithPagination(page, limit int, search string, vehicleTypeID uint) ([]models.Brand, int64, error)
	Delete(tx *gorm.DB, id uint) error
}

type brandRepository struct{}

func NewBrandRepository() BrandRepository {
	return &brandRepository{}
}

func (r *brandRepository) Create(tx *gorm.DB, brand *models.Brand) error {
	return tx.Create(brand).Error
}

func (r *brandRepository) Update(tx *gorm.DB, brand *models.Brand) error {
	return tx.Save(brand).Error
}

func (r *brandRepository) FindByID(id uint) (*models.Brand, error) {
	var brand models.Brand
	err := database.ReadDB.Preload("VehicleType").First(&brand, id).Error
	if err != nil {
		return nil, err
	}
	return &brand, nil
}

func (r *brandRepository) FindAllActive() ([]models.Brand, error) {
	var brands []models.Brand
	err := database.ReadDB.Preload("VehicleType").
		Where("is_active = ?", true).
		Order("name ASC").Find(&brands).Error
	return brands, err
}

func (r *brandRepository) FindByVehicleType(vehicleTypeID uint) ([]models.Brand, error) {
	var brands []models.Brand
	err := database.ReadDB.Preload("VehicleType").
		Where("vehicle_type_id = ? AND is_active = ?", vehicleTypeID, true).
		Order("name ASC").Find(&brands).Error
	return brands, err
}

func (r *brandRepository) FindWithPagination(page, limit int, search string, vehicleTypeID uint) ([]models.Brand, int64, error) {
	var brands []models.Brand
	var total int64

	query := database.ReadDB.Model(&models.Brand{}).Preload("VehicleType")

	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	if vehicleTypeID > 0 {
		query = query.Where("vehicle_type_id = ?", vehicleTypeID)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * limit
	err := query.Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&brands).Error

	return brands, total, err
}

func (r *brandRepository) Delete(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.Brand{}, id).Error
}
