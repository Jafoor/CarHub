package models

import (
	"time"

	"gorm.io/gorm"
)

type Division struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:100;not null;unique" json:"name"`
	BnName    string         `gorm:"size:100" json:"bn_name"`
	Lat       float64        `gorm:"type:decimal(10,8)" json:"lat"`
	Lon       float64        `gorm:"type:decimal(11,8)" json:"lon"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	Priority  int            `gorm:"default:0" json:"priority"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Districts []District     `gorm:"foreignKey:DivisionID" json:"districts,omitempty"`
}
