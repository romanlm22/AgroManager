import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createWeighing,
  deleteWeighing,
  updateWeighing,
} from '../services/weighingService'
import type { WeighingRequest } from '../types/weighing'

// Un pesaje cambia el peso actual del animal, así que se invalida todo el establecimiento.
function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateWeighing(farmId: string, animalId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: WeighingRequest) => createWeighing(farmId, animalId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateWeighing(farmId: string, animalId: string, weighingId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: WeighingRequest) =>
      updateWeighing(farmId, animalId, weighingId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteWeighing(farmId: string, animalId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (weighingId: string) => deleteWeighing(farmId, animalId, weighingId),
    onSuccess: invalidate,
  })
}
