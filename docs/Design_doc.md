Algoforge/Codeway/Codelite
Problem Statement:
Develop a scalable online coding platform that provides users with an interactive environment to practice programming problems and evaluate their solutions automatically.
The system should allow users to browse and search programming problems, understand problem descriptions and constraints, write C++ code, execute their solutions, and submit them for evaluation. The platform must compile and run submitted programs against test cases and provide meaningful results such as Accepted, Wrong Answer, Compilation Error etc….
The system should also allow users to track their submission history and solved problems, while ensuring that code execution is isolated and secure. The platform should be designed to handle multiple users and concurrent code executions efficiently, providing reliable and responsive evaluation of submitted solutions.
Overview:
Codelite is an online programming practice and automated code evaluation platform.
The initial version will use a modular monolithic backend. This keeps development, deployment, and debugging simple while maintaining clear separation between application modules.
Code execution will be handled separately because user-submitted code is untrusted and requires resource and security isolation.
The initial system supports C++ only.
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
Backend Modules
Authentication Module
Responsibilities:
User registration
Login
Logout
Password hashing
Token/session management
User identity management
APIs:
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
Passwords must never be stored in plaintext.
Problem Module
Responsibilities:
Create problems
Retrieve problems
List and search problems
Manage difficulty
Manage tags
Manage constraints
Manage examples
Manage test cases
APIs:
GET /api/v1/problems
GET /api/v1/problems/{problemId}
GET /api/v1/problems?difficulty=medium
GET /api/v1/problems?tag=graphs



Submission Module
Responsibilities:
Create submissions
Store source code
Track submission status
Send execution jobs
Receive execution results
Maintain submission history
APIs:
POST /api/v1/submissions
GET  /api/v1/submissions/{id}
GET  /api/v1/users/me/submissions
GET  /api/v1/users/me/progress
GET  /api/v1/users/me/dashboard
Submission states:
PENDING
RUNNING
ACCEPTED
WRONG_ANSWER
COMPILATION_ERROR
RUNTIME_ERROR
TIME_LIMIT_EXCEEDED
SYSTEM_ERROR
Code Execution
The execution worker is separated from the main backend because submitted code is untrusted.

Why Code Execution Must Be Isolated:
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
Feature/Aspect
Run
Submit
Test Cases Used
Uses sample test cases
Uses hidden test cases
Purpose / Output
Intended for quick feedback; does not expose hidden test cases
Produces the official submission verdict
Persistence
Results are temporary
Stores the submission result








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
Submission backend Service →Queue → Execution Worker
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
Scaling Strategy(future):
This will be converted a Micro-service architecture with different service such as auth service,problem service, submission service etc..
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


Tech Stack:
Frontend
React + TypeScript
Monaco Editor
TanStack Query
Tailwind CSS
Backend
Go
Chi
REST APIs
JWT / Secure Sessions
Database
PostgreSQL
pgx
Database migrations
Asynchronous Processing
RabbitMQ
Go Goroutines
Worker Pool

Code Execution
Docker
C++
g++
CPU and memory limits
Execution timeout
Network isolation
Infrastructure
Docker
Docker Compose
Nginx / Load Balancer
Cloud VM / Container Platform
CI/CD
Git
GitHub
GitHub Actions
Docker Images