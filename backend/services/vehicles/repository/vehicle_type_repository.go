package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type VehicleTypeRepository interface {
	Create(tx *gorm.DB, vehicleType *models.VehicleType) error
	Update(tx *gorm.DB, vehicleType *models.VehicleType) error
	FindByID(id uint) (*models.VehicleType, error)
	FindAllActive() ([]models.VehicleType, error)
	FindWithPagination(page, limit int, search string) ([]models.VehicleType, int64, error)
	Delete(tx *gorm.DB, id uint) error
}

type vehicleTypeRepository struct{}

func NewVehicleTypeRepository() VehicleTypeRepository {
	return &vehicleTypeRepository{}
}

func (r *vehicleTypeRepository) Create(tx *gorm.DB, vehicleType *models.VehicleType) error {
	return tx.Create(vehicleType).Error
}

func (r *vehicleTypeRepository) Update(tx *gorm.DB, vehicleType *models.VehicleType) error {
	return tx.Save(vehicleType).Error
}

func (r *vehicleTypeRepository) FindByID(id uint) (*models.VehicleType, error) {
	var vehicleType models.VehicleType
	err := database.ReadDB.First(&vehicleType, id).Error
	if err != nil {
		return nil, err
	}
	return &vehicleType, nil
}

func (r *vehicleTypeRepository) FindAllActive() ([]models.VehicleType, error) {
	var vehicleTypes []models.VehicleType
	err := database.ReadDB.Where("is_active = ?", true).Order("priority DESC, name ASC").Find(&vehicleTypes).Error
	return vehicleTypes, err
}

func (r *vehicleTypeRepository) FindWithPagination(page, limit int, search string) ([]models.VehicleType, int64, error) {
	var vehicleTypes []models.VehicleType
	var total int64

	query := database.ReadDB.Model(&models.VehicleType{})

	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * limit
	err := query.Order("priority DESC, created_at DESC").
		Offset(offset).Limit(limit).
		Find(&vehicleTypes).Error

	return vehicleTypes, total, err
}

func (r *vehicleTypeRepository) Delete(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.VehicleType{}, id).Error
}
