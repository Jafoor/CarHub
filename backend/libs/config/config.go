package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	ServerPort      string `mapstructure:"SERVER_PORT"`
	WriteDBUrl      string `mapstructure:"WRITE_DB_URL"`
	ReadDBUrl       string `mapstructure:"READ_DB_URL"`
	JWTSecret       string `mapstructure:"JWT_SECRET"`
	AccessTokenTTL  int64  `mapstructure:"ACCESS_TOKEN_TTL"`  // in minutes
	RefreshTokenTTL int64  `mapstructure:"REFRESH_TOKEN_TTL"` // in hours/days as you prefer
}

var App Config

func LoadConfig() {
	viper.SetConfigFile(".env")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config: %v", err)
	}
	if err := viper.Unmarshal(&App); err != nil {
		log.Fatalf("Error unmarshalling config: %v", err)
	}
}
