package database

import (
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Global DB handles
var (
	WriteDB *gorm.DB
	ReadDB  *gorm.DB
)

// DBConfig holds both read & write configs
type DBConfig struct {
	WriteDSN string
	ReadDSN  string
}

// Connect initializes both read and write connections
func Connect(cfg DBConfig) {
	var err error

	WriteDB, err = gorm.Open(postgres.Open(cfg.WriteDSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("❌ Failed to connect to WRITE DB: %v", err)
	}
	log.Println("✅ Connected to WRITE DB")

	ReadDB, err = gorm.Open(postgres.Open(cfg.ReadDSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("❌ Failed to connect to READ DB: %v", err)
	}
	log.Println("✅ Connected to READ DB")

	// Configure connection pooling
	sqlWrite, _ := WriteDB.DB()
	sqlWrite.SetMaxIdleConns(10)
	sqlWrite.SetMaxOpenConns(100)
	sqlWrite.SetConnMaxLifetime(time.Hour)

	sqlRead, _ := ReadDB.DB()
	sqlRead.SetMaxIdleConns(10)
	sqlRead.SetMaxOpenConns(100)
	sqlRead.SetConnMaxLifetime(time.Hour)

	// Optional: ping databases to ensure connectivity
	if err := sqlWrite.Ping(); err != nil {
		log.Fatalf("❌ Write DB not reachable: %v", err)
	}
	if err := sqlRead.Ping(); err != nil {
		log.Fatalf("❌ Read DB not reachable: %v", err)
	}
}

func Close() {
	if WriteDB != nil {
		if sqlw, err := WriteDB.DB(); err == nil {
			sqlw.Close()
		}
	}
	if ReadDB != nil {
		if sqlr, err := ReadDB.DB(); err == nil {
			sqlr.Close()
		}
	}
}
