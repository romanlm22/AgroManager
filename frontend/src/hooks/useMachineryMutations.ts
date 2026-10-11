import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createMachinery,
  deleteMachinery,
  updateMachinery,
} from '../services/machineryService'
import type { MachineryRequest } from '../types/machinery'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateMachinery(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: MachineryRequest) => createMachinery(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateMachinery(farmId: string, machineryId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: MachineryRequest) =>
      updateMachinery(farmId, machineryId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteMachinery(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (machineryId: string) => deleteMachinery(farmId, machineryId),
    onSuccess: invalidate,
  })
}
