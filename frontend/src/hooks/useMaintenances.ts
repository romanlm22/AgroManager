import { useQuery } from '@tanstack/react-query'
import { getMaintenances } from '../services/machineryService'

export function useMaintenances(farmId: string, machineryId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'machinery', machineryId, 'maintenances'],
    queryFn: () => getMaintenances(farmId, machineryId),
    enabled: Boolean(farmId) && Boolean(machineryId),
  })
}
