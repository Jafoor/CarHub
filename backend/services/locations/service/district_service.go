package service

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/services/locations/repository"
	"gorm.io/gorm"
)

type DistrictService interface {
	CreateDistrict(req DistrictRequest) (*models.District, error)
	UpdateDistrict(id uint, req DistrictRequest) (*models.District, error)
	GetDistrict(id uint) (*models.District, error)
	GetAllDistricts() ([]models.District, error)
	GetDistrictsByDivision(divisionID uint) ([]models.District, error)
	GetDistrictsWithPagination(page, limit int, search string, divisionID uint) ([]models.District, *PaginationInfo, error)
	DeleteDistrict(id uint) error
}

type districtService struct {
	districtRepo repository.DistrictRepository
}

func NewDistrictService(districtRepo repository.DistrictRepository) DistrictService {
	return &districtService{
		districtRepo: districtRepo,
	}
}

type DistrictRequest struct {
	Name       string  `json:"name" validate:"required,min=2,max=100"`
	DivisionID uint    `json:"division_id" validate:"required"`
	BnName     string  `json:"bn_name"`
	Lat        float64 `json:"lat"`
	Lon        float64 `json:"lon"`
	IsActive   bool    `json:"is_active"`
}

func (s *districtService) CreateDistrict(req DistrictRequest) (*models.District, error) {
	district := &models.District{
		Name:       req.Name,
		DivisionID: req.DivisionID,
		BnName:     req.BnName,
		Lat:        req.Lat,
		Lon:        req.Lon,
		IsActive:   req.IsActive,
	}

	err := s.districtRepo.Create(database.WriteDB, district)
	if err != nil {
		return nil, err
	}

	return s.districtRepo.FindByID(district.ID)
}

func (s *districtService) UpdateDistrict(id uint, req DistrictRequest) (*models.District, error) {
	district, err := s.districtRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("district not found")
	}

	district.Name = req.Name
	district.DivisionID = req.DivisionID
	district.BnName = req.BnName
	district.Lat = req.Lat
	district.Lon = req.Lon
	district.IsActive = req.IsActive

	err = s.districtRepo.Update(database.WriteDB, district)
	if err != nil {
		return nil, err
	}

	return s.districtRepo.FindByID(district.ID)
}

func (s *districtService) GetDistrict(id uint) (*models.District, error) {
	return s.districtRepo.FindByID(id)
}

func (s *districtService) GetAllDistricts() ([]models.District, error) {
	return s.districtRepo.FindAllActive()
}

func (s *districtService) GetDistrictsByDivision(divisionID uint) ([]models.District, error) {
	return s.districtRepo.FindByDivision(divisionID)
}

func (s *districtService) GetDistrictsWithPagination(page, limit int, search string, divisionID uint) ([]models.District, *PaginationInfo, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	districts, total, err := s.districtRepo.FindWithPagination(page, limit, search, divisionID)
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

	return districts, pagination, nil
}

func (s *districtService) DeleteDistrict(id uint) error {
	return database.WriteDB.Transaction(func(tx *gorm.DB) error {
		return s.districtRepo.Delete(tx, id)
	})
}
