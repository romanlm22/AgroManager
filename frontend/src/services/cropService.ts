import { api } from './api'
import type { Crop, CropRequest, CropType } from '../types/crop'

const basePath = (farmId: string, fieldId: string) =>
  `/api/farms/${farmId}/fields/${fieldId}/crops`

export async function getCropTypes(): Promise<CropType[]> {
  const response = await api.get<CropType[]>('/api/crop-types')
  return response.data
}

export async function getCrops(farmId: string, fieldId: string): Promise<Crop[]> {
  const response = await api.get<Crop[]>(basePath(farmId, fieldId))
  return response.data
}

export async function getCrop(
  farmId: string,
  fieldId: string,
  cropId: string,
): Promise<Crop> {
  const response = await api.get<Crop>(`${basePath(farmId, fieldId)}/${cropId}`)
  return response.data
}

export async function createCrop(
  farmId: string,
  fieldId: string,
  request: CropRequest,
): Promise<Crop> {
  const response = await api.post<Crop>(basePath(farmId, fieldId), request)
  return response.data
}

export async function updateCrop(
  farmId: string,
  fieldId: string,
  cropId: string,
  request: CropRequest,
): Promise<Crop> {
  const response = await api.put<Crop>(
    `${basePath(farmId, fieldId)}/${cropId}`,
    request,
  )
  return response.data
}

export async function deleteCrop(
  farmId: string,
  fieldId: string,
  cropId: string,
): Promise<void> {
  await api.delete(`${basePath(farmId, fieldId)}/${cropId}`)
}
