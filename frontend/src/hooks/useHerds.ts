import { useQuery } from '@tanstack/react-query'
import { getHerds } from '../services/livestockService'

export function useHerds(farmId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'herds'],
    queryFn: () => getHerds(farmId),
    enabled: Boolean(farmId),
  })
}
