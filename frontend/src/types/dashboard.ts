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

export interface LivestockCategoryCount {
  category: string
  headCount: number
}

export interface LivestockDueBirth {
  animalId: string
  tagNumber: string
  estimatedDueDate: string
  daysToDue: number
}

export interface LivestockDueDose {
  eventId: string
  targetName: string
  herdTarget: boolean
  product: string
  nextDoseDate: string
  overdue: boolean
}

export interface LivestockProductionTotal {
  productType: string
  unit: string
  quantity: number
  income: number
}

export interface LivestockMonthlyIncome {
  month: string
  income: number
}

export interface LivestockSummary {
  totalHeadCount: number
  trackedAnimals: number
  herdCount: number
  headByCategory: LivestockCategoryCount[]
  pregnantCount: number
  dueBirthsTotal: number
  dueBirths: LivestockDueBirth[]
  dueDosesTotal: number
  dueDoses: LivestockDueDose[]
  averageDailyGainKg: number | null
  animalsWithGain: number
  totalHealthCost: number
  currentMonthProduction: LivestockProductionTotal[]
  currentMonthIncome: number
  monthlyIncome: LivestockMonthlyIncome[]
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
  livestock: LivestockSummary
}
