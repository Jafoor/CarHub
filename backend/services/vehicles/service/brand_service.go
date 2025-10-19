package service

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/services/vehicles/repository"
	"gorm.io/gorm"
)

type BrandService interface {
	CreateBrand(req BrandRequest) (*models.Brand, error)
	UpdateBrand(id uint, req BrandRequest) (*models.Brand, error)
	GetBrand(id uint) (*models.Brand, error)
	GetAllBrands() ([]models.Brand, error)
	GetBrandsByVehicleType(vehicleTypeID uint) ([]models.Brand, error)
	GetBrandsWithPagination(page, limit int, search string, vehicleTypeID uint) ([]models.Brand, *PaginationInfo, error)
	DeleteBrand(id uint) error
}

type brandService struct {
	brandRepo repository.BrandRepository
}

func NewBrandService(brandRepo repository.BrandRepository) BrandService {
	return &brandService{
		brandRepo: brandRepo,
	}
}

type BrandRequest struct {
	Name          string `json:"name" validate:"required,min=2,max=100"`
	VehicleTypeID uint   `json:"vehicle_type_id" validate:"required"`
	Image         string `json:"image"`
	IsActive      bool   `json:"is_active"`
	Description   string `json:"description"`
}

func (s *brandService) CreateBrand(req BrandRequest) (*models.Brand, error) {
	brand := &models.Brand{
		Name:          req.Name,
		VehicleTypeID: req.VehicleTypeID,
		Image:         req.Image,
		IsActive:      req.IsActive,
		Description:   req.Description,
	}

	err := s.brandRepo.Create(database.WriteDB, brand)
	if err != nil {
		return nil, err
	}

	// Reload with vehicle type data
	return s.brandRepo.FindByID(brand.ID)
}

func (s *brandService) UpdateBrand(id uint, req BrandRequest) (*models.Brand, error) {
	brand, err := s.brandRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("brand not found")
	}

	brand.Name = req.Name
	brand.VehicleTypeID = req.VehicleTypeID
	brand.Image = req.Image
	brand.IsActive = req.IsActive
	brand.Description = req.Description

	err = s.brandRepo.Update(database.WriteDB, brand)
	if err != nil {
		return nil, err
	}

	return s.brandRepo.FindByID(brand.ID)
}

func (s *brandService) GetBrand(id uint) (*models.Brand, error) {
	return s.brandRepo.FindByID(id)
}

func (s *brandService) GetAllBrands() ([]models.Brand, error) {
	return s.brandRepo.FindAllActive()
}

func (s *brandService) GetBrandsByVehicleType(vehicleTypeID uint) ([]models.Brand, error) {
	return s.brandRepo.FindByVehicleType(vehicleTypeID)
}

func (s *brandService) GetBrandsWithPagination(page, limit int, search string, vehicleTypeID uint) ([]models.Brand, *PaginationInfo, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	brands, total, err := s.brandRepo.FindWithPagination(page, limit, search, vehicleTypeID)
	if err != nil {
		return nil, nil, err
	}

	totalPages := (int(total) + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	pagination := &PaginationInfo{
		Page:       page,
		Limit:      limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return brands, pagination, nil
}

func (s *brandService) DeleteBrand(id uint) error {
	return database.WriteDB.Transaction(func(tx *gorm.DB) error {
		return s.brandRepo.Delete(tx, id)
	})
}
