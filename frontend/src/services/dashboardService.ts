import { api } from './api'
import type { Dashboard } from '../types/dashboard'

export async function getDashboard(farmId: string): Promise<Dashboard> {
  const response = await api.get<Dashboard>(`/api/farms/${farmId}/dashboard`)
  return response.data
}