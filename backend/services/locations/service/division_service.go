package service

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/services/locations/repository"
	"gorm.io/gorm"
)

type DivisionService interface {
	CreateDivision(req DivisionRequest) (*models.Division, error)
	UpdateDivision(id uint, req DivisionRequest) (*models.Division, error)
	GetDivision(id uint) (*models.Division, error)
	GetAllDivisions() ([]models.Division, error)
	GetDivisionsWithPagination(page, limit int, search string) ([]models.Division, *PaginationInfo, error)
	DeleteDivision(id uint) error
}

type divisionService struct {
	divisionRepo repository.DivisionRepository
}

func NewDivisionService(divisionRepo repository.DivisionRepository) DivisionService {
	return &divisionService{
		divisionRepo: divisionRepo,
	}
}

type DivisionRequest struct {
	Name     string  `json:"name" validate:"required,min=2,max=100"`
	BnName   string  `json:"bn_name"`
	Lat      float64 `json:"lat"`
	Lon      float64 `json:"lon"`
	IsActive bool    `json:"is_active"`
	Priority int     `json:"priority"`
}

type PaginationInfo struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

func (s *divisionService) CreateDivision(req DivisionRequest) (*models.Division, error) {
	division := &models.Division{
		Name:     req.Name,
		BnName:   req.BnName,
		Lat:      req.Lat,
		Lon:      req.Lon,
		IsActive: req.IsActive,
		Priority: req.Priority,
	}

	err := s.divisionRepo.Create(database.WriteDB, division)
	if err != nil {
		return nil, err
	}

	return division, nil
}

func (s *divisionService) UpdateDivision(id uint, req DivisionRequest) (*models.Division, error) {
	division, err := s.divisionRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("division not found")
	}

	division.Name = req.Name
	division.BnName = req.BnName
	division.Lat = req.Lat
	division.Lon = req.Lon
	division.IsActive = req.IsActive
	division.Priority = req.Priority

	err = s.divisionRepo.Update(database.WriteDB, division)
	if err != nil {
		return nil, err
	}

	return division, nil
}

func (s *divisionService) GetDivision(id uint) (*models.Division, error) {
	return s.divisionRepo.FindByID(id)
}

func (s *divisionService) GetAllDivisions() ([]models.Division, error) {
	return s.divisionRepo.FindAllActive()
}

func (s *divisionService) GetDivisionsWithPagination(page, limit int, search string) ([]models.Division, *PaginationInfo, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	divisions, total, err := s.divisionRepo.FindWithPagination(page, limit, search)
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

	return divisions, pagination, nil
}

func (s *divisionService) DeleteDivision(id uint) error {
	return database.WriteDB.Transaction(func(tx *gorm.DB) error {
		return s.divisionRepo.Delete(tx, id)
	})
}
