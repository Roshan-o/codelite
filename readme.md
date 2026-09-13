# Codelite 🚀

Codelite is a modern, high-performance practice platform inspired by LeetCode. It provides a polished environment for users to solve curated algorithmic challenges, write solutions, and run sample test cases against their code. 

## 🎯 Our Motto
**"Practice coding. Ship better solutions."**

We believe in providing a distraction-free, lightning-fast platform where developers can hone their problem-solving skills, test their logic, and prepare for technical interviews without friction. Codelite aims to simulate a realistic coding interview environment while giving users the tools they need to improve.

## ✨ Key Features

- **Rich Problem Library:** Browse a curated list of algorithmic challenges categorized by difficulty tiers (Easy, Medium, Hard) and tags.
- **Interactive Code Editor:** A sleek, split-pane coding environment with a built-in code editor specifically tailored for C++ solutions.
- **Instant Execution & Validation:** Run your code against sample test cases and receive immediate feedback and verdicts directly in the integrated console.
- **Problem Creation:** Contribute to the platform by creating and sharing your own coding challenges with custom descriptions, constraints, and hidden/visible test cases.
- **User Authentication & Profiles:** Secure user registration, login, and profile management to track your coding journey.

## 🛠️ Tech Stack

Codelite is built with a robust, modern technology stack designed for scalability and performance:

### Frontend
- **React 18** - UI Library for building interactive components
- **TypeScript** - Strongly typed JavaScript for enhanced developer experience
- **Vite** - Next-generation frontend tooling for lightning-fast HMR and optimized builds
- **Vanilla CSS** - Custom, lightweight styling system heavily inspired by LeetCode's design language

### Backend
- **Go (Golang)** - High-performance backend language for handling fast API requests and execution logic
- **PostgreSQL (via NeonDB)** - Relational database for storing user profiles, problems, and test cases
- **pgx** - Pure Go driver for PostgreSQL providing blazing fast database operations
- **Standard Library `net/http`** - Lightweight, native routing and HTTP handling

## Design Doc:
https://docs.google.com/document/d/11jejR0cduhEi1OdqsLtv9LGutDH3JpwFNVPHakBctKg/edit?tab=t.0

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Go (1.27+)
- A PostgreSQL database connection string (e.g., NeonDB)

### Local Setup

**1. Clone the repository**
```bash
git clone <repository-url>
cd leetcode
```

**2. Setup the Backend**
```bash
cd backend
# Create a .env file and add your DATABASE_URL
echo "DATABASE_URL=your_postgres_connection_string" > .env
# Run the Go server (starts on http://localhost:8080)
go run ./cmd/api
```

**3. Setup the Frontend**
```bash
cd frontend
npm install
# Start the Vite development server (starts on http://localhost:5173)
npm run dev
```

---
*Built with ❤️ for algorithmic problem solvers.*
