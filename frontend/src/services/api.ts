import axios from 'axios'
import { loadSession } from '../utils/tokenStorage'

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