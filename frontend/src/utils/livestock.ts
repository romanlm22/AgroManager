import { isAxiosError } from 'axios'
import type { Field } from '../types/field'

/**
 * Potreros disponibles para elegir: los lotes de ganadería o mixtos. Si el animal
 * o rodeo ya está en un lote agrícola, ese lote se conserva para no perder el valor.
 */
export function grazingFields(fields: Field[], keepFieldId?: string | null): Field[] {
  return fields.filter(
    (field) => field.landUse !== 'AGRICULTURA' || field.id === keepFieldId,
  )
}

/**
 * Si el error es un 409 por caravanas repetidas, devuelve las caravanas en
 * conflicto; si no, devuelve null.
 */
export function getDuplicateTags(error: unknown): string[] | null {
  if (!isAxiosError(error) || error.response?.status !== 409) return null

  const duplicates = (error.response.data as { duplicates?: unknown } | undefined)
    ?.duplicates

  return Array.isArray(duplicates) ? duplicates.map(String) : []
}

export function describeDuplicateTags(tags: string[]): string {
  if (tags.length === 0) return 'Ya existe un animal con esa caravana.'
  if (tags.length === 1) return `Ya existe un animal con la caravana ${tags[0]}.`

  const shown = tags.slice(0, 10).join(', ')
  const rest = tags.length > 10 ? ` y ${tags.length - 10} más` : ''
  return `Ya existen animales con estas caravanas: ${shown}${rest}.`
}
