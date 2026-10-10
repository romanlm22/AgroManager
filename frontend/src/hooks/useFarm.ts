import { useQuery } from '@tanstack/react-query'
import { getFarm } from '../services/farmService'

export function useFarm(farmId: string | undefined) {
  return useQuery({
    queryKey: ['farms', farmId],
    queryFn: () => getFarm(farmId as string),
    enabled: Boolean(farmId),
  })
}