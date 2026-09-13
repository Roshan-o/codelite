package api

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

const maxBodyBytes = 1 << 20

type Server struct {
	db       *pgxpool.Pool
	tokenKey []byte
}
type tokenClaims struct {
	UserID  int64 `json:"user_id"`
	Expires int64 `json:"exp"`
}
type claimsKey struct{}
type apiError struct {
	Error string `json:"error"`
}

func NewRouter(db *pgxpool.Pool, tokenKey []byte) http.Handler {
	s := &Server{db: db, tokenKey: tokenKey}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.health)
	mux.HandleFunc("POST /api/v1/auth/register", s.register)
	mux.HandleFunc("POST /api/v1/auth/login", s.login)
	mux.HandleFunc("GET /api/v1/auth/me", s.requireAuth(s.me))
	mux.HandleFunc("GET /api/v1/users/me", s.requireAuth(s.me))
	mux.HandleFunc("POST /api/v1/problems", s.requireAuth(s.createProblem))
	mux.HandleFunc("GET /api/v1/problems", s.listProblems)
	mux.HandleFunc("GET /api/v1/problems/{id}", s.getProblem)
	return logging(mux)
}
func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
func (s *Server) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, err := s.parseToken(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
		if err != nil {
			writeError(w, http.StatusUnauthorized, "valid bearer token required")
			return
		}
		next(w, r.WithContext(context.WithValue(r.Context(), claimsKey{}, claims)))
	}
}
func (s *Server) issueToken(id int64) string {
	payload, _ := json.Marshal(tokenClaims{UserID: id, Expires: time.Now().Add(24 * time.Hour).Unix()})
	encoded := base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, s.tokenKey)
	mac.Write([]byte(encoded))
	return encoded + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
func (s *Server) parseToken(token string) (tokenClaims, error) {
	var c tokenClaims
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return c, errors.New("malformed token")
	}
	mac := hmac.New(sha256.New, s.tokenKey)
	mac.Write([]byte(parts[0]))
	sig, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || !hmac.Equal(sig, mac.Sum(nil)) {
		return c, errors.New("invalid signature")
	}
	body, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil || json.Unmarshal(body, &c) != nil || c.Expires < time.Now().Unix() {
		return c, errors.New("expired token")
	}
	return c, nil
}
func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(dst); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON request body")
		return false
	}
	return true
}
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, apiError{message})
}
func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
		log.Printf("%s %s", r.Method, r.URL.Path)
	})
}
