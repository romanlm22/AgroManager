import { useQuery } from '@tanstack/react-query'
import { getProductions } from '../services/productionService'
import type { ProductionFilters } from '../types/production'

export function useProductions(farmId: string, filters: ProductionFilters = {}) {
  return useQuery({
    queryKey: ['farms', farmId, 'productions', filters],
    queryFn: () => getProductions(farmId, filters),
    enabled: Boolean(farmId),
  })
}
