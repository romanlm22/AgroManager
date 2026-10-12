import { createContext } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

export interface AuthContextValue {
  user: AuthResponse | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
