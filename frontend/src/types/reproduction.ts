import type { AnimalSex } from './livestock'

export type ReproductionEventType = 'SERVICIO' | 'TACTO' | 'PARTO' | 'ABORTO'

export type ServiceType = 'NATURAL' | 'INSEMINACION'

export type TactoResult = 'PRENADA' | 'VACIA'

export type ReproductiveState = 'PRENADA' | 'VACIA' | 'EN_SERVICIO' | 'SIN_SERVICIO'

export interface ReproductionEvent {
  id: string
  farmId: string
  animalId: string
  animalTagNumber: string
  eventType: ReproductionEventType
  eventDate: string
  serviceType: ServiceType | null
  sireAnimalId: string | null
  sireTagNumber: string | null
  sireDescription: string | null
  tactoResult: TactoResult | null
  calfAnimalId: string | null
  calfTagNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CalfRequest {
  tagNumber: string
  sex: AnimalSex
  birthWeightKg: number | null
}

export interface ReproductionEventRequest {
  animalId: string
  eventType: ReproductionEventType
  eventDate: string
  serviceType: ServiceType | null
  sireAnimalId: string | null
  sireDescription: string | null
  tactoResult: TactoResult | null
  calf: CalfRequest | null
  notes: string | null
}

export interface ReproductiveStatus {
  animalId: string
  animalTagNumber: string
  state: ReproductiveState
  lastServiceDate: string | null
  lastTactoDate: string | null
  lastBirthDate: string | null
  estimatedDueDate: string | null
  daysToDue: number | null
}

export interface ReproductionEventFilters {
  animalId?: string
}
