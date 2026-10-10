import { api } from './api'
import type { AuthResponse, LoginRequest } from '../types/auth'

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', request)
  return response.data
}