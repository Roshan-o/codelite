export type Submission = {
  id: number
  problem_id: number
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compile Error'
  language: string
  created_at: string
}
