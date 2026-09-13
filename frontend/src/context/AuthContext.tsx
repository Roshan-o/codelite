import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/user'

type AuthContextValue = {
  user: User | null
  token: string
  setUser: (user: User | null) => void
  setToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState(() => localStorage.getItem('codelite_token') ?? '')

  const value = useMemo(() => ({ user, token, setUser, setToken }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthContext must be used inside AuthProvider')
  return context
}
