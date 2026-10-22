import { api } from './api'
import type { Weighing, WeighingRequest } from '../types/weighing'

const basePath = (farmId: string, animalId: string) =>
  `/api/farms/${farmId}/animals/${animalId}/weighings`

export async function getWeighings(farmId: string, animalId: string): Promise<Weighing[]> {
  const response = await api.get<Weighing[]>(basePath(farmId, animalId))
  return response.data
}

export async function getWeighing(
  farmId: string,
  animalId: string,
  weighingId: string,
): Promise<Weighing> {
  const response = await api.get<Weighing>(`${basePath(farmId, animalId)}/${weighingId}`)
  return response.data
}

export async function createWeighing(
  farmId: string,
  animalId: string,
  request: WeighingRequest,
): Promise<Weighing> {
  const response = await api.post<Weighing>(basePath(farmId, animalId), request)
  return response.data
}

export async function updateWeighing(
  farmId: string,
  animalId: string,
  weighingId: string,
  request: WeighingRequest,
): Promise<Weighing> {
  const response = await api.put<Weighing>(
    `${basePath(farmId, animalId)}/${weighingId}`,
    request,
  )
  return response.data
}

export async function deleteWeighing(
  farmId: string,
  animalId: string,
  weighingId: string,
): Promise<void> {
  await api.delete(`${basePath(farmId, animalId)}/${weighingId}`)
}
