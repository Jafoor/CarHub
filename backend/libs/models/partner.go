package model

import (
	"time"

	"gorm.io/gorm"
)

type PartnerStatus string

const (
	StatusUnverified PartnerStatus = "unverified"
	StatusVerified   PartnerStatus = "verified"
	StatusSuspended  PartnerStatus = "suspended"
)

type Partner struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	FirstName    string    `gorm:"size:100;not null" json:"first_name"`
	LastName     string    `gorm:"size:100;not null" json:"last_name"`
	Email        string    `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Phone        *string   `gorm:"size:30;uniqueIndex" json:"phone,omitempty"` // nullable
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	
	Status         PartnerStatus `gorm:"type:partner_status;default:'unverified';not null" json:"status"`
	EmailVerified  bool          `gorm:"default:false;not null" json:"email_verified"`
	
	LastLoginAt *time.Time    `json:"last_login_at,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}