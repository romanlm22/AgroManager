export type HealthEventType = 'VACUNACION' | 'DESPARASITACION' | 'TRATAMIENTO' | 'OTRO'

export interface HealthEvent {
  id: string
  farmId: string
  animalId: string | null
  animalTagNumber: string | null
  herdId: string | null
  herdName: string | null
  eventType: HealthEventType
  eventDate: string
  product: string
  dose: string | null
  nextDoseDate: string | null
  nextDosePending: boolean
  cost: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface HealthEventRequest {
  animalId: string | null
  herdId: string | null
  eventType: HealthEventType
  eventDate: string
  product: string
  dose: string | null
  nextDoseDate: string | null
  cost: number | null
  notes: string | null
}

export interface HealthEventFilters {
  animalId?: string
  herdId?: string
}
