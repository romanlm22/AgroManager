import { useQuery } from '@tanstack/react-query'
import { getHealthEvent } from '../services/healthService'

export function useHealthEvent(farmId: string, eventId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'health-events', eventId],
    queryFn: () => getHealthEvent(farmId, eventId),
    enabled: Boolean(farmId) && Boolean(eventId),
  })
}
