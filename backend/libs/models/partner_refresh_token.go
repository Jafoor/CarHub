package models

import (
	"time"
)

type PartnerRefreshToken struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"-"`
	PartnerID  uint      `gorm:"not null;index" json:"-"`
	TokenHash  string    `gorm:"size:512;not null" json:"-"`
	ExpiresAt  time.Time `gorm:"not null;index" json:"-"`
	CreatedAt  time.Time `json:"created_at"`
}