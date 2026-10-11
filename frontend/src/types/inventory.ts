export type InventoryCategory =
  | 'SEMILLA'
  | 'FERTILIZANTE'
  | 'HERBICIDA'
  | 'FUNGICIDA'
  | 'INSECTICIDA'
  | 'OTRO'

export type InventoryUnit = 'KG' | 'LITRO' | 'UNIDAD' | 'BOLSA' | 'TONELADA'

export interface InventoryItem {
  id: string
  farmId: string
  name: string
  category: InventoryCategory
  supplier: string | null
  stock: number
  unit: InventoryUnit
  price: number | null
  expirationDate: string | null
  batchNumber: string | null
  createdAt: string
  updatedAt: string
}

export interface InventoryItemRequest {
  name: string
  category: InventoryCategory
  supplier: string | null
  stock: number
  unit: InventoryUnit
  price: number | null
  expirationDate: string | null
  batchNumber: string | null
}
