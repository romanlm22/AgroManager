import { useQuery } from '@tanstack/react-query'
import { getField } from '../services/fieldService'

export function useField(farmId: string, fieldId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'fields', fieldId],
    queryFn: () => getField(farmId, fieldId),
    enabled: Boolean(farmId) && Boolean(fieldId),
  })
}