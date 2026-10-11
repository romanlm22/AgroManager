import { useQuery } from '@tanstack/react-query'
import { getMaintenance } from '../services/machineryService'

export function useMaintenance(
  farmId: string,
  machineryId: string,
  maintenanceId: string,
) {
  return useQuery({
    queryKey: ['farms', farmId, 'machinery', machineryId, 'maintenances', maintenanceId],
    queryFn: () => getMaintenance(farmId, machineryId, maintenanceId),
    enabled: Boolean(farmId) && Boolean(machineryId) && Boolean(maintenanceId),
  })
}
