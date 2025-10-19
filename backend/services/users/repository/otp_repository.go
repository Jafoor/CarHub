// services/users/repository/otp_repository.go
package repository

import (
	"time"

	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"gorm.io/gorm"
)

type OTPRepository interface {
	Create(tx *gorm.DB, otp *models.OTP) error
	FindValidOTP(userID uint, otpCode, purpose string) (*models.OTP, error)
	MarkAsUsed(tx *gorm.DB, otpID uint) error
	CountRecentOTPs(userID uint, purpose string, duration time.Duration) (int64, error)
	DeleteExpiredOTPs(tx *gorm.DB) error
	DeleteUserOTPs(tx *gorm.DB, userID uint) error
}

type otpRepository struct{}

func NewOTPRepository() OTPRepository {
	return &otpRepository{}
}

func (r *otpRepository) Create(tx *gorm.DB, otp *models.OTP) error {
	return tx.Create(otp).Error
}

func (r *otpRepository) FindValidOTP(userID uint, otpCode, purpose string) (*models.OTP, error) {
	var otp models.OTP
	err := database.ReadDB.
		Where("user_id = ? AND otp_code = ? AND purpose = ? AND used = ? AND expires_at > ?",
			userID, otpCode, purpose, false, time.Now()).
		First(&otp).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &otp, nil
}

func (r *otpRepository) MarkAsUsed(tx *gorm.DB, otpID uint) error {
	return tx.Model(&models.OTP{}).
		Where("id = ?", otpID).
		Update("used", true).Error
}

func (r *otpRepository) CountRecentOTPs(userID uint, purpose string, duration time.Duration) (int64, error) {
	var count int64
	cutoffTime := time.Now().Add(-duration)

	err := database.ReadDB.Model(&models.OTP{}).
		Where("user_id = ? AND purpose = ? AND created_at > ?", userID, purpose, cutoffTime).
		Count(&count).Error

	return count, err
}

func (r *otpRepository) DeleteExpiredOTPs(tx *gorm.DB) error {
	return tx.Where("expires_at < ? OR used = ?", time.Now(), true).
		Delete(&models.OTP{}).Error
}

func (r *otpRepository) DeleteUserOTPs(tx *gorm.DB, userID uint) error {
	return tx.Where("user_id = ?", userID).
		Delete(&models.OTP{}).Error
}
