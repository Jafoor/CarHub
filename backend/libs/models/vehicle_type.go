package models

import (
	"time"

	"gorm.io/gorm"
)

type VehicleType struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:100;not null;unique" json:"name"`
	Image     string         `gorm:"size:255" json:"image"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	Priority  int            `gorm:"default:0" json:"priority"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Brands    []Brand        `gorm:"foreignKey:VehicleTypeID" json:"brands,omitempty"`
}
