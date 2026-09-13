package config

import (
	"errors"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct { DatabaseURL, JWTSecret, Port string }

func Load() (Config, error) {
	if err := godotenv.Load(); err != nil && !errors.Is(err, os.ErrNotExist) { return Config{}, fmt.Errorf("load .env: %w", err) }
	cfg := Config{DatabaseURL: os.Getenv("DATABASE_URL"), JWTSecret: os.Getenv("JWT_SECRET"), Port: os.Getenv("PORT")}
	if cfg.DatabaseURL == "" { return Config{}, errors.New("DATABASE_URL is required") }
	if len(cfg.JWTSecret) < 32 { return Config{}, errors.New("JWT_SECRET must be at least 32 characters") }
	if cfg.Port == "" { cfg.Port = "8080" }
	return cfg, nil
}
