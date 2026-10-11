import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useInventoryItems } from '../hooks/useInventoryItems'
import { useDeleteInventoryItem } from '../hooks/useInventoryMutations'
import type { InventoryItem } from '../types/inventory'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import { inventoryCategoryLabels, unitLabels } from '../utils/labels'

const LOW_STOCK_THRESHOLD = 10
const EXPIRY_WARNING_DAYS = 7

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`).getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today.getTime()) / 86_400_000)
}

function InventoryPage() {
  const { farmId = '' } = useParams()
  const { data: items, isPending, isError, refetch } = useInventoryItems(farmId)
  const deleteItem = useDeleteInventoryItem(farmId)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/inventory`

  const closeDialog = () => {
    setItemToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setDeleteError(null)

    try {
      await deleteItem.mutateAsync(itemToDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el insumo. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <Link
          to={`${basePath}/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuevo insumo
        </Link>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando inventario...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudo cargar el inventario.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Todavía no cargaste insumos. Registrá el primero con el botón de arriba.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Insumo</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Vencimiento</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const lowStock = item.stock < LOW_STOCK_THRESHOLD
                const days = item.expirationDate ? daysUntil(item.expirationDate) : null
                const expired = days !== null && days < 0
                const expiringSoon =
                  days !== null && days >= 0 && days <= EXPIRY_WARNING_DAYS

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.name}
                      {item.batchNumber && (
                        <p className="text-xs font-normal text-gray-500">
                          Lote {item.batchNumber}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {inventoryCategoryLabels[item.category] ?? item.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={lowStock ? 'font-medium text-red-700' : 'text-gray-700'}>
                        {formatNumber(item.stock)} {unitLabels[item.unit] ?? item.unit}
                      </span>
                      {lowStock && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Stock bajo
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {item.price !== null ? formatCurrency(item.price) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {item.expirationDate ? (
                        <>
                          <span className="text-gray-700">
                            {formatDate(item.expirationDate)}
                          </span>
                          {expired && (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                              Vencido
                            </span>
                          )}
                          {expiringSoon && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Por vencer
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.supplier ?? '—'}</td>
                    <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        to={`${basePath}/${item.id}/edit`}
                        className="text-green-700 hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
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

      {itemToDelete && (
        <ConfirmDialog
          title="Eliminar insumo"
          message={`¿Seguro que querés eliminar "${itemToDelete.name}" del inventario? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteItem.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default InventoryPage
