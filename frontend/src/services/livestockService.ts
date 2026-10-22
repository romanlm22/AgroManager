import { api } from './api'
import type {
  Animal,
  AnimalMovement,
  AnimalRequest,
  BulkAnimalRequest,
  Herd,
  HerdRequest,
  MoveRequest,
  RetireRequest,
} from '../types/livestock'

const herdsPath = (farmId: string) => `/api/farms/${farmId}/herds`
const animalsPath = (farmId: string) => `/api/farms/${farmId}/animals`

export async function getHerds(farmId: string): Promise<Herd[]> {
  const response = await api.get<Herd[]>(herdsPath(farmId))
  return response.data
}

export async function getHerd(farmId: string, herdId: string): Promise<Herd> {
  const response = await api.get<Herd>(`${herdsPath(farmId)}/${herdId}`)
  return response.data
}

export async function createHerd(farmId: string, request: HerdRequest): Promise<Herd> {
  const response = await api.post<Herd>(herdsPath(farmId), request)
  return response.data
}

export async function updateHerd(
  farmId: string,
  herdId: string,
  request: HerdRequest,
): Promise<Herd> {
  const response = await api.put<Herd>(`${herdsPath(farmId)}/${herdId}`, request)
  return response.data
}

export async function moveHerd(
  farmId: string,
  herdId: string,
  request: MoveRequest,
): Promise<Herd> {
  const response = await api.post<Herd>(`${herdsPath(farmId)}/${herdId}/move`, request)
  return response.data
}

export async function deleteHerd(farmId: string, herdId: string): Promise<void> {
  await api.delete(`${herdsPath(farmId)}/${herdId}`)
}

export async function getAnimals(farmId: string): Promise<Animal[]> {
  const response = await api.get<Animal[]>(animalsPath(farmId))
  return response.data
}

export async function getAnimal(farmId: string, animalId: string): Promise<Animal> {
  const response = await api.get<Animal>(`${animalsPath(farmId)}/${animalId}`)
  return response.data
}

export async function createAnimal(
  farmId: string,
  request: AnimalRequest,
): Promise<Animal> {
  const response = await api.post<Animal>(animalsPath(farmId), request)
  return response.data
}

export async function createAnimalsBulk(
  farmId: string,
  request: BulkAnimalRequest,
): Promise<Animal[]> {
  const response = await api.post<Animal[]>(`${animalsPath(farmId)}/bulk`, request)
  return response.data
}

export async function updateAnimal(
  farmId: string,
  animalId: string,
  request: AnimalRequest,
): Promise<Animal> {
  const response = await api.put<Animal>(`${animalsPath(farmId)}/${animalId}`, request)
  return response.data
}

export async function moveAnimal(
  farmId: string,
  animalId: string,
  request: MoveRequest,
): Promise<Animal> {
  const response = await api.post<Animal>(
    `${animalsPath(farmId)}/${animalId}/move`,
    request,
  )
  return response.data
}

export async function retireAnimal(
  farmId: string,
  animalId: string,
  request: RetireRequest,
): Promise<Animal> {
  const response = await api.post<Animal>(
    `${animalsPath(farmId)}/${animalId}/retire`,
    request,
  )
  return response.data
}

export async function getAnimalMovements(
  farmId: string,
  animalId: string,
): Promise<AnimalMovement[]> {
  const response = await api.get<AnimalMovement[]>(
    `${animalsPath(farmId)}/${animalId}/movements`,
  )
  return response.data
}

export async function deleteAnimal(farmId: string, animalId: string): Promise<void> {
  await api.delete(`${animalsPath(farmId)}/${animalId}`)
}
