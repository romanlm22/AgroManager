import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useCrops } from '../hooks/useCrops'
import { useDeleteCrop } from '../hooks/useCropMutations'
import type { Crop } from '../types/crop'
import { formatDate, formatNumber } from '../utils/format'
import { cropStatusLabels } from '../utils/labels'

const statusStyles: Record<string, string> = {
  PLANTED: 'bg-blue-100 text-blue-800',
  GROWING: 'bg-green-100 text-green-800',
  HARVESTED: 'bg-amber-100 text-amber-800',
  LOST: 'bg-red-100 text-red-800',
}

function CropsPage() {
  const { farmId = '', fieldId = '' } = useParams()
  const { data: crops, isPending, isError, refetch } = useCrops(farmId, fieldId)
  const deleteCrop = useDeleteCrop(farmId, fieldId)
  const [cropToDelete, setCropToDelete] = useState<Crop | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/fields/${fieldId}/crops`

  const closeDialog = () => {
    setCropToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!cropToDelete) return
    setDeleteError(null)

    try {
      await deleteCrop.mutateAsync(cropToDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el cultivo. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Cultivos</h2>
        <Link
          to={`${basePath}/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuevo cultivo
        </Link>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando cultivos...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar los cultivos.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {crops && crops.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Este lote todavía no tiene cultivos. Registrá el primero con el botón de arriba.
        </div>
      )}

      {crops && crops.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Cultivo</th>
                <th className="px-4 py-3 font-medium">Siembra</th>
                <th className="px-4 py-3 font-medium">Cosecha estimada</th>
                <th className="px-4 py-3 font-medium">Cosecha real</th>
                <th className="px-4 py-3 font-medium">Superficie</th>
                <th className="px-4 py-3 font-medium">Rinde</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {crops.map((crop) => (
                <tr key={crop.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {crop.cropTypeName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(crop.plantingDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {crop.estimatedHarvestDate
                      ? formatDate(crop.estimatedHarvestDate)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {crop.actualHarvestDate ? formatDate(crop.actualHarvestDate) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {crop.plantedAreaHa !== null
                      ? `${formatNumber(crop.plantedAreaHa)} ha`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {crop.yieldKgHa !== null
                      ? `${formatNumber(crop.yieldKgHa)} kg/ha`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusStyles[crop.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cropStatusLabels[crop.status] ?? crop.status}
                    </span>
                  </td>
                  <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`${basePath}/${crop.id}/edit`}
                      className="text-green-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCropToDelete(crop)}
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

      {cropToDelete && (
        <ConfirmDialog
          title="Eliminar cultivo"
          message={`¿Seguro que querés eliminar el cultivo de ${cropToDelete.cropTypeName}? Las labores asociadas no se eliminan: quedan sin cultivo. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteCrop.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default CropsPage
