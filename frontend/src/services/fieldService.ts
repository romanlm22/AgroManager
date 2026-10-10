import { api } from './api'
import type { Field, FieldRequest } from '../types/field'

const basePath = (farmId: string) => `/api/farms/${farmId}/fields`

export async function getFields(farmId: string): Promise<Field[]> {
  const response = await api.get<Field[]>(basePath(farmId))
  return response.data
}

export async function getField(farmId: string, fieldId: string): Promise<Field> {
  const response = await api.get<Field>(`${basePath(farmId)}/${fieldId}`)
  return response.data
}

export async function createField(farmId: string, request: FieldRequest): Promise<Field> {
  const response = await api.post<Field>(basePath(farmId), request)
  return response.data
}

export async function updateField(
  farmId: string,
  fieldId: string,
  request: FieldRequest,
): Promise<Field> {
  const response = await api.put<Field>(`${basePath(farmId)}/${fieldId}`, request)
  return response.data
}

export async function deleteField(farmId: string, fieldId: string): Promise<void> {
  await api.delete(`${basePath(farmId)}/${fieldId}`)
}