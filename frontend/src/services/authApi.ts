import type { AuthResponse, User } from '../types/user'
import { request } from './api'

export const authApi = {
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
}
