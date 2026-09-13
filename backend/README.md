# Backend API

This is the initial Auth/User and Problem-service API boundary. The React frontend has not been changed.

## Setup

Copy `.env.example` to `.env`, keep your existing `DATABASE_URL`, and set a unique `JWT_SECRET` of at least 32 characters. Apply `sql/intial_tables.sql` to the database once, then run:

```powershell
go run .
```

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/api/v1/auth/register` | Create a user and receive a bearer token |
| POST | `/api/v1/auth/login` | Log in and receive a bearer token |
| GET | `/api/v1/auth/me` | Current authenticated profile |
| GET | `/api/v1/users/me` | Alias for the current authenticated profile |
| POST | `/api/v1/problems` | Create a problem, tags, and optional test cases |
| GET | `/api/v1/problems` | List problems; optional `?difficulty=EASY|MEDIUM|HARD` |
| GET | `/api/v1/problems/{id}` | Get one problem |

`POST /api/v1/problems`, `/api/v1/auth/me`, and `/api/v1/users/me` require `Authorization: Bearer <token>`.

## Request examples

```json
POST /api/v1/auth/register
{
  "username": "ada",
  "email": "ada@example.com",
  "password": "secure-password"
}
```

`useremail` is also accepted as an alias for `email`.

```json
POST /api/v1/problems
{
  "title": "Two Sum",
  "description": "Return the indices of two numbers that add to target.",
  "difficulty": "EASY",
  "constraints": "2 <= nums.length <= 10000",
  "tags": ["arrays", "hashing"],
  "test_cases": [
    {"input": "[2,7,11,15] 9", "expected_output": "0 1", "is_hidden": false}
  ]
}
```

Passwords and hidden expected outputs are never returned by the API.
