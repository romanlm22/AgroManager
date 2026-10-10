export interface CurrentWeather {
  temperatureC: number
  humidityPercent: number
  precipitationMm: number
  windSpeedKmh: number
}

export interface DailyForecast {
  date: string
  tempMinC: number
  tempMaxC: number
  precipitationSumMm: number
  precipitationProbabilityPercent: number
}

export interface Weather {
  current: CurrentWeather
  forecast: DailyForecast[]
}

export interface DashboardInventoryItem {
  id: string
  name: string
  stock: number
  unit: string
  expirationDate: string | null
}

export interface DashboardTask {
  id: string
  taskType: string
  status: string
  taskDate: string
}

export interface DashboardMachinery {
  id: string
  name: string
  nextMaintenanceDate: string | null
}

export interface Dashboard {
  farmId: string
  totalAreaHa: number | null
  fieldCount: number
  activeCropsCount: number
  plantedAreaHa: number
  totalTaskCost: number
  totalMaintenanceCost: number
  lowStockItems: DashboardInventoryItem[]
  expiringSoonItems: DashboardInventoryItem[]
  upcomingTasks: DashboardTask[]
  machineryDueForMaintenance: DashboardMachinery[]
  weather: Weather | null
}