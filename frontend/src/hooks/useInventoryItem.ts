import { useQuery } from '@tanstack/react-query'
import { getInventoryItem } from '../services/inventoryService'

export function useInventoryItem(farmId: string, itemId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'inventory', itemId],
    queryFn: () => getInventoryItem(farmId, itemId),
    enabled: Boolean(farmId) && Boolean(itemId),
  })
}
