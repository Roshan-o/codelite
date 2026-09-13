export type User = {
  id: number
  username: string
  email: string
  created_at: string
}

export type AuthResponse = {
  user: User
  token: string
}
