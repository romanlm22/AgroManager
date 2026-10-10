import { api } from './api'
import type { Farm, FarmRequest } from '../types/farm'

export async function getFarms(): Promise<Farm[]> {
  const response = await api.get<Farm[]>('/api/farms')
  return response.data
}

export async function getFarm(farmId: string): Promise<Farm> {
  const response = await api.get<Farm>(`/api/farms/${farmId}`)
  return response.data
}

export async function createFarm(request: FarmRequest): Promise<Farm> {
  const response = await api.post<Farm>('/api/farms', request)
  return response.data
}