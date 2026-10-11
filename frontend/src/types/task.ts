export type TaskType =
  | 'SIEMBRA'
  | 'FERTILIZACION'
  | 'PULVERIZACION'
  | 'RIEGO'
  | 'COSECHA'
  | 'CONTROL_MALEZAS'
  | 'OTRA'

export type TaskStatus = 'PLANIFICADA' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA'

export interface Task {
  id: string
  fieldId: string
  cropId: string | null
  responsibleId: string
  responsibleEmail: string
  taskType: TaskType
  status: TaskStatus
  taskDate: string
  cost: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  cropId: string | null
  taskType: TaskType
  status: TaskStatus
  taskDate: string
  cost: number | null
  notes: string | null
}
