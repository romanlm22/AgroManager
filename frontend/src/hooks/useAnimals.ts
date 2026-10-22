import { useQuery } from '@tanstack/react-query'
import { getAnimals } from '../services/livestockService'

export function useAnimals(farmId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'animals'],
    queryFn: () => getAnimals(farmId),
    enabled: Boolean(farmId),
  })
}
