export type Role = 'ADMIN' | 'AGRONOMIST' | 'PRODUCER' | 'EMPLOYEE'

export interface AuthResponse {
  token: string
  email: string
  firstName: string
  lastName: string
  role: Role
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
}
