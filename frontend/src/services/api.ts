import type { AuthResponse, User } from '../types/user'
import type { Problem, ProblemDetail, ProblemInput } from '../types/problem'

const baseURL = import.meta.env.VITE_API_URL ?? ''

export async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? 'Something went wrong')
  return body as T
}

export const api = {
  register: (username: string, email: string, password: string) =>
    request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getProfile: (token: string) => request<User>('/api/v1/users/me', {}, token),
  listProblems: () => request<Problem[]>('/api/v1/problems'),
  getProblem: (id: number) => request<ProblemDetail>(`/api/v1/problems/${id}`),
  createProblem: (problem: ProblemInput, token: string) => request<Problem>('/api/v1/problems', { method: 'POST', body: JSON.stringify(problem) }, token),
}
