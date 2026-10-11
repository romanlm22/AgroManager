import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../services/dashboardService'

export function useDashboard(farmId: string | undefined) {
  return useQuery({
    queryKey: ['farms', farmId, 'dashboard'],
    queryFn: () => getDashboard(farmId as string),
    enabled: Boolean(farmId),
  })
}
