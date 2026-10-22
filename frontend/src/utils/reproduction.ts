import type { ReproductionEvent } from '../types/reproduction'
import { serviceTypeLabels, tactoResultLabels } from './labels'

/** Resumen de una línea con los datos propios de cada tipo de evento. */
export function describeReproductionEvent(event: ReproductionEvent): string {
  switch (event.eventType) {
    case 'SERVICIO': {
      const type = event.serviceType ? (serviceTypeLabels[event.serviceType] ?? event.serviceType) : ''
      const sire = event.sireTagNumber
        ? `toro ${event.sireTagNumber}`
        : (event.sireDescription ?? '')
      return [type, sire].filter(Boolean).join(' · ') || '—'
    }
    case 'TACTO':
      return event.tactoResult ? (tactoResultLabels[event.tactoResult] ?? event.tactoResult) : '—'
    case 'PARTO':
      return event.calfTagNumber ? `Cría: caravana ${event.calfTagNumber}` : 'Sin cría registrada'
    default:
      return '—'
  }
}
