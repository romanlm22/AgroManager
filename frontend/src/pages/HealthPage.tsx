import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { inputClassName } from '../components/formStyles'
import { useHealthEvents } from '../hooks/useHealthEvents'
import { useDeleteHealthEvent } from '../hooks/useHealthEventMutations'
import type { HealthEvent } from '../types/health'
import { formatCurrency, formatDate } from '../utils/format'
import { getDoseStatus } from '../utils/health'
import { healthEventTypeLabels } from '../utils/labels'

const doseStyles = {
  OVERDUE: { className: 'bg-red-100 text-red-800', label: 'Vencida' },
  SOON: { className: 'bg-amber-100 text-amber-800', label: 'Próxima' },
  OK: { className: 'bg-gray-100 text-gray-700', label: 'Programada' },
} as const

function HealthPage() {
  const { farmId = '' } = useParams()
  const { data: events, isPending, isError, refetch } = useHealthEvents(farmId)
  const deleteEvent = useDeleteHealthEvent(farmId)
  const [typeFilter, setTypeFilter] = useState('')
  const [onlyPending, setOnlyPending] = useState(false)
  const [toDelete, setToDelete] = useState<HealthEvent | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/livestock`

  const all = events ?? []
  const overdue = all.filter((event) => getDoseStatus(event) === 'OVERDUE').length
  const soon = all.filter((event) => getDoseStatus(event) === 'SOON').length

  const filtered = all.filter((event) => {
    if (typeFilter !== '' && event.eventType !== typeFilter) return false
    if (onlyPending) {
      const status = getDoseStatus(event)
      if (status !== 'OVERDUE' && status !== 'SOON') return false
    }
    return true
  })

  const closeDialog = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setDeleteError(null)

    try {
      await deleteEvent.mutateAsync(toDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el evento. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Vacunaciones, desparasitaciones y tratamientos, por animal o por rodeo.
        </p>
        <Link
          to={`${basePath}/health/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuevo evento
        </Link>
      </div>

      {(overdue > 0 || soon > 0) && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {overdue > 0 && (
            <p>
              <strong>{overdue}</strong> {overdue === 1 ? 'dosis vencida' : 'dosis vencidas'}.
            </p>
          )}
          {soon > 0 && (
            <p>
              <strong>{soon}</strong>{' '}
              {soon === 1 ? 'dosis próxima' : 'dosis próximas'} en los próximos 7 días.
            </p>
          )}
        </div>
      )}

      {isPending && <p className="mt-6 text-gray-600">Cargando eventos...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar los eventos.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {events && events.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Todavía no registraste eventos sanitarios.
        </div>
      )}

      {events && events.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filtrar por tipo"
              className={`${inputClassName} max-w-xs`}
            >
              <option value="">Todos los tipos</option>
              {Object.entries(healthEventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyPending}
                onChange={(event) => setOnlyPending(event.target.checked)}
              />
              Solo con dosis vencida o próxima
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              Ningún evento coincide con los filtros.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Aplicado a</th>
                    <th className="px-4 py-3 font-medium">Próxima dosis</th>
                    <th className="px-4 py-3 font-medium">Costo</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((event) => {
                    const status = getDoseStatus(event)

                    return (
                      <tr key={event.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {formatDate(event.eventDate)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {healthEventTypeLabels[event.eventType] ?? event.eventType}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {event.product}
                          {event.dose && (
                            <p className="text-xs text-gray-500">{event.dose}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {event.animalId ? (
                            <Link
                              to={`${basePath}/animals/${event.animalId}`}
                              className="text-green-700 hover:underline"
                            >
                              Caravana {event.animalTagNumber}
                            </Link>
                          ) : (
                            <>Rodeo {event.herdName}</>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {event.nextDoseDate ? formatDate(event.nextDoseDate) : '—'}
                          {status && (
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${doseStyles[status].className}`}
                            >
                              {doseStyles[status].label}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {event.cost !== null ? formatCurrency(event.cost) : '—'}
                        </td>
                        <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                          <Link
                            to={`${basePath}/health/${event.id}/edit`}
                            className="text-green-700 hover:underline"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() => setToDelete(event)}
                            className="text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar evento"
          message={`¿Seguro que querés eliminar "${toDelete.product}" del ${formatDate(toDelete.eventDate)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteEvent.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default HealthPage
