export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR')
}

export function formatShortDay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
  })
}

/** "2026-10" -> "oct 2026". */
export function formatMonth(yearMonth: string): string {
  return new Date(`${yearMonth}-01T00:00:00`).toLocaleDateString('es-AR', {
    month: 'short',
    year: 'numeric',
  })
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-AR')
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}
