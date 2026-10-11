import { useQuery } from '@tanstack/react-query'
import { getMachinery } from '../services/machineryService'

export function useMachinery(farmId: string, machineryId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'machinery', machineryId],
    queryFn: () => getMachinery(farmId, machineryId),
    enabled: Boolean(farmId) && Boolean(machineryId),
  })
}
