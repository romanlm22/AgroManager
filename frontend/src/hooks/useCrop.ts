import { useQuery } from '@tanstack/react-query'
import { getCrop } from '../services/cropService'

export function useCrop(farmId: string, fieldId: string, cropId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'fields', fieldId, 'crops', cropId],
    queryFn: () => getCrop(farmId, fieldId, cropId),
    enabled: Boolean(farmId) && Boolean(fieldId) && Boolean(cropId),
  })
}
