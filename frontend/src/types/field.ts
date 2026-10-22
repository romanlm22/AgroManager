export type FieldStatus = 'ACTIVE' | 'FALLOW' | 'INACTIVE'

export type LandUse = 'AGRICULTURA' | 'GANADERIA' | 'MIXTO'

export interface Field {
  id: string
  farmId: string
  name: string
  areaHa: number | null
  soilType: string | null
  latitude: number | null
  longitude: number | null
  status: FieldStatus
  landUse: LandUse
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface FieldRequest {
  name: string
  areaHa: number | null
  soilType: string | null
  latitude: number | null
  longitude: number | null
  status: FieldStatus
  landUse: LandUse
  notes: string | null
}
