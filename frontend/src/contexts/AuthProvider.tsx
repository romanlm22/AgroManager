import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './authContext'
import * as authService from '../services/authService'
import type { AuthResponse, LoginRequest } from '../types/auth'
import { isTokenExpired } from '../utils/jwt'
import { clearSession, loadSession, saveSession } from '../utils/tokenStorage'

function loadValidSession(): AuthResponse | null {
  const session = loadSession()

  if (session && isTokenExpired(session.token)) {
    clearSession()
    return null
  }

  return session
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(loadValidSession)
  const queryClient = useQueryClient()

  const login = async (request: LoginRequest) => {
    const session = await authService.login(request)
    queryClient.clear()
    saveSession(session)
    setUser(session)
  }

  const logout = () => {
    queryClient.clear()
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
