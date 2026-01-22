package repository

import (
	"errors"
	"strings"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

// --- VehicleBrand ---

func (r *settingsRepository) CreateVehicleBrand(tx *gorm.DB, vehicleBrand *models.VehicleBrand) error {
	return tx.Create(vehicleBrand).Error
}

func (r *settingsRepository) GetVehicleBrand(id uint) (*models.VehicleBrand, error) {
	var vehicleBrand models.VehicleBrand
	err := database.ReadDB.Preload("VehicleType").First(&vehicleBrand, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &vehicleBrand, nil
}

func (r *settingsRepository) UpdateVehicleBrand(tx *gorm.DB, vehicleBrand *models.VehicleBrand) error {
	return tx.Save(vehicleBrand).Error
}

func (r *settingsRepository) DeleteVehicleBrand(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.VehicleBrand{}, id).Error
}

func (r *settingsRepository) ListVehicleBrands(offset, limit int, search string, vehicleTypeID *uint) ([]models.VehicleBrand, int64, error) {
	var vehicleBrands []models.VehicleBrand
	var total int64
	query := database.ReadDB.Model(&models.VehicleBrand{}).Preload("VehicleType")

	if search != "" {
		searchLower := strings.ToLower(search)
		query = query.Where("LOWER(name) LIKE ? OR LOWER(display_name) LIKE ?", "%"+searchLower+"%", "%"+searchLower+"%")
	}
	if vehicleTypeID != nil {
		query = query.Where("vehicle_type_id = ?", *vehicleTypeID)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Offset(offset).Limit(limit).Order("created_at desc").Find(&vehicleBrands).Error
	return vehicleBrands, total, err
}

func (r *settingsRepository) GetVehicleBrandsByVehicleType(vehicleTypeID uint) ([]models.VehicleBrand, error) {
	var vehicleBrands []models.VehicleBrand
	err := database.ReadDB.Model(&models.VehicleBrand{}).
		Where("vehicle_type_id = ? AND is_active = ?", vehicleTypeID, true).
		Order("display_name asc").
		Find(&vehicleBrands).Error
	return vehicleBrands, err
}
