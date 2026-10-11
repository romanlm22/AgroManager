import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createMaintenance,
  deleteMaintenance,
  updateMaintenance,
} from '../services/machineryService'
import type { MaintenanceRequest } from '../types/machinery'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateMaintenance(farmId: string, machineryId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: MaintenanceRequest) =>
      createMaintenance(farmId, machineryId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateMaintenance(
  farmId: string,
  machineryId: string,
  maintenanceId: string,
) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: MaintenanceRequest) =>
      updateMaintenance(farmId, machineryId, maintenanceId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteMaintenance(farmId: string, machineryId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (maintenanceId: string) =>
      deleteMaintenance(farmId, machineryId, maintenanceId),
    onSuccess: invalidate,
  })
}
