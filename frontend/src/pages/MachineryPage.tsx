import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useMachineryList } from '../hooks/useMachineryList'
import { useDeleteMachinery } from '../hooks/useMachineryMutations'
import type { Machinery } from '../types/machinery'
import { formatDate, formatNumber } from '../utils/format'
import { machineryStatusLabels, machineryTypeLabels } from '../utils/labels'

const statusStyles: Record<string, string> = {
  OPERATIVA: 'bg-green-100 text-green-800',
  EN_MANTENIMIENTO: 'bg-amber-100 text-amber-800',
  FUERA_DE_SERVICIO: 'bg-red-100 text-red-800',
}

function MachineryPage() {
  const { farmId = '' } = useParams()
  const { data: machines, isPending, isError, refetch } = useMachineryList(farmId)
  const deleteMachinery = useDeleteMachinery(farmId)
  const [toDelete, setToDelete] = useState<Machinery | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/machinery`

  const closeDialog = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setDeleteError(null)

    try {
      await deleteMachinery.mutateAsync(toDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar la máquina. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Maquinaria</h1>
        <Link
          to={`${basePath}/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nueva máquina
        </Link>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando maquinaria...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudo cargar la maquinaria.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {machines && machines.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Todavía no cargaste máquinas. Registrá la primera con el botón de arriba.
        </div>
      )}

      {machines && machines.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Máquina</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Marca y modelo</th>
                <th className="px-4 py-3 font-medium">Horas</th>
                <th className="px-4 py-3 font-medium">Próx. mantenimiento</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {machines.map((machine) => (
                <tr key={machine.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`${basePath}/${machine.id}`}
                      className="text-green-700 hover:underline"
                    >
                      {machine.name}
                    </Link>
                    {machine.year && (
                      <p className="text-xs font-normal text-gray-500">{machine.year}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {machineryTypeLabels[machine.machineryType] ?? machine.machineryType}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {[machine.brand, machine.model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {machine.hoursUsed !== null ? `${formatNumber(machine.hoursUsed)} h` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {machine.nextMaintenanceDate
                      ? formatDate(machine.nextMaintenanceDate)
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusStyles[machine.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {machineryStatusLabels[machine.status] ?? machine.status}
                    </span>
                  </td>
                  <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`${basePath}/${machine.id}`}
                      className="text-green-700 hover:underline"
                    >
                      Mantenimientos
                    </Link>
                    <Link
                      to={`${basePath}/${machine.id}/edit`}
                      className="text-green-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(machine)}
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
          title="Eliminar máquina"
          message={`¿Seguro que querés eliminar "${toDelete.name}"? También se elimina todo su historial de mantenimientos. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteMachinery.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default MachineryPage
