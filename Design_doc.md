Algoforge/Codeway/Codelite
Problem Statement:
Develop a scalable online coding platform that provides users with an interactive environment to practice programming problems and evaluate their solutions automatically.
The system should allow users to browse and search programming problems, understand problem descriptions and constraints, write C++ code, execute their solutions, and submit them for evaluation. The platform must compile and run submitted programs against test cases and provide meaningful results such as Accepted, Wrong Answer, Compilation Error etc….
The system should also allow users to track their submission history and solved problems, while ensuring that code execution is isolated and secure. The platform should be designed to handle multiple users and concurrent code executions efficiently, providing reliable and responsive evaluation of submitted solutions.
Overview:
Codelite is an online programming practice and automated code evaluation platform that enables users to solve programming problems in an interactive environment. Users can browse problems based on difficulty and topics, view problem descriptions and constraints, write C++ solutions using an integrated code editor, run their code against test cases, and submit solutions for evaluation against hidden test cases.
The platform automatically compiles and executes submitted programs and evaluates their correctness and performance, identifying outcomes such as Accepted, Wrong Answer, Compilation Error, Runtime Error, and Time Limit Exceeded. Users can also view their submission history and track the problems they have successfully solved.
Codelite follows a microservice-oriented architecture, allowing resource-intensive components such as code compilation and execution to scale independently from core application services. The initial system focuses on C++, while the architecture is designed to support future extensions such as additional programming languages, contests, leaderboards, discussions, and multiple execution environments without requiring major changes to the core system.
Functional Requirements
User Authentication — The system shall allow users to register, log in, and securely manage their accounts.
Problem Browsing — The system shall allow users to browse and search available coding problems.
Problem Details — The system shall display problem descriptions, constraints, examples, difficulty levels, and tags.
Code Editor — The system shall provide an in-browser C++ code editor for writing solutions.
Code Execution — The system shall allow users to run their code against sample test cases.
Code Submission — The system shall allow users to submit solutions for evaluation against hidden test cases.
Code Evaluation — The system shall detect compilation errors, runtime errors, time limit exceeded, and wrong answers.
Submission Results — The system shall display the evaluation result and mark successful submissions as accepted.
Submission History — The system shall maintain users' previous submissions and solved problem status.
User Dashboard — The system shall provide a dashboard showing solved problems, submission statistics, and overall progress.
Non-functional requirements
Isolation and security. Untrusted code must never read the hidden tests or other users' data, escape to the host, or reach the network. A single escape is a breach.
Stability under abuse. A fork bomb, an infinite loop, or a memory hog must be contained and killed without taking down the worker or its neighbors.
Fair, timely verdicts. Seconds to a verdict in steady state, and under a contest spike, no single user is starved while others wait.
(out of scope)Scale for the contest spike. The worker fleet is sized and autoscaled for a synchronized contest start, which dwarfs the daily average by an order of magnitude.
Architecture

The API Gateway acts as the public entry point.
The application services communicate internally through APIs and asynchronous messaging where appropriate.
Service Architecture
The initial system will contain the following major services.
API Gateway
Responsibilities:
Public API entry point
Request routing
Authentication token validation
Rate limiting
Request logging
API versioning
CORS handling
Example:
/api/v1/auth/*
/api/v1/problems/*
/api/v1/submissions/*
/api/v1/users/*
The gateway would not contain business logic.
Authentication Service
Responsibilities
User registration
Login
Logout
Password hashing
Token generation
Token validation
Session management
User identity management
APIs
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
User Registration

Passwords must never be stored in plaintext.
Password hashing algorithm such as Argon2id or bcrypt.
Problem Service
The Problem Service owns all problem-related information.
Responsibilities
Problem creation
Problem retrieval
Problem listing
Difficulty
Tags
Problem metadata
Constraints
Examples
Starter code
Test-case metadata
Example API:
GET /api/v1/problems
GET /api/v1/problems/{problemId}
GET /api/v1/problems?difficulty=medium
GET /api/v1/problems?tag=graphs
Submission Service
The Submission Service manages the lifecycle of a user's code submission.
Responsibilities
Create submissions
Validate submission requests
Store source code
Track submission status
Communicate with execution workers
Return execution results
Maintain submission history
Possible states:
PENDING
RUNNING
ACCEPTED
WRONG_ANSWER
COMPILATION_ERROR
RUNTIME_ERROR
TIME_LIMIT_EXCEEDED
SYSTEM_ERROR
Submissions
POST /api/v1/submissions
GET  /api/v1/submissions/{id}
GET  /api/v1/users/me/submissions
Progress
GET /api/v1/users/me/progress
GET /api/v1/users/me/dashboard
Code Execution Service
This is the most security-sensitive and resource-intensive component.
It should be isolated from the normal application backend.
Responsibilities
Receive execution jobs
Compile C++ source code
Execute compiled programs
Apply CPU limits
Apply memory limits
Apply execution timeout
Disable network access
Execute test cases
Compare output
Return execution results
Architecture
Why Code Execution Must Be Isolated
User-submitted code is untrusted.
A malicious submission could attempt to:
Access the filesystem
Consume excessive CPU
Consume excessive memory
Spawn processes
Access the network
Read secrets
Attack the host machine
Run indefinitely
Therefore, arbitrary user code must not execute directly inside the API server.
The execution environment should eventually use containers or another sandboxing mechanism with restrictions such as:
Network:       Disabled
CPU:           Limited
Memory:        Limited
Execution:     Time Limited
Processes:     Limited
Filesystem:    Restricted
Privileges:    Dropped
For production deployment, the execution layer should be hardened beyond simply starting an unrestricted Docker container.

Run vs Submit
The platform should distinguish between Run and Submit.


Verdict Evaluation
The execution service should distinguish:
Verdict
Description
Accepted
All required test cases pass.
Wrong Answer
Program executes successfully but output does not match expected output.
Compilation Error
The submitted C++ program cannot be compiled.
Runtime Error
The program crashes or terminates abnormally.
Time Limit Exceeded
The program exceeds the configured execution time.
System Error
The platform itself fails while processing the submission.

Asynchronous Communication
Use a message queue for:
Submission Service →Queue → Execution Worker
This is important because code execution can be slow and resource-intensive.
Possible technologies:
RabbitMQ
Kafka
Redis Streams
AWS SQS
Submission Queue
Example job:
{
    "submissionId": "abc-123",
    "problemId": 42,
    "language": "cpp"
}
The worker uses submissionId to retrieve the required execution information.
The queue should not need to carry the entire source code and all test cases.
Scaling Strategy
One of the major reasons for choosing this architecture is independent scaling.
Suppose the platform has:
1000 users browsing problems
100 users submitting code
20 users running code simultaneously
The Problem Service does not need to scale at the same rate as the Execution Service.
For example:

If submission traffic increases:
Execution Workers
       2→10→50
without scaling the authentication or problem services.
Caching(future scope)
Redis can eventually be introduced for frequently accessed data.
Good candidates:
Popular problem details
Problem lists
Tags
User dashboard statistics
Session/token information
Rate limiting
Rate Limiting
Rate limiting should exist at the API Gateway.
Different endpoints can have different limits.
Example:
Endpoint
Rate Limit
GET /api/v1/problems
Relatively high limit
POST /api/v1/submissions
Significantly lower limit
POST /api/v1/login
Strict limit


This prevents abuse and protects the execution infrastructure.
Services
Service
Responsibility
Scaling Need
API Gateway
Routing, auth middleware, rate limiting
High
Auth Service
Authentication/users
Low–Medium
Problem Service
Problems/tags/test cases
Medium
Submission Service
Submission lifecycle
High
Execution Service
Compile/run code
Very High
Frontend
User interface
High









Tech Stack
Frontend
React + TypeScript — Build the user interface and application logic.
Monaco Editor — Code editor with syntax highlighting and C++ support.
React Query / TanStack Query — API communication, caching, and server-state management.
Tailwind CSS — UI styling and responsive layouts.
Backend
Go (Golang) — Primary backend language for all microservices.
Chi — Lightweight HTTP router for Go services.
REST APIs — Communication between frontend and backend services.
JWT / Secure Sessions — Authentication and authorization.
Microservices
Service
Responsibility
API Gateway
Routing, authentication, rate limiting
Auth Service
Registration, login, user management
Problem Service
Problems, tags, difficulty, test cases
Submission Service
Submission lifecycle and status
Execution Service
Job processing and code execution

Database & Storage
PostgreSQL — Primary relational database.
pgx — PostgreSQL driver for Go.
Database migrations — Version-controlled schema migrations.
Redis — Caching, rate limiting, and temporary data where required.
Asynchronous Processing
RabbitMQ — Message broker for submission/execution jobs.
Go Goroutines + Worker Pools — Concurrent processing of execution jobs.

Code Execution
Docker — Isolated execution environment for untrusted user code.
C++ / g++ — Initial supported programming language and compiler.
Resource limits — CPU, memory, process count, and execution timeout.
Network isolation — User programs cannot access external networks.
Infrastructure
Docker — Containerization of services and execution environments.
Docker Compose — Local development and MVP deployment.
Nginx / Load Balancer — Traffic distribution.
Cloud VM / Container Platform — Initial production deployment.
Development & CI/CD
Git + GitHub — Version control.
GitHub Actions — Automated build, test, and deployment pipeline.
Docker images — Consistent development and deployment environments.

