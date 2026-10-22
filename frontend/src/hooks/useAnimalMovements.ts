import { useQuery } from '@tanstack/react-query'
import { getAnimalMovements } from '../services/livestockService'

export function useAnimalMovements(farmId: string, animalId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'animals', animalId, 'movements'],
    queryFn: () => getAnimalMovements(farmId, animalId),
    enabled: Boolean(farmId) && Boolean(animalId),
  })
}
