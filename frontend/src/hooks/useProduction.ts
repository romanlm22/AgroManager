import { useQuery } from '@tanstack/react-query'
import { getProduction } from '../services/productionService'

export function useProduction(farmId: string, productionId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'productions', productionId],
    queryFn: () => getProduction(farmId, productionId),
    enabled: Boolean(farmId) && Boolean(productionId),
  })
}
