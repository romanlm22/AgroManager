import { api } from './api'
import type {
  Machinery,
  MachineryRequest,
  Maintenance,
  MaintenanceRequest,
} from '../types/machinery'

const basePath = (farmId: string) => `/api/farms/${farmId}/machinery`
const maintenancesPath = (farmId: string, machineryId: string) =>
  `${basePath(farmId)}/${machineryId}/maintenances`

export async function getMachineryList(farmId: string): Promise<Machinery[]> {
  const response = await api.get<Machinery[]>(basePath(farmId))
  return response.data
}

export async function getMachinery(
  farmId: string,
  machineryId: string,
): Promise<Machinery> {
  const response = await api.get<Machinery>(`${basePath(farmId)}/${machineryId}`)
  return response.data
}

export async function createMachinery(
  farmId: string,
  request: MachineryRequest,
): Promise<Machinery> {
  const response = await api.post<Machinery>(basePath(farmId), request)
  return response.data
}

export async function updateMachinery(
  farmId: string,
  machineryId: string,
  request: MachineryRequest,
): Promise<Machinery> {
  const response = await api.put<Machinery>(
    `${basePath(farmId)}/${machineryId}`,
    request,
  )
  return response.data
}

export async function deleteMachinery(
  farmId: string,
  machineryId: string,
): Promise<void> {
  await api.delete(`${basePath(farmId)}/${machineryId}`)
}

export async function getMaintenances(
  farmId: string,
  machineryId: string,
): Promise<Maintenance[]> {
  const response = await api.get<Maintenance[]>(maintenancesPath(farmId, machineryId))
  return response.data
}

export async function getMaintenance(
  farmId: string,
  machineryId: string,
  maintenanceId: string,
): Promise<Maintenance> {
  const response = await api.get<Maintenance>(
    `${maintenancesPath(farmId, machineryId)}/${maintenanceId}`,
  )
  return response.data
}

export async function createMaintenance(
  farmId: string,
  machineryId: string,
  request: MaintenanceRequest,
): Promise<Maintenance> {
  const response = await api.post<Maintenance>(
    maintenancesPath(farmId, machineryId),
    request,
  )
  return response.data
}

export async function updateMaintenance(
  farmId: string,
  machineryId: string,
  maintenanceId: string,
  request: MaintenanceRequest,
): Promise<Maintenance> {
  const response = await api.put<Maintenance>(
    `${maintenancesPath(farmId, machineryId)}/${maintenanceId}`,
    request,
  )
  return response.data
}

export async function deleteMaintenance(
  farmId: string,
  machineryId: string,
  maintenanceId: string,
): Promise<void> {
  await api.delete(`${maintenancesPath(farmId, machineryId)}/${maintenanceId}`)
}
