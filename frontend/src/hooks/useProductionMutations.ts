import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createProduction,
  deleteProduction,
  updateProduction,
} from '../services/productionService'
import type { ProductionRequest } from '../types/production'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateProduction(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: ProductionRequest) => createProduction(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateProduction(farmId: string, productionId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: ProductionRequest) =>
      updateProduction(farmId, productionId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteProduction(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (productionId: string) => deleteProduction(farmId, productionId),
    onSuccess: invalidate,
  })
}
