import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useDeleteReproductionEvent } from '../hooks/useReproductionEventMutations'
import { useReproductionEvents } from '../hooks/useReproductionEvents'
import { useReproductiveStatus } from '../hooks/useReproductiveStatus'
import type { ReproductionEvent, ReproductiveState } from '../types/reproduction'
import { formatDate, formatNumber } from '../utils/format'
import { reproductionEventTypeLabels, reproductiveStateLabels } from '../utils/labels'
import { describeReproductionEvent } from '../utils/reproduction'

const DUE_SOON_DAYS = 30

const stateStyles: Record<ReproductiveState, string> = {
  PRENADA: 'bg-green-100 text-green-800',
  VACIA: 'bg-red-100 text-red-800',
  EN_SERVICIO: 'bg-amber-100 text-amber-800',
  SIN_SERVICIO: 'bg-gray-100 text-gray-700',
}

function describeDue(daysToDue: number): string {
  if (daysToDue === 0) return 'hoy'
  if (daysToDue > 0) return `en ${formatNumber(daysToDue)} ${daysToDue === 1 ? 'día' : 'días'}`
  const overdue = Math.abs(daysToDue)
  return `hace ${formatNumber(overdue)} ${overdue === 1 ? 'día' : 'días'}`
}

function ReproductionPage() {
  const { farmId = '' } = useParams()
  const status = useReproductiveStatus(farmId)
  const events = useReproductionEvents(farmId)
  const deleteEvent = useDeleteReproductionEvent(farmId)
  const [toDelete, setToDelete] = useState<ReproductionEvent | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/livestock`

  const statuses = status.data ?? []
  const countOf = (state: ReproductiveState) =>
    statuses.filter((item) => item.state === state).length
  const dueSoon = statuses.filter(
    (item) =>
      item.state === 'PRENADA' && item.daysToDue !== null && item.daysToDue <= DUE_SOON_DAYS,
  ).length

  const cards = [
    { label: 'Preñadas', value: countOf('PRENADA') },
    { label: 'Vacías', value: countOf('VACIA') },
    { label: 'En servicio, sin tacto', value: countOf('EN_SERVICIO') },
    { label: `Partos en ${DUE_SOON_DAYS} días o menos`, value: dueSoon },
  ]

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
          Servicios, tactos, partos y abortos de las hembras del establecimiento.
        </p>
        <Link
          to={`${basePath}/reproduction/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuevo evento
        </Link>
      </div>

      <h2 className="mt-6 mb-3 text-lg font-semibold text-gray-900">Estado reproductivo</h2>

      {status.isPending && <p className="text-gray-600">Cargando estado reproductivo...</p>}

      {status.isError && (
        <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
          <p>No se pudo cargar el estado reproductivo.</p>
          <button type="button" onClick={() => status.refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {status.data && status.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Todavía no hay hembras con eventos reproductivos. Registrá el primero con el botón
          de arriba.
        </div>
      )}

      {status.data && status.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Caravana</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Último servicio</th>
                  <th className="px-4 py-3 font-medium">Último tacto</th>
                  <th className="px-4 py-3 font-medium">Parto estimado</th>
                  <th className="px-4 py-3 font-medium">Último parto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {status.data.map((item) => (
                  <tr key={item.animalId}>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to={`${basePath}/animals/${item.animalId}`}
                        className="text-green-700 hover:underline"
                      >
                        {item.animalTagNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateStyles[item.state]}`}
                      >
                        {reproductiveStateLabels[item.state] ?? item.state}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {item.lastServiceDate ? formatDate(item.lastServiceDate) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {item.lastTactoDate ? formatDate(item.lastTactoDate) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {item.estimatedDueDate ? (
                        <>
                          {formatDate(item.estimatedDueDate)}
                          {item.daysToDue !== null && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({describeDue(item.daysToDue)})
                            </span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {item.lastBirthDate ? formatDate(item.lastBirthDate) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            El parto estimado se calcula con 283 días de gestación desde el último servicio.
          </p>
        </>
      )}

      <h2 className="mt-8 mb-3 text-lg font-semibold text-gray-900">Eventos</h2>

      {events.isPending && <p className="text-gray-600">Cargando eventos...</p>}

      {events.isError && (
        <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar los eventos.</p>
          <button type="button" onClick={() => events.refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {events.data && events.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
          No hay eventos registrados.
        </div>
      )}

      {events.data && events.data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Hembra</th>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Detalle</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.data.map((event) => (
                <tr key={event.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {formatDate(event.eventDate)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`${basePath}/animals/${event.animalId}`}
                      className="text-green-700 hover:underline"
                    >
                      {event.animalTagNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {reproductionEventTypeLabels[event.eventType] ?? event.eventType}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{describeReproductionEvent(event)}</td>
                  <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`${basePath}/reproduction/${event.id}/edit`}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar evento"
          message={`¿Seguro que querés eliminar este evento del ${formatDate(toDelete.eventDate)} de la caravana ${toDelete.animalTagNumber}? Si era un parto con cría, la ficha del ternero se conserva. Esta acción no se puede deshacer.`}
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

export default ReproductionPage
