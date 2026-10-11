export type MachineryType =
  | 'TRACTOR'
  | 'SEMBRADORA'
  | 'PULVERIZADORA'
  | 'COSECHADORA'
  | 'OTRA'

export type MachineryStatus = 'OPERATIVA' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'

export interface Machinery {
  id: string
  farmId: string
  name: string
  machineryType: MachineryType
  brand: string | null
  model: string | null
  year: number | null
  hoursUsed: number | null
  status: MachineryStatus
  nextMaintenanceDate: string | null
  createdAt: string
  updatedAt: string
}

export interface MachineryRequest {
  name: string
  machineryType: MachineryType
  brand: string | null
  model: string | null
  year: number | null
  hoursUsed: number | null
  status: MachineryStatus
  nextMaintenanceDate: string | null
}

export interface Maintenance {
  id: string
  machineryId: string
  maintenanceDate: string
  description: string | null
  cost: number | null
  createdAt: string
  updatedAt: string
}

export interface MaintenanceRequest {
  maintenanceDate: string
  description: string | null
  cost: number | null
}
