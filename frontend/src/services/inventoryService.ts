import { api } from './api'
import type { InventoryItem, InventoryItemRequest } from '../types/inventory'

const basePath = (farmId: string) => `/api/farms/${farmId}/inventory`

export async function getInventoryItems(farmId: string): Promise<InventoryItem[]> {
  const response = await api.get<InventoryItem[]>(basePath(farmId))
  return response.data
}

export async function getInventoryItem(
  farmId: string,
  itemId: string,
): Promise<InventoryItem> {
  const response = await api.get<InventoryItem>(`${basePath(farmId)}/${itemId}`)
  return response.data
}

export async function createInventoryItem(
  farmId: string,
  request: InventoryItemRequest,
): Promise<InventoryItem> {
  const response = await api.post<InventoryItem>(basePath(farmId), request)
  return response.data
}

export async function updateInventoryItem(
  farmId: string,
  itemId: string,
  request: InventoryItemRequest,
): Promise<InventoryItem> {
  const response = await api.put<InventoryItem>(
    `${basePath(farmId)}/${itemId}`,
    request,
  )
  return response.data
}

export async function deleteInventoryItem(
  farmId: string,
  itemId: string,
): Promise<void> {
  await api.delete(`${basePath(farmId)}/${itemId}`)
}
