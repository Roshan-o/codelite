export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export type TestCaseInput = {
  input: string
  expected_output: string
  is_hidden: boolean
}

export type Problem = {
  id: number
  title: string
  description: string
  difficulty: Difficulty
  constraints?: string
  tags: string[]
  created_at: string
}

export type ProblemDetail = Problem & {
  test_cases: TestCaseInput[]
}

export type ProblemInput = {
  title: string
  description: string
  difficulty: Difficulty
  constraints: string
  tags: string[]
  test_cases: TestCaseInput[]
}
