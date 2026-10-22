import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAnimal,
  createAnimalsBulk,
  deleteAnimal,
  moveAnimal,
  retireAnimal,
  updateAnimal,
} from '../services/livestockService'
import type {
  AnimalRequest,
  BulkAnimalRequest,
  MoveRequest,
  RetireRequest,
} from '../types/livestock'

// Los animales cuentan para el total de cabezas de los rodeos, por eso se
// invalida todo el establecimiento y no solo la lista de animales.
function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateAnimal(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: AnimalRequest) => createAnimal(farmId, request),
    onSuccess: invalidate,
  })
}

export function useCreateAnimalsBulk(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: BulkAnimalRequest) => createAnimalsBulk(farmId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateAnimal(farmId: string, animalId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: AnimalRequest) => updateAnimal(farmId, animalId, request),
    onSuccess: invalidate,
  })
}

export function useMoveAnimal(farmId: string, animalId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: MoveRequest) => moveAnimal(farmId, animalId, request),
    onSuccess: invalidate,
  })
}

export function useRetireAnimal(farmId: string, animalId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: RetireRequest) => retireAnimal(farmId, animalId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteAnimal(farmId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (animalId: string) => deleteAnimal(farmId, animalId),
    onSuccess: invalidate,
  })
}
