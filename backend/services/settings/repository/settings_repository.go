package repository

import (
	"errors"
	"strings"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type SettingsRepository interface {
	// Region
	CreateRegion(tx *gorm.DB, region *models.Region) error
	GetRegion(id uint) (*models.Region, error)
	UpdateRegion(tx *gorm.DB, region *models.Region) error
	DeleteRegion(tx *gorm.DB, id uint) error
	ListRegions(offset, limit int, search string) ([]models.Region, int64, error)

	// City
	CreateCity(tx *gorm.DB, city *models.City) error
	GetCity(id uint) (*models.City, error)
	UpdateCity(tx *gorm.DB, city *models.City) error
	DeleteCity(tx *gorm.DB, id uint) error
	ListCities(offset, limit int, search string, regionID *uint) ([]models.City, int64, error)

	// Area
	CreateArea(tx *gorm.DB, area *models.Area) error
	GetArea(id uint) (*models.Area, error)
	UpdateArea(tx *gorm.DB, area *models.Area) error
	DeleteArea(tx *gorm.DB, id uint) error
	ListAreas(offset, limit int, search string, cityID *uint) ([]models.Area, int64, error)

	// VehicleType
	CreateVehicleType(tx *gorm.DB, vehicleType *models.VehicleType) error
	GetVehicleType(id uint) (*models.VehicleType, error)
	UpdateVehicleType(tx *gorm.DB, vehicleType *models.VehicleType) error
	DeleteVehicleType(tx *gorm.DB, id uint) error
	ListVehicleTypes(offset, limit int, search string) ([]models.VehicleType, int64, error)
}

type settingsRepository struct{}

func NewSettingsRepository() SettingsRepository {
	return &settingsRepository{}
}

// --- Region ---

func (r *settingsRepository) CreateRegion(tx *gorm.DB, region *models.Region) error {
	return tx.Create(region).Error
}

func (r *settingsRepository) GetRegion(id uint) (*models.Region, error) {
	var region models.Region
	err := database.ReadDB.Preload("Cities").First(&region, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &region, nil
}

func (r *settingsRepository) UpdateRegion(tx *gorm.DB, region *models.Region) error {
	return tx.Save(region).Error
}

func (r *settingsRepository) DeleteRegion(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.Region{}, id).Error
}

func (r *settingsRepository) ListRegions(offset, limit int, search string) ([]models.Region, int64, error) {
	var regions []models.Region
	var total int64
	query := database.ReadDB.Model(&models.Region{})

	if search != "" {
		searchLower := strings.ToLower(search)
		query = query.Where("LOWER(name) LIKE ? OR LOWER(display_name) LIKE ?", "%"+searchLower+"%", "%"+searchLower+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Offset(offset).Limit(limit).Order("created_at desc").Find(&regions).Error
	return regions, total, err
}

// --- City ---

func (r *settingsRepository) CreateCity(tx *gorm.DB, city *models.City) error {
	return tx.Create(city).Error
}

func (r *settingsRepository) GetCity(id uint) (*models.City, error) {
	var city models.City
	err := database.ReadDB.Preload("Region").Preload("Areas").First(&city, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &city, nil
}

func (r *settingsRepository) UpdateCity(tx *gorm.DB, city *models.City) error {
	return tx.Save(city).Error
}

func (r *settingsRepository) DeleteCity(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.City{}, id).Error
}

func (r *settingsRepository) ListCities(offset, limit int, search string, regionID *uint) ([]models.City, int64, error) {
	var cities []models.City
	var total int64
	query := database.ReadDB.Model(&models.City{}).Preload("Region")

	if search != "" {
		searchLower := strings.ToLower(search)
		query = query.Where("LOWER(name) LIKE ? OR LOWER(display_name) LIKE ?", "%"+searchLower+"%", "%"+searchLower+"%")
	}
	if regionID != nil {
		query = query.Where("region_id = ?", *regionID)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Offset(offset).Limit(limit).Order("created_at desc").Find(&cities).Error
	return cities, total, err
}

// --- Area ---

func (r *settingsRepository) CreateArea(tx *gorm.DB, area *models.Area) error {
	return tx.Create(area).Error
}

func (r *settingsRepository) GetArea(id uint) (*models.Area, error) {
	var area models.Area
	err := database.ReadDB.Preload("City.Region").First(&area, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &area, nil
}

func (r *settingsRepository) UpdateArea(tx *gorm.DB, area *models.Area) error {
	return tx.Save(area).Error
}

func (r *settingsRepository) DeleteArea(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.Area{}, id).Error
}

func (r *settingsRepository) ListAreas(offset, limit int, search string, cityID *uint) ([]models.Area, int64, error) {
	var areas []models.Area
	var total int64
	query := database.ReadDB.Model(&models.Area{}).Preload("City.Region")

	if search != "" {
		searchLower := strings.ToLower(search)
		query = query.Where("LOWER(name) LIKE ? OR LOWER(display_name) LIKE ?", "%"+searchLower+"%", "%"+searchLower+"%")
	}
	if cityID != nil {
		query = query.Where("city_id = ?", *cityID)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Offset(offset).Limit(limit).Order("created_at desc").Find(&areas).Error
	return areas, total, err
}

// --- VehicleType ---

func (r *settingsRepository) CreateVehicleType(tx *gorm.DB, vehicleType *models.VehicleType) error {
	return tx.Create(vehicleType).Error
}

func (r *settingsRepository) GetVehicleType(id uint) (*models.VehicleType, error) {
	var vehicleType models.VehicleType
	err := database.ReadDB.First(&vehicleType, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &vehicleType, nil
}

func (r *settingsRepository) UpdateVehicleType(tx *gorm.DB, vehicleType *models.VehicleType) error {
	return tx.Save(vehicleType).Error
}

func (r *settingsRepository) DeleteVehicleType(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.VehicleType{}, id).Error
}

func (r *settingsRepository) ListVehicleTypes(offset, limit int, search string) ([]models.VehicleType, int64, error) {
	var vehicleTypes []models.VehicleType
	var total int64
	query := database.ReadDB.Model(&models.VehicleType{})

	if search != "" {
		searchLower := strings.ToLower(search)
		query = query.Where("LOWER(name) LIKE ? OR LOWER(display_name) LIKE ?", "%"+searchLower+"%", "%"+searchLower+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Offset(offset).Limit(limit).Order("created_at desc").Find(&vehicleTypes).Error
	return vehicleTypes, total, err
}
