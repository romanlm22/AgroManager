import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createHealthEvent,
  deleteHealthEvent,
  updateHealthEvent,
} from '../services/healthService'
import type { HealthEventRequest } from '../types/health'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateHealthEvent(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: HealthEventRequest) => createHealthEvent(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateHealthEvent(farmId: string, eventId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: HealthEventRequest) => updateHealthEvent(farmId, eventId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteHealthEvent(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (eventId: string) => deleteHealthEvent(farmId, eventId),
    onSuccess: invalidate,
  })
}
