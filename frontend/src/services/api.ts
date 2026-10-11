import axios, { isAxiosError } from 'axios'
import { clearSession, loadSession } from '../utils/tokenStorage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const session = loadSession()

  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

// Un 401 en una ruta protegida significa token vencido o inválido: se descarta
// la sesión y se vuelve al login. Los 401 de /api/auth/ (credenciales
// incorrectas) los maneja la pantalla de login.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.startsWith('/api/auth/') &&
      loadSession() !== null
    ) {
      clearSession()
      window.location.assign('/login')
    }

    return Promise.reject(error)
  },
)
