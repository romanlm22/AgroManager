import { api } from './api'
import type { Production, ProductionFilters, ProductionRequest } from '../types/production'

const basePath = (farmId: string) => `/api/farms/${farmId}/productions`

export async function getProductions(
  farmId: string,
  filters: ProductionFilters = {},
): Promise<Production[]> {
  const response = await api.get<Production[]>(basePath(farmId), { params: filters })
  return response.data
}

export async function getProduction(farmId: string, productionId: string): Promise<Production> {
  const response = await api.get<Production>(`${basePath(farmId)}/${productionId}`)
  return response.data
}

export async function createProduction(
  farmId: string,
  request: ProductionRequest,
): Promise<Production> {
  const response = await api.post<Production>(basePath(farmId), request)
  return response.data
}

export async function updateProduction(
  farmId: string,
  productionId: string,
  request: ProductionRequest,
): Promise<Production> {
  const response = await api.put<Production>(`${basePath(farmId)}/${productionId}`, request)
  return response.data
}

export async function deleteProduction(farmId: string, productionId: string): Promise<void> {
  await api.delete(`${basePath(farmId)}/${productionId}`)
}
