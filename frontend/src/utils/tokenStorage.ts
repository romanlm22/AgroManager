import type { AuthResponse } from '../types/auth'

const SESSION_KEY = 'agromanager.session'

export function saveSession(session: AuthResponse): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(): AuthResponse | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthResponse
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
