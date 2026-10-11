import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { getWeather } from '../services/weatherService'

export function useWeather(farmId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'weather'],
    queryFn: () => getWeather(farmId),
    enabled: Boolean(farmId),
    // Sin coordenadas (400) reintentar no sirve: el resultado sería el mismo.
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 400) && failureCount < 1,
  })
}
