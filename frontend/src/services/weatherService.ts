import { api } from './api'
import type { WeatherResponse } from '../types/weather'

export async function getWeather(farmId: string): Promise<WeatherResponse> {
  const response = await api.get<WeatherResponse>(`/api/farms/${farmId}/weather`)
  return response.data
}
