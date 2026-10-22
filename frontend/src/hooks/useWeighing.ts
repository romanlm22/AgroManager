import { useQuery } from '@tanstack/react-query'
import { getWeighing } from '../services/weighingService'

export function useWeighing(farmId: string, animalId: string, weighingId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'animals', animalId, 'weighings', weighingId],
    queryFn: () => getWeighing(farmId, animalId, weighingId),
    enabled: Boolean(farmId) && Boolean(animalId) && Boolean(weighingId),
  })
}
