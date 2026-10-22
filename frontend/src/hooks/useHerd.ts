import { useQuery } from '@tanstack/react-query'
import { getHerd } from '../services/livestockService'

export function useHerd(farmId: string, herdId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'herds', herdId],
    queryFn: () => getHerd(farmId, herdId),
    enabled: Boolean(farmId) && Boolean(herdId),
  })
}
