package models

import "time"

type AdminRole struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string    `gorm:"size:50;uniqueIndex;not null" json:"name"`
	DisplayName  string    `gorm:"size:100;not null" json:"display_name"`
	Description  *string   `gorm:"type:text" json:"description,omitempty"`
	IsDefault    bool      `gorm:"default:false;not null" json:"is_default"`
	IsSuperAdmin bool      `gorm:"default:false;not null" json:"is_super_admin"`
	CreatedAt    time.Time `json:"created_at"`
}