import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteFarm, updateFarm } from '../services/farmService'
import type { FarmRequest } from '../types/farm'

export function useUpdateFarm(farmId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: FarmRequest) => updateFarm(farmId, request),
    // Cambiar nombre o coordenadas afecta la lista, el dashboard y el clima.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  })
}

export function useDeleteFarm(farmId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteFarm(farmId),
    onSuccess: () => {
      // Se descartan los datos del establecimiento eliminado para que nada
      // intente volver a pedirlos (devolvería error), y se refresca solo la lista.
      queryClient.removeQueries({ queryKey: ['farms', farmId] })
      return queryClient.invalidateQueries({ queryKey: ['farms'], exact: true })
    },
  })
}
