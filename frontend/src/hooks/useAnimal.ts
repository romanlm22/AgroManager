import { useQuery } from '@tanstack/react-query'
import { getAnimal } from '../services/livestockService'

export function useAnimal(farmId: string, animalId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'animals', animalId],
    queryFn: () => getAnimal(farmId, animalId),
    enabled: Boolean(farmId) && Boolean(animalId),
  })
}
