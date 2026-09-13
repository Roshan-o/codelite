package api

import "time"

type userResponse struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}
type registerRequest struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email"`
	UserEmail string `json:"useremail"`
}
type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type authResponse struct {
	User  userResponse `json:"user"`
	Token string       `json:"token"`
}
type testCaseRequest struct {
	Input          string `json:"input"`
	ExpectedOutput string `json:"expected_output"`
	IsHidden       bool   `json:"is_hidden"`
}
type createProblemRequest struct {
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Difficulty  string            `json:"difficulty"`
	Constraints string            `json:"constraints"`
	Tags        []string          `json:"tags"`
	TestCases   []testCaseRequest `json:"test_cases"`
}
type testCaseResponse struct {
	Input          string `json:"input"`
	ExpectedOutput string `json:"expected_output"`
	IsHidden       bool   `json:"is_hidden"`
}

type problemResponse struct {
	ID          int64              `json:"id"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Difficulty  string             `json:"difficulty"`
	Constraints string             `json:"constraints,omitempty"`
	Tags        []string           `json:"tags"`
	CreatedAt   time.Time          `json:"created_at"`
	TestCases   []testCaseResponse `json:"test_cases,omitempty"`
}
