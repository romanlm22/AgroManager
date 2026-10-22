export interface Weighing {
  id: string
  animalId: string
  weighingDate: string
  weightKg: number
  daysSincePrevious: number | null
  dailyGainKg: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface WeighingRequest {
  weighingDate: string
  weightKg: number
  notes: string | null
}
