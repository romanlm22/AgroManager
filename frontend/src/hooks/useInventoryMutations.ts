import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
} from '../services/inventoryService'
import type { InventoryItemRequest } from '../types/inventory'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateInventoryItem(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: InventoryItemRequest) =>
      createInventoryItem(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateInventoryItem(farmId: string, itemId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: InventoryItemRequest) =>
      updateInventoryItem(farmId, itemId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteInventoryItem(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (itemId: string) => deleteInventoryItem(farmId, itemId),
    onSuccess: invalidate,
  })
}
