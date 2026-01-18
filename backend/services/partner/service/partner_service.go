// services/partner/service/partner_service.go
package service

import (
	"crypto/rand"
	"errors"
	"math/big"
	"strings"
	"time"

	"github.com/jafoor/carhub/libs/database" // ← for ExecuteTransaction & DB
	"github.com/jafoor/carhub/libs/models"
	otpRepository "github.com/jafoor/carhub/libs/repository"
	"github.com/jafoor/carhub/services/partner/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type SignupInput struct {
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	Email     string  `json:"email"`
	Phone     *string `json:"phone"`
	Password  string  `json:"password"`
}

type SignupResponse struct {
	Email      string `json:"email"`
	NextAction string `json:"next_action"` // "verify_otp"
}

type PartnerService interface {
	Signup(req SignupInput) (*SignupResponse, error)
}

type partnerService struct {
	partnerRepo repository.PartnerRepository
	otpRepo     otpRepository.OTPRepository
}

func NewPartnerService(
	partnerRepo repository.PartnerRepository,
	otpRepo otpRepository.OTPRepository,
) PartnerService {
	return &partnerService{
		partnerRepo: partnerRepo,
		otpRepo:     otpRepo,
	}
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func generateOTP(length int) (string, error) {
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

func (s *partnerService) Signup(req SignupInput) (*SignupResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	existing, err := s.partnerRepo.FindByEmail(email)
	if err != nil {
		return nil, errors.New("database_error")
	}

	if existing != nil {
		if existing.Status == models.StatusUnverified && !existing.EmailVerified {
			return &SignupResponse{
				Email:      email,
				NextAction: "verify_otp",
			}, nil
		}
		return nil, errors.New("email_already_registered")
	}

	pwHash, err := hashPassword(req.Password)
	if err != nil {
		return nil, errors.New("password_hash_failed")
	}

	partner := &models.Partner{
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        email,
		Phone:        req.Phone,
		PasswordHash: pwHash,
		Status:       models.StatusUnverified,
		EmailVerified: false,
	}

	var resp *SignupResponse

	// ✅ USE SHARED TRANSACTION HELPER
	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		if err := s.partnerRepo.Create(tx, partner); err != nil {
			return err
		}

		code, err := generateOTP(6)
		if err != nil {
			return err
		}

		otp := &models.OTP{
			OwnerID:   partner.ID,
			OwnerType: models.OwnerTypePartner, // 👈 use typed constant
			Code:      code,
			Purpose:   "email_verification",
			ExpiresAt: time.Now().Add(10 * time.Minute),
			Used:      false,
		}

		if err := s.otpRepo.Create(tx, otp); err != nil {
			return err
		}

		resp = &SignupResponse{
			Email:      email,
			NextAction: "verify_otp",
		}
		return nil
	})

	if err != nil {
		return nil, errors.New("signup_failed")
	}

	return resp, nil
}