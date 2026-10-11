import { useQuery } from '@tanstack/react-query'
import { getFields } from '../services/fieldService'

export function useFields(farmId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'fields'],
    queryFn: () => getFields(farmId),
    enabled: Boolean(farmId),
  })
}
