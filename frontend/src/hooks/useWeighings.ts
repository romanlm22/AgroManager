import { useQuery } from '@tanstack/react-query'
import { getWeighings } from '../services/weighingService'

export function useWeighings(farmId: string, animalId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'animals', animalId, 'weighings'],
    queryFn: () => getWeighings(farmId, animalId),
    enabled: Boolean(farmId) && Boolean(animalId),
  })
}
