package models

import (
	"time"

	"gorm.io/gorm"
)

type Admin struct {
	ID                   uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	FirstName            string    `gorm:"size:100;not null" json:"first_name"`
	LastName             string    `gorm:"size:100;not null" json:"last_name"`
	Email                string    `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Phone                *string   `gorm:"size:30;uniqueIndex" json:"phone,omitempty"`
	PasswordHash         string    `gorm:"size:255;not null" json:"-"`
	
	EmailVerified        bool      `gorm:"default:true;not null" json:"email_verified"`
	IsActive             bool      `gorm:"default:true;not null" json:"is_active"`
	PasswordChanged      bool      `gorm:"default:false;not null" json:"-"`
	LastPasswordChange   *time.Time `json:"-"`
	LastLoginAt          *time.Time `json:"last_login_at,omitempty"`
	
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"-"`
}