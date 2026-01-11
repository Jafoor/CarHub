// libs/repository/otp_repository.go
package repository

import (
	"time"

	"github.com/jafoor/carhub/libs/database"
	model "github.com/jafoor/carhub/libs/models"

	"gorm.io/gorm"
)

type OTPRepository interface {
	Create(tx *gorm.DB, otp *model.OTP) error
	FindValidOTP(ownerID uint, ownerType model.OwnerType, code, purpose string) (*model.OTP, error)
	MarkAsUsed(tx *gorm.DB, otpID uint) error
	CountRecentOTPs(ownerID uint, ownerType model.OwnerType, purpose string, duration time.Duration) (int64, error)
	DeleteExpiredOTPs(tx *gorm.DB) error
}

type otpRepository struct{}

func NewOTPRepository() OTPRepository {
	return &otpRepository{}
}

func (r *otpRepository) Create(tx *gorm.DB, otp *model.OTP) error {
	return tx.Create(otp).Error
}

func (r *otpRepository) FindValidOTP(
	ownerID uint,
	ownerType model.OwnerType,
	code, purpose string,
) (*model.OTP, error) {
	var otp model.OTP
	err := database.ReadDB.
		Where("owner_id = ? AND owner_type = ? AND purpose = ? AND code = ? AND used = ? AND expires_at > ?",
			ownerID, ownerType, purpose, code, false, time.Now()).
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
	return tx.Model(&model.OTP{}).
		Where("id = ?", otpID).
		Update("used", true).Error
}

func (r *otpRepository) CountRecentOTPs(
	ownerID uint,
	ownerType model.OwnerType,
	purpose string,
	duration time.Duration,
) (int64, error) {
	var count int64
	cutoffTime := time.Now().Add(-duration)

	err := database.ReadDB.Model(&model.OTP{}).
		Where("owner_id = ? AND owner_type = ? AND purpose = ? AND created_at > ?",
			ownerID, ownerType, purpose, cutoffTime).
		Count(&count).Error

	return count, err
}

func (r *otpRepository) DeleteExpiredOTPs(tx *gorm.DB) error {
	return tx.Where("expires_at < ? OR used = ?", time.Now(), true).
		Delete(&model.OTP{}).Error
}