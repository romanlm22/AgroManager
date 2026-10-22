export type LivestockCategory =
  | 'TERNERO'
  | 'VAQUILLONA'
  | 'VACA'
  | 'TORO'
  | 'NOVILLO'
  | 'OTRA'

export type AnimalSex = 'MACHO' | 'HEMBRA'

export type AnimalStatus = 'ACTIVO' | 'VENDIDO' | 'MUERTO'

export type HeadCountMode = 'FICHAS' | 'MANUAL'

export interface Herd {
  id: string
  farmId: string
  name: string
  category: LivestockCategory
  fieldId: string | null
  fieldName: string | null
  manualHeadCount: number
  trackedAnimals: number
  headCount: number
  headCountMode: HeadCountMode
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface HerdRequest {
  name: string
  category: LivestockCategory
  fieldId: string | null
  manualHeadCount: number | null
  notes: string | null
}

export interface Animal {
  id: string
  farmId: string
  tagNumber: string
  sex: AnimalSex
  breed: string | null
  birthDate: string | null
  category: LivestockCategory
  status: AnimalStatus
  currentWeightKg: number | null
  herdId: string | null
  herdName: string | null
  fieldId: string | null
  fieldName: string | null
  motherId: string | null
  motherTagNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface AnimalRequest {
  tagNumber: string
  sex: AnimalSex
  breed: string | null
  birthDate: string | null
  category: LivestockCategory
  status: AnimalStatus
  currentWeightKg: number | null
  herdId: string | null
  fieldId: string | null
  notes: string | null
}

export interface BulkAnimalRequest {
  tagNumbers: string[]
  sex: AnimalSex
  breed: string | null
  birthDate: string | null
  category: LivestockCategory
  herdId: string | null
  fieldId: string | null
  notes: string | null
}

export interface MoveRequest {
  toFieldId: string
  movementDate: string
  notes: string | null
}

export interface AnimalMovement {
  id: string
  animalId: string
  fromFieldId: string | null
  fromFieldName: string | null
  toFieldId: string | null
  toFieldName: string | null
  movementDate: string
  notes: string | null
  createdAt: string
}

export interface RetireRequest {
  status: 'VENDIDO' | 'MUERTO'
  retireDate: string
  finalWeightKg: number | null
  pricePerKg: number | null
}
