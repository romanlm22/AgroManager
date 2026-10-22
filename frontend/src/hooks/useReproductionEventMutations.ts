import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createReproductionEvent,
  deleteReproductionEvent,
  updateReproductionEvent,
} from '../services/reproductionService'
import type { ReproductionEventRequest } from '../types/reproduction'

// Un parto con cría crea un animal nuevo, así que se invalida todo el establecimiento.
function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateReproductionEvent(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: ReproductionEventRequest) =>
      createReproductionEvent(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateReproductionEvent(farmId: string, eventId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: ReproductionEventRequest) =>
      updateReproductionEvent(farmId, eventId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteReproductionEvent(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (eventId: string) => deleteReproductionEvent(farmId, eventId),
    onSuccess: invalidate,
  })
}
