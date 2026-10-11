import { createContext } from 'react'
import type { AuthResponse, LoginRequest } from '../types/auth'

export interface AuthContextValue {
  user: AuthResponse | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
