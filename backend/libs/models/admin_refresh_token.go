package models

import (
	"time"
)

type AdminRefreshToken struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"-"`
	AdminID   uint      `gorm:"not null;index" json:"-"`
	TokenHash string    `gorm:"size:512;not null" json:"-"`
	ExpiresAt time.Time `gorm:"not null;index" json:"-"`
	CreatedAt time.Time `json:"created_at"`
}
