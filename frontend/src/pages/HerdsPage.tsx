import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useHerds } from '../hooks/useHerds'
import { useDeleteHerd } from '../hooks/useHerdMutations'
import type { Herd } from '../types/livestock'
import { formatNumber } from '../utils/format'
import { livestockCategoryLabels } from '../utils/labels'

function HerdsPage() {
  const { farmId = '' } = useParams()
  const { data: herds, isPending, isError, refetch } = useHerds(farmId)
  const deleteHerd = useDeleteHerd(farmId)
  const [toDelete, setToDelete] = useState<Herd | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/livestock/herds`

  const totalHeads = herds?.reduce((sum, herd) => sum + herd.headCount, 0) ?? 0

  const closeDialog = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setDeleteError(null)

    try {
      await deleteHerd.mutateAsync(toDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el rodeo. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {herds && herds.length > 0
            ? `${formatNumber(totalHeads)} cabezas en ${herds.length} ${
                herds.length === 1 ? 'rodeo' : 'rodeos'
              }`
            : 'Grupos de animales por categoría y potrero.'}
        </p>
        <Link
          to={`${basePath}/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuevo rodeo
        </Link>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando rodeos...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar los rodeos.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {herds && herds.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Todavía no cargaste rodeos. Creá el primero con el botón de arriba.
        </div>
      )}

      {herds && herds.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Rodeo</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Potrero</th>
                <th className="px-4 py-3 font-medium">Cabezas</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {herds.map((herd) => (
                <tr key={herd.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{herd.name}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {livestockCategoryLabels[herd.category] ?? herd.category}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{herd.fieldName ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {formatNumber(herd.headCount)}
                    <span className="ml-1 text-xs text-gray-500">
                      ({herd.headCountMode === 'FICHAS' ? 'por fichas' : 'manual'})
                    </span>
                  </td>
                  <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`${basePath}/${herd.id}/move`}
                      className="text-green-700 hover:underline"
                    >
                      Mover
                    </Link>
                    <Link
                      to={`${basePath}/${herd.id}/edit`}
                      className="text-green-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(herd)}
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
          title="Eliminar rodeo"
          message={`¿Seguro que querés eliminar "${toDelete.name}"? Los animales con ficha no se borran: quedan sin rodeo. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteHerd.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default HerdsPage
