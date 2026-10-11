import { useQuery } from '@tanstack/react-query'
import { getInventoryItems } from '../services/inventoryService'

export function useInventoryItems(farmId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'inventory'],
    queryFn: () => getInventoryItems(farmId),
    enabled: Boolean(farmId),
  })
}
