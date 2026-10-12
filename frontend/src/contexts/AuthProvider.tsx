import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './authContext'
import * as authService from '../services/authService'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'
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

  const startSession = (session: AuthResponse) => {
    queryClient.clear()
    saveSession(session)
    setUser(session)
  }

  const login = async (request: LoginRequest) => {
    startSession(await authService.login(request))
  }

  // El backend devuelve el token al registrar, así que el usuario queda con la
  // sesión iniciada sin tener que ingresar de nuevo.
  const register = async (request: RegisterRequest) => {
    startSession(await authService.register(request))
  }

  const logout = () => {
    queryClient.clear()
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
