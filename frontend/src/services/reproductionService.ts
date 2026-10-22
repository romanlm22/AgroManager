import { api } from './api'
import type {
  ReproductionEvent,
  ReproductionEventFilters,
  ReproductionEventRequest,
  ReproductiveStatus,
} from '../types/reproduction'

const eventsPath = (farmId: string) => `/api/farms/${farmId}/reproduction-events`

export async function getReproductionEvents(
  farmId: string,
  filters: ReproductionEventFilters = {},
): Promise<ReproductionEvent[]> {
  const response = await api.get<ReproductionEvent[]>(eventsPath(farmId), { params: filters })
  return response.data
}

export async function getReproductionEvent(
  farmId: string,
  eventId: string,
): Promise<ReproductionEvent> {
  const response = await api.get<ReproductionEvent>(`${eventsPath(farmId)}/${eventId}`)
  return response.data
}

export async function createReproductionEvent(
  farmId: string,
  request: ReproductionEventRequest,
): Promise<ReproductionEvent> {
  const response = await api.post<ReproductionEvent>(eventsPath(farmId), request)
  return response.data
}

export async function updateReproductionEvent(
  farmId: string,
  eventId: string,
  request: ReproductionEventRequest,
): Promise<ReproductionEvent> {
  const response = await api.put<ReproductionEvent>(`${eventsPath(farmId)}/${eventId}`, request)
  return response.data
}

export async function deleteReproductionEvent(farmId: string, eventId: string): Promise<void> {
  await api.delete(`${eventsPath(farmId)}/${eventId}`)
}

export async function getReproductiveStatus(farmId: string): Promise<ReproductiveStatus[]> {
  const response = await api.get<ReproductiveStatus[]>(
    `/api/farms/${farmId}/reproduction-status`,
  )
  return response.data
}
