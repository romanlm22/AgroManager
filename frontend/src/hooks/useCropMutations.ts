import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCrop, deleteCrop, updateCrop } from '../services/cropService'
import type { CropRequest } from '../types/crop'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateCrop(farmId: string, fieldId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: CropRequest) => createCrop(farmId, fieldId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateCrop(farmId: string, fieldId: string, cropId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: CropRequest) =>
      updateCrop(farmId, fieldId, cropId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteCrop(farmId: string, fieldId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (cropId: string) => deleteCrop(farmId, fieldId, cropId),
    onSuccess: invalidate,
  })
}
