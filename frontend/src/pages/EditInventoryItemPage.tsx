import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import InventoryForm from '../features/inventory/InventoryForm'
import { useInventoryItem } from '../hooks/useInventoryItem'
import { useUpdateInventoryItem } from '../hooks/useInventoryMutations'
import type { InventoryItemRequest } from '../types/inventory'

function EditInventoryItemPage() {
  const { farmId = '', itemId = '' } = useParams()
  const navigate = useNavigate()
  const { data: item, isPending, isError } = useInventoryItem(farmId, itemId)
  const updateItem = useUpdateInventoryItem(farmId, itemId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/inventory`

  const handleSubmit = async (request: InventoryItemRequest) => {
    setServerError(null)

    try {
      await updateItem.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar el insumo. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Inventario
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar insumo</h1>

      {isPending && <p className="text-gray-600">Cargando insumo...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el insumo.
        </p>
      )}

      {item && (
        <InventoryForm
          initialItem={item}
          submitLabel="Guardar cambios"
          isSubmitting={updateItem.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditInventoryItemPage
