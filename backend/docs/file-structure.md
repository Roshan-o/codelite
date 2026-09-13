backend/
│
├── cmd/
│   ├── api/
│   │   └── main.go
│   │
│   └── worker/
│       └── main.go
│
├── internal/
│   │
│   ├── auth/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── problem/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── submission/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── execution/
│   │   ├── worker.go
│   │   ├── compiler.go
│   │   ├── runner.go
│   │   └── evaluator.go
│   │
│   ├── middleware/
│   │   ├── auth.go
│   │   └── rate_limit.go
│   │
│   └── database/
│       └── postgres.go
│
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_problems.sql
│   ├── 003_create_tags.sql
│   ├── 004_create_problem_tags.sql
│   ├── 005_create_test_cases.sql
│   ├── 006_create_submissions.sql
│   └── 007_create_submission_results.sql
│
├── pkg/
│   ├── auth/
│   │   └── jwt.go
│   │
│   └── response/
│       └── response.go
│
├── config/
│   └── config.go
│
├── go.mod
└── go.sum