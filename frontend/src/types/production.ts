export type LivestockProductType = 'LECHE' | 'CARNE' | 'LANA' | 'HUEVOS' | 'CUERO' | 'OTRO'

export type ProductionUnit = 'LITROS' | 'KG' | 'UNIDADES'

export interface Production {
  id: string
  farmId: string
  productType: LivestockProductType
  productionDate: string
  quantity: number
  unit: ProductionUnit
  herdId: string | null
  herdName: string | null
  animalId: string | null
  animalTagNumber: string | null
  pricePerUnit: number | null
  totalIncome: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductionRequest {
  productType: LivestockProductType
  productionDate: string
  quantity: number
  unit: ProductionUnit
  herdId: string | null
  animalId: string | null
  pricePerUnit: number | null
  notes: string | null
}

export interface ProductionFilters {
  startDate?: string
  endDate?: string
}
