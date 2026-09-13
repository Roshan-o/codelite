package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/yourname/codelite/backend/config"
	"github.com/yourname/codelite/backend/internal/api"
	"github.com/yourname/codelite/backend/internal/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil { log.Fatal(err) }
	db, err := database.New(context.Background(), cfg.DatabaseURL)
	if err != nil { log.Fatal(err) }
	defer db.Close()
	server := http.Server{Addr: ":" + cfg.Port, Handler: api.NewRouter(db, []byte(cfg.JWTSecret)), ReadHeaderTimeout: 5 * time.Second}
	log.Printf("API listening on http://localhost:%s", cfg.Port)
	log.Fatal(server.ListenAndServe())
}
