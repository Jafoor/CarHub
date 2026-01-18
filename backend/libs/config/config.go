package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	ServerPort            string `mapstructure:"SERVER_PORT"`
	WriteDBUrl            string `mapstructure:"WRITE_DB_URL"`
	ReadDBUrl             string `mapstructure:"READ_DB_URL"`
	JWTSecret             string `mapstructure:"JWT_SECRET"`
	AccessTokenTTL        int64  `mapstructure:"ACCESS_TOKEN_TTL"`        // in minutes (partner)
	RefreshTokenTTL       int64  `mapstructure:"REFRESH_TOKEN_TTL"`       // in days (partner)
	AdminAccessTokenTTL   int64  `mapstructure:"ADMIN_ACCESS_TOKEN_TTL"`  // in minutes (admin)
	AdminRefreshTokenTTL  int64  `mapstructure:"ADMIN_REFRESH_TOKEN_TTL"` // in days (admin)
	UnverifiedTokenTTL    int64  `env:"UNVERIFIED_TOKEN_TTL" envDefault:"900"`
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
