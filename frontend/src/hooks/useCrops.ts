import { useQuery } from '@tanstack/react-query'
import { getCrops } from '../services/cropService'

export function useCrops(farmId: string, fieldId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'fields', fieldId, 'crops'],
    queryFn: () => getCrops(farmId, fieldId),
    enabled: Boolean(farmId) && Boolean(fieldId),
  })
}
