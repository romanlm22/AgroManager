import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useMachinery } from '../hooks/useMachinery'
import { useMaintenances } from '../hooks/useMaintenances'
import { useDeleteMaintenance } from '../hooks/useMaintenanceMutations'
import type { Maintenance } from '../types/machinery'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import { machineryStatusLabels, machineryTypeLabels } from '../utils/labels'

const statusStyles: Record<string, string> = {
  OPERATIVA: 'bg-green-100 text-green-800',
  EN_MANTENIMIENTO: 'bg-amber-100 text-amber-800',
  FUERA_DE_SERVICIO: 'bg-red-100 text-red-800',
}

function MachineryDetailPage() {
  const { farmId = '', machineryId = '' } = useParams()
  const machine = useMachinery(farmId, machineryId)
  const maintenances = useMaintenances(farmId, machineryId)
  const deleteMaintenance = useDeleteMaintenance(farmId, machineryId)
  const [toDelete, setToDelete] = useState<Maintenance | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/machinery`
  const basePath = `${listPath}/${machineryId}/maintenances`

  const closeDialog = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setDeleteError(null)

    try {
      await deleteMaintenance.mutateAsync(toDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el mantenimiento. Intentá de nuevo.')
    }
  }

  const totalCost = (maintenances.data ?? []).reduce(
    (sum, maintenance) => sum + (maintenance.cost ?? 0),
    0,
  )

  return (
    <div>
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Maquinaria
      </Link>

      {machine.isPending && <p className="mt-2 text-gray-600">Cargando máquina...</p>}

      {machine.isError && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
          No se encontró la máquina.
        </p>
      )}

      {machine.data && (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{machine.data.name}</h1>
              <p className="text-sm text-gray-600">
                {machineryTypeLabels[machine.data.machineryType] ?? machine.data.machineryType}
                {[machine.data.brand, machine.data.model].filter(Boolean).length > 0
                  ? ` · ${[machine.data.brand, machine.data.model].filter(Boolean).join(' ')}`
                  : ''}
                {machine.data.year ? ` · ${machine.data.year}` : ''}
              </p>
            </div>
            <Link
              to={`${listPath}/${machineryId}/edit`}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Editar máquina
            </Link>
          </div>

          <dl className="mt-4 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-500">Estado</dt>
              <dd className="mt-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[machine.data.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {machineryStatusLabels[machine.data.status] ?? machine.data.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Horas de uso</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {machine.data.hoursUsed !== null
                  ? `${formatNumber(machine.data.hoursUsed)} h`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Próximo mantenimiento</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {machine.data.nextMaintenanceDate
                  ? formatDate(machine.data.nextMaintenanceDate)
                  : '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Mantenimientos</h2>
            <Link
              to={`${basePath}/new`}
              className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Nuevo mantenimiento
            </Link>
          </div>

          {maintenances.isPending && (
            <p className="mt-4 text-gray-600">Cargando mantenimientos...</p>
          )}

          {maintenances.isError && (
            <div role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
              <p>No se pudieron cargar los mantenimientos.</p>
              <button
                type="button"
                onClick={() => maintenances.refetch()}
                className="mt-2 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {maintenances.data && maintenances.data.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              Esta máquina todavía no tiene mantenimientos registrados.
            </div>
          )}

          {maintenances.data && maintenances.data.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Descripción</th>
                    <th className="px-4 py-3 font-medium">Costo</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {maintenances.data.map((maintenance) => (
                    <tr key={maintenance.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {formatDate(maintenance.maintenanceDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {maintenance.description ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {maintenance.cost !== null ? formatCurrency(maintenance.cost) : '—'}
                      </td>
                      <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          to={`${basePath}/${maintenance.id}/edit`}
                          className="text-green-700 hover:underline"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setToDelete(maintenance)}
                          className="text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right font-medium text-gray-700">
                      Costo total
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(totalCost)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar mantenimiento"
          message={`¿Seguro que querés eliminar el mantenimiento del ${formatDate(toDelete.maintenanceDate)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteMaintenance.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default MachineryDetailPage
