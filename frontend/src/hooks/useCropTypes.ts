import { useQuery } from '@tanstack/react-query'
import { getCropTypes } from '../services/cropService'

export function useCropTypes() {
  return useQuery({
    queryKey: ['crop-types'],
    queryFn: getCropTypes,
  })
}
