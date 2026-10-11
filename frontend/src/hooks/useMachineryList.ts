import { useQuery } from '@tanstack/react-query'
import { getMachineryList } from '../services/machineryService'

export function useMachineryList(farmId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'machinery'],
    queryFn: () => getMachineryList(farmId),
    enabled: Boolean(farmId),
  })
}
