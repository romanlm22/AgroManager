import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAnimal } from '../hooks/useAnimal'
import { useAnimalMovements } from '../hooks/useAnimalMovements'
import { useHealthEvents } from '../hooks/useHealthEvents'
import { useReproductionEvents } from '../hooks/useReproductionEvents'
import { useDeleteWeighing } from '../hooks/useWeighingMutations'
import { useWeighings } from '../hooks/useWeighings'
import type { Weighing } from '../types/weighing'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import { getDoseStatus } from '../utils/health'
import { describeReproductionEvent } from '../utils/reproduction'
import {
  animalSexLabels,
  animalStatusLabels,
  healthEventTypeLabels,
  livestockCategoryLabels,
  reproductionEventTypeLabels,
} from '../utils/labels'

function AnimalDetailPage() {
  const { farmId = '', animalId = '' } = useParams()
  const { data: animal, isPending, isError } = useAnimal(farmId, animalId)
  const movements = useAnimalMovements(farmId, animalId)
  const weighings = useWeighings(farmId, animalId)
  const healthEvents = useHealthEvents(farmId, { animalId })
  const reproductionEvents = useReproductionEvents(farmId, { animalId })
  const deleteWeighing = useDeleteWeighing(farmId, animalId)
  const [weighingToDelete, setWeighingToDelete] = useState<Weighing | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/animals`
  const livestockPath = `/farms/${farmId}/livestock`

  const details: [string, string][] = animal
    ? [
        ['Categoría', livestockCategoryLabels[animal.category] ?? animal.category],
        ['Sexo', animalSexLabels[animal.sex] ?? animal.sex],
        ['Estado', animalStatusLabels[animal.status] ?? animal.status],
        ['Raza', animal.breed ?? '—'],
        ['Nacimiento', animal.birthDate ? formatDate(animal.birthDate) : '—'],
        [
          'Peso actual',
          animal.currentWeightKg !== null ? `${formatNumber(animal.currentWeightKg)} kg` : '—',
        ],
        ['Rodeo', animal.herdName ?? '—'],
        ['Potrero', animal.fieldName ?? '—'],
        ['Madre', animal.motherTagNumber ?? '—'],
      ]
    : []

  const closeDialog = () => {
    setWeighingToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!weighingToDelete) return
    setDeleteError(null)

    try {
      await deleteWeighing.mutateAsync(weighingToDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el pesaje. Intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-3xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Animales
      </Link>

      {isPending && <p className="mt-4 text-gray-600">Cargando animal...</p>}

      {isError && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
          No se encontró el animal.
        </p>
      )}

      {animal && (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Caravana {animal.tagNumber}</h1>
            <div className="flex flex-wrap gap-2">
              {animal.status === 'ACTIVO' && (
                <>
                  <Link
                    to={`${listPath}/${animal.id}/move`}
                    className="rounded border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                  >
                    Mover
                  </Link>
                  <Link
                    to={`${listPath}/${animal.id}/retire`}
                    className="rounded border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Dar de baja
                  </Link>
                </>
              )}
              <Link
                to={`${listPath}/${animal.id}/edit`}
                className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                Editar
              </Link>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
                <dd className="mt-1 text-gray-900">{value}</dd>
              </div>
            ))}
            {animal.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-gray-500">Observaciones</dt>
                <dd className="mt-1 whitespace-pre-line text-gray-900">{animal.notes}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Pesajes</h2>
            <Link
              to={`${listPath}/${animal.id}/weighings/new`}
              className="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
            >
              Nuevo pesaje
            </Link>
          </div>

          {weighings.isPending && <p className="text-gray-600">Cargando pesajes...</p>}

          {weighings.isError && (
            <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
              <p>No se pudieron cargar los pesajes.</p>
              <button type="button" onClick={() => weighings.refetch()} className="mt-2 underline">
                Reintentar
              </button>
            </div>
          )}

          {weighings.data && weighings.data.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
              Este animal todavía no tiene pesajes. El peso actual se actualiza solo con el
              último pesaje.
            </div>
          )}

          {weighings.data && weighings.data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Peso</th>
                    <th className="px-4 py-3 font-medium">Días desde el anterior</th>
                    <th className="px-4 py-3 font-medium">Ganancia diaria</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {weighings.data.map((weighing) => (
                    <tr key={weighing.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {formatDate(weighing.weighingDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                        {formatNumber(weighing.weightKg)} kg
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {weighing.daysSincePrevious ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {weighing.dailyGainKg !== null
                          ? `${weighing.dailyGainKg.toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} kg/día`
                          : '—'}
                      </td>
                      <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          to={`${listPath}/${animal.id}/weighings/${weighing.id}/edit`}
                          className="text-green-700 hover:underline"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setWeighingToDelete(weighing)}
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

          <div className="mt-8 mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Sanidad</h2>
            <Link
              to={`${livestockPath}/health/new?animalId=${animal.id}`}
              className="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
            >
              Registrar evento
            </Link>
          </div>

          {healthEvents.isPending && <p className="text-gray-600">Cargando eventos...</p>}

          {healthEvents.isError && (
            <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
              <p>No se pudieron cargar los eventos sanitarios.</p>
              <button type="button" onClick={() => healthEvents.refetch()} className="mt-2 underline">
                Reintentar
              </button>
            </div>
          )}

          {healthEvents.data && healthEvents.data.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
              Este animal todavía no tiene eventos sanitarios propios. Los de su rodeo se
              ven en la pestaña Sanidad.
            </div>
          )}

          {healthEvents.data && healthEvents.data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Próxima dosis</th>
                    <th className="px-4 py-3 font-medium">Costo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {healthEvents.data.map((event) => {
                    const status = getDoseStatus(event)

                    return (
                      <tr key={event.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {formatDate(event.eventDate)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {healthEventTypeLabels[event.eventType] ?? event.eventType}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{event.product}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {event.nextDoseDate ? formatDate(event.nextDoseDate) : '—'}
                          {status === 'OVERDUE' && (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                              Vencida
                            </span>
                          )}
                          {status === 'SOON' && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Próxima
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {event.cost !== null ? formatCurrency(event.cost) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {animal.sex === 'HEMBRA' && (
            <>
              <div className="mt-8 mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Reproducción</h2>
                <Link
                  to={`${livestockPath}/reproduction/new?animalId=${animal.id}`}
                  className="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                >
                  Registrar evento
                </Link>
              </div>

              {reproductionEvents.isPending && (
                <p className="text-gray-600">Cargando eventos reproductivos...</p>
              )}

              {reproductionEvents.isError && (
                <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
                  <p>No se pudieron cargar los eventos reproductivos.</p>
                  <button
                    type="button"
                    onClick={() => reproductionEvents.refetch()}
                    className="mt-2 underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {reproductionEvents.data && reproductionEvents.data.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                  Esta hembra todavía no tiene eventos reproductivos.
                </div>
              )}

              {reproductionEvents.data && reproductionEvents.data.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 font-medium">Evento</th>
                        <th className="px-4 py-3 font-medium">Detalle</th>
                        <th className="px-4 py-3 text-right font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reproductionEvents.data.map((event) => (
                        <tr key={event.id}>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                            {formatDate(event.eventDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {reproductionEventTypeLabels[event.eventType] ?? event.eventType}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {describeReproductionEvent(event)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <Link
                              to={`${livestockPath}/reproduction/${event.id}/edit`}
                              className="text-green-700 hover:underline"
                            >
                              Editar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div className="mt-8 mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Historial de movimientos</h2>
            <Link
              to={`${livestockPath}/productions/new?animalId=${animal.id}`}
              className="text-sm text-green-700 hover:underline"
            >
              Registrar producción de este animal
            </Link>
          </div>

          {movements.isPending && <p className="text-gray-600">Cargando movimientos...</p>}

          {movements.isError && (
            <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
              <p>No se pudo cargar el historial.</p>
              <button type="button" onClick={() => movements.refetch()} className="mt-2 underline">
                Reintentar
              </button>
            </div>
          )}

          {movements.data && movements.data.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
              Este animal todavía no tiene movimientos registrados.
            </div>
          )}

          {movements.data && movements.data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Desde</th>
                    <th className="px-4 py-3 font-medium">Hacia</th>
                    <th className="px-4 py-3 font-medium">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.data.map((movement) => (
                    <tr key={movement.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {formatDate(movement.movementDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {movement.fromFieldName ?? 'Sin potrero'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {movement.toFieldName ?? 'Sin potrero'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{movement.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {weighingToDelete && (
        <ConfirmDialog
          title="Eliminar pesaje"
          message={`¿Seguro que querés eliminar el pesaje del ${formatDate(weighingToDelete.weighingDate)}? El peso actual del animal se recalcula con el último pesaje que quede. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteWeighing.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default AnimalDetailPage
