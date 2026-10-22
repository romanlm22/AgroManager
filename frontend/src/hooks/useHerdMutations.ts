import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createHerd, deleteHerd, moveHerd, updateHerd } from '../services/livestockService'
import type { HerdRequest, MoveRequest } from '../types/livestock'

// Mover o editar un rodeo puede cambiar el potrero de sus animales, así que
// se invalida todo lo del establecimiento (rodeos, animales y movimientos).
function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateHerd(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: HerdRequest) => createHerd(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateHerd(farmId: string, herdId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: HerdRequest) => updateHerd(farmId, herdId, request),
    onSuccess: invalidate,
  })
}

export function useMoveHerd(farmId: string, herdId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: MoveRequest) => moveHerd(farmId, herdId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteHerd(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (herdId: string) => deleteHerd(farmId, herdId),
    onSuccess: invalidate,
  })
}
