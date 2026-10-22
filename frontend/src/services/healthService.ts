import { api } from './api'
import type {
  HealthEvent,
  HealthEventFilters,
  HealthEventRequest,
} from '../types/health'

const basePath = (farmId: string) => `/api/farms/${farmId}/health-events`

export async function getHealthEvents(
  farmId: string,
  filters: HealthEventFilters = {},
): Promise<HealthEvent[]> {
  const response = await api.get<HealthEvent[]>(basePath(farmId), { params: filters })
  return response.data
}

export async function getHealthEvent(farmId: string, eventId: string): Promise<HealthEvent> {
  const response = await api.get<HealthEvent>(`${basePath(farmId)}/${eventId}`)
  return response.data
}

export async function createHealthEvent(
  farmId: string,
  request: HealthEventRequest,
): Promise<HealthEvent> {
  const response = await api.post<HealthEvent>(basePath(farmId), request)
  return response.data
}

export async function updateHealthEvent(
  farmId: string,
  eventId: string,
  request: HealthEventRequest,
): Promise<HealthEvent> {
  const response = await api.put<HealthEvent>(`${basePath(farmId)}/${eventId}`, request)
  return response.data
}

export async function deleteHealthEvent(farmId: string, eventId: string): Promise<void> {
  await api.delete(`${basePath(farmId)}/${eventId}`)
}
