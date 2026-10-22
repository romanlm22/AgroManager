import type { Animal } from '../../types/livestock'

export type TargetType = 'ANIMAL' | 'HERD' | 'NONE'

export interface ResolvedTarget {
  animalId: string | null
  herdId: string | null
  error: { field: 'animalTag' | 'herdId'; message: string } | null
}

/**
 * Traduce lo que el usuario eligió en el formulario (animal por caravana, rodeo o
 * ninguno) a los ids que espera la API.
 */
export function resolveTarget(
  type: TargetType,
  animalTag: string,
  herdId: string,
  animals: Animal[],
): ResolvedTarget {
  if (type === 'NONE') {
    return { animalId: null, herdId: null, error: null }
  }

  if (type === 'HERD') {
    if (herdId === '') {
      return { animalId: null, herdId: null, error: { field: 'herdId', message: 'Elegí un rodeo' } }
    }
    return { animalId: null, herdId, error: null }
  }

  const tag = animalTag.trim().toLowerCase()
  if (tag === '') {
    return {
      animalId: null,
      herdId: null,
      error: { field: 'animalTag', message: 'Ingresá la caravana del animal' },
    }
  }

  const animal = animals.find((candidate) => candidate.tagNumber.toLowerCase() === tag)
  if (!animal) {
    return {
      animalId: null,
      herdId: null,
      error: { field: 'animalTag', message: 'No hay ningún animal con esa caravana' },
    }
  }

  return { animalId: animal.id, herdId: null, error: null }
}
