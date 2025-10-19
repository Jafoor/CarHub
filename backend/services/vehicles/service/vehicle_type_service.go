package service

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/services/vehicles/repository"
	"gorm.io/gorm"
)

type VehicleTypeService interface {
	CreateVehicleType(req VehicleTypeRequest) (*models.VehicleType, error)
	UpdateVehicleType(id uint, req VehicleTypeRequest) (*models.VehicleType, error)
	GetVehicleType(id uint) (*models.VehicleType, error)
	GetAllVehicleTypes() ([]models.VehicleType, error)
	GetVehicleTypesWithPagination(page, limit int, search string) ([]models.VehicleType, *PaginationInfo, error)
	DeleteVehicleType(id uint) error
}

type vehicleTypeService struct {
	vehicleTypeRepo repository.VehicleTypeRepository
}

func NewVehicleTypeService(vehicleTypeRepo repository.VehicleTypeRepository) VehicleTypeService {
	return &vehicleTypeService{
		vehicleTypeRepo: vehicleTypeRepo,
	}
}

type VehicleTypeRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Image    string `json:"image"`
	IsActive bool   `json:"is_active"`
	Priority int    `json:"priority"`
}

type PaginationInfo struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

func (s *vehicleTypeService) CreateVehicleType(req VehicleTypeRequest) (*models.VehicleType, error) {
	vehicleType := &models.VehicleType{
		Name:     req.Name,
		Image:    req.Image,
		IsActive: req.IsActive,
		Priority: req.Priority,
	}

	err := s.vehicleTypeRepo.Create(database.WriteDB, vehicleType)
	if err != nil {
		return nil, err
	}

	return vehicleType, nil
}

func (s *vehicleTypeService) UpdateVehicleType(id uint, req VehicleTypeRequest) (*models.VehicleType, error) {
	vehicleType, err := s.vehicleTypeRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("vehicle type not found")
	}

	vehicleType.Name = req.Name
	vehicleType.Image = req.Image
	vehicleType.IsActive = req.IsActive
	vehicleType.Priority = req.Priority

	err = s.vehicleTypeRepo.Update(database.WriteDB, vehicleType)
	if err != nil {
		return nil, err
	}

	return vehicleType, nil
}

func (s *vehicleTypeService) GetVehicleType(id uint) (*models.VehicleType, error) {
	return s.vehicleTypeRepo.FindByID(id)
}

func (s *vehicleTypeService) GetAllVehicleTypes() ([]models.VehicleType, error) {
	return s.vehicleTypeRepo.FindAllActive()
}

func (s *vehicleTypeService) GetVehicleTypesWithPagination(page, limit int, search string) ([]models.VehicleType, *PaginationInfo, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	vehicleTypes, total, err := s.vehicleTypeRepo.FindWithPagination(page, limit, search)
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

	return vehicleTypes, pagination, nil
}

func (s *vehicleTypeService) DeleteVehicleType(id uint) error {
	return database.WriteDB.Transaction(func(tx *gorm.DB) error {
		return s.vehicleTypeRepo.Delete(tx, id)
	})
}
