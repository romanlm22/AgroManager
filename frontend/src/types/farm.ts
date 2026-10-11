export type FarmRole = 'OWNER' | 'MEMBER'

export interface Farm {
  id: string
  name: string
  description: string | null
  location: string | null
  totalAreaHa: number | null
  latitude: number | null
  longitude: number | null
  myRole: FarmRole
  createdAt: string
  updatedAt: string
}

export interface FarmRequest {
  name: string
  description: string | null
  location: string | null
  totalAreaHa: number | null
  latitude: number | null
  longitude: number | null
}
