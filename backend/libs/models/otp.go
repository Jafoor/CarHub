package models

import (
	"time"

	"gorm.io/gorm"
)

type OwnerType string

const (
	OwnerTypePartner   OwnerType = "partner"
	OwnerTypeEmployee  OwnerType = "employee"
	OwnerTypeUser      OwnerType = "user"
	OwnerTypeAdmin     OwnerType = "admin"
)

type OTP struct {
	ID        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	OwnerID   uint       `gorm:"not null;index" json:"-"`
	OwnerType OwnerType  `gorm:"size:20;not null;index" json:"-"`
	Code      string     `gorm:"size:6;not null" json:"-"`
	Purpose   string     `gorm:"size:50;not null;index" json:"-"`
	ExpiresAt time.Time  `gorm:"not null;index" json:"-"`
	Used      bool       `gorm:"default:false;index" json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}