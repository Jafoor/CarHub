package models

import (
	"time"

	"gorm.io/gorm"
)

type Brand struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `gorm:"size:100;not null" json:"name"`
	VehicleTypeID uint           `gorm:"not null" json:"vehicle_type_id"`
	VehicleType   VehicleType    `gorm:"foreignKey:VehicleTypeID" json:"vehicle_type"`
	Image         string         `gorm:"size:255" json:"image"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	Description   string         `gorm:"type:text" json:"description"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
