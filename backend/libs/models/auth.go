package models

import (
	"time"

	"gorm.io/gorm"
)

type Role struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	Name        string `gorm:"size:64;uniqueIndex;not null"`
	Description string `gorm:"size:255"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

type User struct {
	ID           uint   `gorm:"primaryKey;autoIncrement"`
	FullName     string `gorm:"size:200;not null"`
	Email        string `gorm:"size:255;uniqueIndex;not null"`
	Phone        string `gorm:"size:30;uniqueIndex;default:null"`
	PasswordHash string `gorm:"size:255;not null"`
	RoleID       uint   `gorm:"index;not null"`
	Role         Role   `gorm:"foreignKey:RoleID"`
	IsVerified   bool   `gorm:"default:false"`
	LastLoginAt  *time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

type RefreshToken struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	UserID    uint      `gorm:"index;not null"`
	User      User      `gorm:"foreignKey:UserID"`
	TokenHash string    `gorm:"size:512;not null;index"`
	ExpiresAt time.Time `gorm:"index;not null"`
	Revoked   bool      `gorm:"default:false;index"`
	CreatedAt time.Time
}
