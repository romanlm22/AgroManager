import { api } from './api'
import type { Task, TaskRequest } from '../types/task'

const basePath = (farmId: string, fieldId: string) =>
  `/api/farms/${farmId}/fields/${fieldId}/tasks`

export async function getTasks(farmId: string, fieldId: string): Promise<Task[]> {
  const response = await api.get<Task[]>(basePath(farmId, fieldId))
  return response.data
}

export async function getTask(
  farmId: string,
  fieldId: string,
  taskId: string,
): Promise<Task> {
  const response = await api.get<Task>(`${basePath(farmId, fieldId)}/${taskId}`)
  return response.data
}

export async function createTask(
  farmId: string,
  fieldId: string,
  request: TaskRequest,
): Promise<Task> {
  const response = await api.post<Task>(basePath(farmId, fieldId), request)
  return response.data
}

export async function updateTask(
  farmId: string,
  fieldId: string,
  taskId: string,
  request: TaskRequest,
): Promise<Task> {
  const response = await api.put<Task>(
    `${basePath(farmId, fieldId)}/${taskId}`,
    request,
  )
  return response.data
}

export async function deleteTask(
  farmId: string,
  fieldId: string,
  taskId: string,
): Promise<void> {
  await api.delete(`${basePath(farmId, fieldId)}/${taskId}`)
}
