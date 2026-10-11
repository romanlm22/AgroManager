import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFarm } from '../services/farmService'

export function useCreateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFarm,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  })
}
