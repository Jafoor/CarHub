// services/partner/service/otp_service.go
package service

import (
	"crypto/rand"
	"errors"
	"math/big"
	"time"

	"github.com/jafoor/carhub/libs/database" // ← for ExecuteTransaction & ReadDB
	model "github.com/jafoor/carhub/libs/models"
	otpRepository "github.com/jafoor/carhub/libs/repository"
	"github.com/jafoor/carhub/services/partner/repository"
	"gorm.io/gorm"
)

type OTPService interface {
	VerifyOTP(email, otpCode string) error
	ResendOTP(email string) error
}

type otpService struct {
	partnerRepo repository.PartnerRepository
	otpRepo     otpRepository.OTPRepository
}

func NewOTPService(
	partnerRepo repository.PartnerRepository,
	otpRepo otpRepository.OTPRepository,
) OTPService {
	return &otpService{
		partnerRepo: partnerRepo,
		otpRepo:     otpRepo,
	}
}

func generateSecureOTP(length int) (string, error) {
	const digits = "0123456789"
	otp := make([]byte, length)
	for i := range otp {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		otp[i] = digits[num.Int64()]
	}
	return string(otp), nil
}

func (s *otpService) VerifyOTP(email, otpCode string) error {
	partner, err := s.partnerRepo.FindByEmail(email)
	if err != nil || partner == nil {
		return errors.New("partner_not_found")
	}

	otp, err := s.otpRepo.FindValidOTP(
		partner.ID,
		model.OwnerTypePartner,
		otpCode,
		"email_verification",
	)
	if err != nil {
		return errors.New("database_error")
	}
	if otp == nil {
		return errors.New("invalid_or_expired_otp")
	}

	// ✅ USE SHARED TRANSACTION HELPER
	return database.ExecuteTransaction(func(tx *gorm.DB) error {
		if err := s.otpRepo.MarkAsUsed(tx, otp.ID); err != nil {
			return err
		}

		partner.EmailVerified = true
		return s.partnerRepo.Update(tx, partner)
	})
}

func (s *otpService) ResendOTP(email string) error {
	partner, err := s.partnerRepo.FindByEmail(email)
	if err != nil || partner == nil {
		return errors.New("partner_not_found")
	}

	if partner.EmailVerified {
		return errors.New("email_already_verified")
	}

	var count int64
	err = database.ReadDB.Model(&model.OTP{}). // 👈 use shared ReadDB
		Where("owner_id = ? AND owner_type = ? AND purpose = ? AND used = ? AND expires_at > ?",
			partner.ID, model.OwnerTypePartner, "email_verification", false, time.Now()).
		Count(&count).Error

	if err != nil {
		return errors.New("database_error")
	}

	if count > 0 {
		return errors.New("otp_already_sent_wait_for_expiry")
	}

	code, err := generateSecureOTP(6)
	if err != nil {
		return errors.New("otp_generation_failed")
	}

	otp := &model.OTP{
		OwnerID:   partner.ID,
		OwnerType: model.OwnerTypePartner,
		Code:      code,
		Purpose:   "email_verification",
		ExpiresAt: time.Now().Add(10 * time.Minute),
		Used:      false,
	}

	// ✅ USE SHARED TRANSACTION HELPER
	return database.ExecuteTransaction(func(tx *gorm.DB) error {
		return s.otpRepo.Create(tx, otp)
	})
}