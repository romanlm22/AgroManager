import { useQuery } from '@tanstack/react-query'
import { getReproductiveStatus } from '../services/reproductionService'

export function useReproductiveStatus(farmId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'reproduction-status'],
    queryFn: () => getReproductiveStatus(farmId),
    enabled: Boolean(farmId),
  })
}
