package models

import (
	"time"

	"gorm.io/gorm"
)

type Service struct {
	ID        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string     `gorm:"size:100;not null" json:"name"`
	Description   string     `gorm:"size:200;not null;index" json:"description"`
	Code          string	 `gorm:"size:50;not null;uniqueIndex" json:"code"`
	IsActive      bool       `gorm:"default:false;index" json:"is_active"`
	ImageURL     string     `gorm:"size:255" json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}