import { useQuery } from '@tanstack/react-query'
import { getReproductionEvents } from '../services/reproductionService'
import type { ReproductionEventFilters } from '../types/reproduction'

export function useReproductionEvents(farmId: string, filters: ReproductionEventFilters = {}) {
  return useQuery({
    queryKey: ['farms', farmId, 'reproduction-events', filters],
    queryFn: () => getReproductionEvents(farmId, filters),
    enabled: Boolean(farmId),
  })
}
