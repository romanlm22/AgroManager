import type { Weather } from './dashboard'

export interface WeatherResponse extends Weather {
  farmId: string
  latitude: number
  longitude: number
}
