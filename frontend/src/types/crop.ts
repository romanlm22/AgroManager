export type CropStatus = 'PLANTED' | 'GROWING' | 'HARVESTED' | 'LOST'

export interface CropType {
  id: string
  name: string
}

export interface Crop {
  id: string
  fieldId: string
  cropTypeId: string
  cropTypeName: string
  plantingDate: string
  estimatedHarvestDate: string | null
  actualHarvestDate: string | null
  plantedAreaHa: number | null
  yieldKgHa: number | null
  status: CropStatus
  createdAt: string
  updatedAt: string
}

export interface CropRequest {
  cropTypeId: string
  plantingDate: string
  estimatedHarvestDate: string | null
  actualHarvestDate: string | null
  plantedAreaHa: number | null
  yieldKgHa: number | null
  status: CropStatus
}
