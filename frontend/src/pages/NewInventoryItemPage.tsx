import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import InventoryForm from '../features/inventory/InventoryForm'
import { useCreateInventoryItem } from '../hooks/useInventoryMutations'
import type { InventoryItemRequest } from '../types/inventory'

function NewInventoryItemPage() {
  const { farmId = '' } = useParams()
  const navigate = useNavigate()
  const createItem = useCreateInventoryItem(farmId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/inventory`

  const handleSubmit = async (request: InventoryItemRequest) => {
    setServerError(null)

    try {
      await createItem.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo crear el insumo. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Inventario
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo insumo</h1>

      <InventoryForm
        submitLabel="Crear insumo"
        isSubmitting={createItem.isPending}
        serverError={serverError}
        cancelTo={listPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewInventoryItemPage
