package api

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	var in registerRequest
	if !decodeJSON(w, r, &in) {
		return
	}
	in.Username = strings.TrimSpace(in.Username)
	in.Email = strings.TrimSpace(in.Email)
	if in.Email == "" {
		in.Email = strings.TrimSpace(in.UserEmail)
	}
	if in.Username == "" || in.Email == "" || in.Password == "" {
		writeError(w, 400, "username, email (or useremail), and password are required")
		return
	}
	if len(in.Username) > 50 || len(in.Email) > 255 || len(in.Password) < 8 || len(in.Password) > 72 {
		writeError(w, 400, "username must be at most 50 characters; email at most 255; password 8-72 characters")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, 500, "could not secure password")
		return
	}
	print("username:",in.Username,"email:",in.Email)
	var u userResponse
	err = s.db.QueryRow(r.Context(), `INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3) RETURNING user_id,username,email,created_at`, in.Username, in.Email, string(hash)).Scan(&u.ID, &u.Username, &u.Email, &u.CreatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			writeError(w, 409, "username or email is already registered")
		} else {
			log.Printf("register: %v", err)
			writeError(w, 500, "could not create user")
		}
		return
	}
	writeJSON(w, 201, authResponse{User: u, Token: s.issueToken(u.ID)})
}
func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var in loginRequest
	if !decodeJSON(w, r, &in) {
		return
	}
	var u userResponse
	var hash string
	err := s.db.QueryRow(r.Context(), `SELECT user_id,username,email,created_at,password_hash FROM users WHERE email=$1`, strings.TrimSpace(in.Email)).Scan(&u.ID, &u.Username, &u.Email, &u.CreatedAt, &hash)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(in.Password)) != nil {
		writeError(w, 401, "invalid email or password")
		return
	}
	writeJSON(w, 200, authResponse{User: u, Token: s.issueToken(u.ID)})
}
func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(claimsKey{}).(tokenClaims)
	var u userResponse
	err := s.db.QueryRow(r.Context(), `SELECT user_id,username,email,created_at FROM users WHERE user_id=$1`, claims.UserID).Scan(&u.ID, &u.Username, &u.Email, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, 401, "user no longer exists")
	} else if err != nil {
		log.Printf("profile: %v", err)
		writeError(w, 500, "could not fetch profile")
	} else {
		writeJSON(w, 200, u)
	}
}
