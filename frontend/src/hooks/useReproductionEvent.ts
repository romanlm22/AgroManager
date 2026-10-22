import { useQuery } from '@tanstack/react-query'
import { getReproductionEvent } from '../services/reproductionService'

export function useReproductionEvent(farmId: string, eventId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'reproduction-events', eventId],
    queryFn: () => getReproductionEvent(farmId, eventId),
    enabled: Boolean(farmId) && Boolean(eventId),
  })
}
