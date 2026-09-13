export type User = { id: number; username: string; email: string; created_at: string }
export type AuthResponse = { user: User; token: string }
export type Problem = { id: number; title: string; description: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD'; constraints?: string; tags: string[]; created_at: string }
export type TestCaseInput = { input: string; expected_output: string; is_hidden: boolean }
export type ProblemDetail = Problem & { test_cases: TestCaseInput[] }
export type ProblemInput = { title: string; description: string; difficulty: Problem['difficulty']; constraints: string; tags: string[]; test_cases: TestCaseInput[] }
