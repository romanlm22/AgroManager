export const MAX_BULK_ANIMALS = 500
const MAX_TAG_LENGTH = 50

export type TagMode = 'RANGO' | 'LISTA'

export interface TagInput {
  mode: TagMode
  prefix: string
  from: string
  to: string
  list: string
}

export interface TagParseResult {
  tags: string[]
  /** Caravanas repetidas dentro de la lista pegada, que se ignoran. */
  ignoredRepeats: number
  error: string | null
  errorField: 'from' | 'to' | 'list' | null
  /** Si el usuario ya escribió algo en los campos del modo elegido. */
  hasInput: boolean
}

function fail(
  errorField: 'from' | 'to' | 'list',
  error: string,
  hasInput: boolean,
): TagParseResult {
  return { tags: [], ignoredRepeats: 0, error, errorField, hasInput }
}

function parseRange(input: TagInput): TagParseResult {
  const prefix = input.prefix.trim()
  const from = input.from.trim()
  const to = input.to.trim()
  const hasInput = from !== '' || to !== ''

  if (!/^\d+$/.test(from)) {
    return fail('from', 'Ingresá el número inicial (solo dígitos)', hasInput)
  }
  if (!/^\d+$/.test(to)) {
    return fail('to', 'Ingresá el número final (solo dígitos)', hasInput)
  }

  const start = Number(from)
  const end = Number(to)

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
    return fail('to', 'Los números son demasiado grandes', hasInput)
  }
  if (end < start) {
    return fail('to', 'El número final tiene que ser mayor o igual al inicial', hasInput)
  }
  if (end - start + 1 > MAX_BULK_ANIMALS) {
    return fail('to', `Máximo ${MAX_BULK_ANIMALS} animales por carga`, hasInput)
  }

  // El ancho de "desde" se conserva: 0001 → 0001, 0002, ...
  const width = from.length
  const tags: string[] = []
  for (let n = start; n <= end; n++) {
    tags.push(`${prefix}${String(n).padStart(width, '0')}`)
  }

  if (tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    return fail('from', `Las caravanas no pueden superar los ${MAX_TAG_LENGTH} caracteres`, hasInput)
  }

  return { tags, ignoredRepeats: 0, error: null, errorField: null, hasInput }
}

function parseList(input: TagInput): TagParseResult {
  const parts = input.list.split(/[\s,;]+/).filter((part) => part !== '')
  const hasInput = parts.length > 0

  if (!hasInput) {
    return fail('list', 'Pegá al menos una caravana', false)
  }

  const unique = [...new Set(parts)]

  if (unique.length > MAX_BULK_ANIMALS) {
    return fail('list', `Máximo ${MAX_BULK_ANIMALS} animales por carga`, hasInput)
  }
  if (unique.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    return fail('list', `Las caravanas no pueden superar los ${MAX_TAG_LENGTH} caracteres`, hasInput)
  }

  return {
    tags: unique,
    ignoredRepeats: parts.length - unique.length,
    error: null,
    errorField: null,
    hasInput,
  }
}

export function parseTags(input: TagInput): TagParseResult {
  return input.mode === 'RANGO' ? parseRange(input) : parseList(input)
}
