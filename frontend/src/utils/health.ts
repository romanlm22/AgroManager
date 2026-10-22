import type { HealthEvent } from '../types/health'
import { todayIso } from './dates'

export type DoseStatus = 'OVERDUE' | 'SOON' | 'OK'

const SOON_DAYS = 7

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-CA')
}

/**
 * Estado de la próxima dosis. Solo cuenta si el evento es el más reciente para su
 * destino y producto (lo decide el backend con nextDosePending).
 */
export function getDoseStatus(event: HealthEvent): DoseStatus | null {
  if (!event.nextDosePending || !event.nextDoseDate) return null

  const today = todayIso()
  if (event.nextDoseDate < today) return 'OVERDUE'
  if (event.nextDoseDate <= addDays(today, SOON_DAYS)) return 'SOON'
  return 'OK'
}
