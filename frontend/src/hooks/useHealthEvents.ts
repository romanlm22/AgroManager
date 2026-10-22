import { useQuery } from '@tanstack/react-query'
import { getHealthEvents } from '../services/healthService'
import type { HealthEventFilters } from '../types/health'

export function useHealthEvents(farmId: string, filters: HealthEventFilters = {}) {
  return useQuery({
    queryKey: ['farms', farmId, 'health-events', filters],
    queryFn: () => getHealthEvents(farmId, filters),
    enabled: Boolean(farmId),
  })
}
