package api

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
)

const problemQuery = `SELECT p.problem_id,p.title,p.description,p.difficulty,COALESCE(p.constraints,''),p.created_at,COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL),'{}') FROM problems p LEFT JOIN problem_tags pt ON pt.problem_id=p.problem_id LEFT JOIN tags t ON t.tag_id=pt.tag_id`

func (s *Server) createProblem(w http.ResponseWriter, r *http.Request) {
	var in createProblemRequest
	if !decodeJSON(w, r, &in) {
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	in.Description = strings.TrimSpace(in.Description)
	in.Difficulty = strings.ToUpper(strings.TrimSpace(in.Difficulty))
	if in.Title == "" || in.Description == "" || in.Difficulty == "" {
		writeError(w, 400, "title, description, and difficulty are required")
		return
	}
	if !validDifficulty(in.Difficulty) {
		writeError(w, 400, "difficulty must be EASY, MEDIUM, or HARD")
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, 500, "could not create problem")
		return
	}
	defer tx.Rollback(r.Context())
	var p problemResponse
	err = tx.QueryRow(r.Context(), `INSERT INTO problems (title,description,difficulty,constraints) VALUES ($1,$2,$3,$4) RETURNING problem_id,title,description,difficulty,COALESCE(constraints,''),created_at`, in.Title, in.Description, in.Difficulty, nullable(in.Constraints)).Scan(&p.ID, &p.Title, &p.Description, &p.Difficulty, &p.Constraints, &p.CreatedAt)
	if err != nil {
		log.Printf("problem: %v", err)
		writeError(w, 500, "could not create problem")
		return
	}
	seen := map[string]bool{}
	for _, tag := range in.Tags {
		tag = strings.TrimSpace(tag)
		key := strings.ToLower(tag)
		if tag == "" {
			continue
		}
		if len(tag) > 50 {
			writeError(w, 400, "tag must be at most 50 characters")
			return
		}
		if seen[key] {
			continue
		}
		seen[key] = true
		var tagID int64
		if err = tx.QueryRow(r.Context(), `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING tag_id`, tag).Scan(&tagID); err != nil {
			writeError(w, 500, "could not add tag")
			return
		}
		if _, err = tx.Exec(r.Context(), `INSERT INTO problem_tags (problem_id,tag_id) VALUES ($1,$2)`, p.ID, tagID); err != nil {
			writeError(w, 500, "could not link tag")
			return
		}
		p.Tags = append(p.Tags, tag)
	}
	for _, tc := range in.TestCases {
		if tc.Input == "" || tc.ExpectedOutput == "" {
			writeError(w, 400, "every test case requires input and expected_output")
			return
		}
		if _, err = tx.Exec(r.Context(), `INSERT INTO test_cases (problem_id,input,expected_output,is_hidden) VALUES ($1,$2,$3,$4)`, p.ID, tc.Input, tc.ExpectedOutput, tc.IsHidden); err != nil {
			writeError(w, 500, "could not add test case")
			return
		}
	}
	if err = tx.Commit(r.Context()); err != nil {
		writeError(w, 500, "could not create problem")
		return
	}
	writeJSON(w, 201, p)
}
func (s *Server) listProblems(w http.ResponseWriter, r *http.Request) {
	difficulty := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("difficulty")))
	if difficulty != "" && !validDifficulty(difficulty) {
		writeError(w, 400, "difficulty must be EASY, MEDIUM, or HARD")
		return
	}
	rows, err := s.db.Query(r.Context(), problemQuery+` WHERE ($1='' OR p.difficulty=$1) GROUP BY p.problem_id ORDER BY p.created_at DESC`, difficulty)
	if err != nil {
		writeError(w, 500, "could not fetch problems")
		return
	}
	defer rows.Close()
	problems := []problemResponse{}
	for rows.Next() {
		var p problemResponse
		if err = rows.Scan(&p.ID, &p.Title, &p.Description, &p.Difficulty, &p.Constraints, &p.CreatedAt, &p.Tags); err != nil {
			writeError(w, 500, "could not fetch problems")
			return
		}
		problems = append(problems, p)
	}
	writeJSON(w, 200, problems)
}
func (s *Server) getProblem(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		writeError(w, 400, "invalid problem id")
		return
	}
	var p problemResponse
	err = s.db.QueryRow(r.Context(), problemQuery+` WHERE p.problem_id=$1 GROUP BY p.problem_id`, id).Scan(&p.ID, &p.Title, &p.Description, &p.Difficulty, &p.Constraints, &p.CreatedAt, &p.Tags)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, 404, "problem not found")
		return
	} else if err != nil {
		writeError(w, 500, "could not fetch problem")
		return
	}

	rows, err := s.db.Query(r.Context(), `SELECT input, expected_output, is_hidden FROM test_cases WHERE problem_id=$1 ORDER BY test_case_id`, id)
	if err != nil {
		writeError(w, 500, "could not fetch problem tests")
		return
	}
	defer rows.Close()

	for rows.Next() {
		var tc testCaseResponse
		if err := rows.Scan(&tc.Input, &tc.ExpectedOutput, &tc.IsHidden); err != nil {
			writeError(w, 500, "could not fetch problem tests")
			return
		}
		p.TestCases = append(p.TestCases, tc)
	}
	if err := rows.Err(); err != nil {
		writeError(w, 500, "could not fetch problem tests")
		return
	}

	writeJSON(w, 200, p)
}
func validDifficulty(value string) bool {
	return value == "EASY" || value == "MEDIUM" || value == "HARD"
}
func nullable(value string) any {
	if value = strings.TrimSpace(value); value == "" {
		return nil
	}
	return value
}
