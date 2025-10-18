package repository

import (
	"errors"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(tx *gorm.DB, user *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindRoleByName(name string) (*models.Role, error)
	CreateRefreshToken(tx *gorm.DB, token *models.RefreshToken) error
	ReplaceRefreshToken(tx *gorm.DB, token *models.RefreshToken) error
	FindRefreshTokensByUser(userID uint) ([]models.RefreshToken, error)
	FindByPhone(phone string) (*models.User, error)
	Update(tx *gorm.DB, user *models.User) error
}

type userRepository struct{}

func NewUserRepository() UserRepository {
	return &userRepository{}
}

func (r *userRepository) Create(tx *gorm.DB, user *models.User) error {
	return tx.Create(user).Error
}

func (r *userRepository) Update(tx *gorm.DB, user *models.User) error {
	return tx.Save(user).Error
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := database.ReadDB.Preload("Role").Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindRoleByName(name string) (*models.Role, error) {
	var role models.Role
	err := database.ReadDB.Where("name = ?", name).First(&role).Error
	return &role, err
}

func (r *userRepository) CreateRefreshToken(tx *gorm.DB, token *models.RefreshToken) error {
	return tx.Create(token).Error
}

func (r *userRepository) ReplaceRefreshToken(tx *gorm.DB, token *models.RefreshToken) error {
	if err := tx.Where("user_id = ?", token.UserID).Delete(&models.RefreshToken{}).Error; err != nil {
		return err
	}
	return tx.Create(token).Error
}

func (r *userRepository) FindRefreshTokensByUser(userID uint) ([]models.RefreshToken, error) {
	var tokens []models.RefreshToken
	err := database.ReadDB.Where("user_id = ?", userID).Find(&tokens).Error
	return tokens, err
}

func (r *userRepository) FindByPhone(phone string) (*models.User, error) {
	var user models.User
	err := database.ReadDB.Where("phone = ?", phone).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetUsersWithPagination(query *gorm.DB, page, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
