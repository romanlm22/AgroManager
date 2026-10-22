import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ProductionForm from '../features/livestock/ProductionForm'
import { useProduction } from '../hooks/useProduction'
import { useUpdateProduction } from '../hooks/useProductionMutations'
import type { ProductionRequest } from '../types/production'

function EditProductionPage() {
  const { farmId = '', productionId = '' } = useParams()
  const navigate = useNavigate()
  const { data: production, isPending, isError } = useProduction(farmId, productionId)
  const updateProduction = useUpdateProduction(farmId, productionId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/productions`

  const handleSubmit = async (request: ProductionRequest) => {
    setServerError(null)

    try {
      await updateProduction.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar la producción. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Producción
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar producción</h1>

      {isPending && <p className="text-gray-600">Cargando producción...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el registro de producción.
        </p>
      )}

      {production && (
        <ProductionForm
          farmId={farmId}
          initialProduction={production}
          submitLabel="Guardar cambios"
          isSubmitting={updateProduction.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditProductionPage
