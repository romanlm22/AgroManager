import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createField, deleteField, updateField } from '../services/fieldService'
import type { FieldRequest } from '../types/field'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateField(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: FieldRequest) => createField(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateField(farmId: string, fieldId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: FieldRequest) => updateField(farmId, fieldId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteField(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (fieldId: string) => deleteField(farmId, fieldId),
    onSuccess: invalidate,
  })
}
