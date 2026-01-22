package models

import (
	"time"

	"gorm.io/gorm"
)

type Region struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string         `gorm:"size:100;uniqueIndex;not null" json:"name"`
	DisplayName string         `gorm:"size:100;not null" json:"display_name"`
	IsActive    bool           `gorm:"default:true;not null" json:"is_active"`
	Cities      []City         `gorm:"foreignKey:RegionID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"cities,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type City struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string         `gorm:"size:100;uniqueIndex;not null" json:"name"`
	DisplayName string         `gorm:"size:100;not null" json:"display_name"`
	RegionID    uint           `gorm:"not null" json:"region_id"`
	Region      *Region        `json:"region,omitempty"`
	IsActive    bool           `gorm:"default:true;not null" json:"is_active"`
	Areas       []Area         `gorm:"foreignKey:CityID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"areas,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Area struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string         `gorm:"size:100;uniqueIndex;not null" json:"name"`
	DisplayName string         `gorm:"size:100;not null" json:"display_name"`
	CityID      uint           `gorm:"not null" json:"city_id"`
	City        *City          `json:"city,omitempty"`
	IsActive    bool           `gorm:"default:true;not null" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
