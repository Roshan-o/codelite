package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	connStr := os.Getenv("DATABASE_URL")
	print("trying to connect .....\n")

	conn, err := pgx.Connect(context.Background(), connStr)
	if err != nil {
		log.Fatal("Unable to connect:", err)
	}
	defer conn.Close(context.Background())

	rows, err := conn.Query(
		context.Background(),
		"SELECT problem_id, title, difficulty FROM problems",
	)
	if err != nil {
		log.Fatal("Query failed:", err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			id         int64
			title      string
			difficulty string
		)

		err := rows.Scan(&id, &title, &difficulty)
		if err != nil {
			log.Fatal("Scan failed:", err)
		}

		fmt.Printf(
			"ID: %d | Title: %s | Difficulty: %s\n",
			id,
			title,
			difficulty,
		)
	}

	if err := rows.Err(); err != nil {
		log.Fatal("Row error:", err)
	}
}