package repository

import (
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type DivisionRepository interface {
	Create(tx *gorm.DB, division *models.Division) error
	Update(tx *gorm.DB, division *models.Division) error
	FindByID(id uint) (*models.Division, error)
	FindAllActive() ([]models.Division, error)
	FindWithPagination(page, limit int, search string) ([]models.Division, int64, error)
	Delete(tx *gorm.DB, id uint) error
}

type divisionRepository struct{}

func NewDivisionRepository() DivisionRepository {
	return &divisionRepository{}
}

func (r *divisionRepository) Create(tx *gorm.DB, division *models.Division) error {
	return tx.Create(division).Error
}

func (r *divisionRepository) Update(tx *gorm.DB, division *models.Division) error {
	return tx.Save(division).Error
}

func (r *divisionRepository) FindByID(id uint) (*models.Division, error) {
	var division models.Division
	err := database.ReadDB.First(&division, id).Error
	if err != nil {
		return nil, err
	}
	return &division, nil
}

func (r *divisionRepository) FindAllActive() ([]models.Division, error) {
	var divisions []models.Division
	err := database.ReadDB.Where("is_active = ?", true).Order("priority DESC, name ASC").Find(&divisions).Error
	return divisions, err
}

func (r *divisionRepository) FindWithPagination(page, limit int, search string) ([]models.Division, int64, error) {
	var divisions []models.Division
	var total int64

	query := database.ReadDB.Model(&models.Division{})

	if search != "" {
		query = query.Where("name ILIKE ? OR bn_name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Order("priority DESC, created_at DESC").
		Offset(offset).Limit(limit).
		Find(&divisions).Error

	return divisions, total, err
}

func (r *divisionRepository) Delete(tx *gorm.DB, id uint) error {
	return tx.Delete(&models.Division{}, id).Error
}
