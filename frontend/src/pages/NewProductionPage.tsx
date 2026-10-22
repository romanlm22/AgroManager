import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import ProductionForm from '../features/livestock/ProductionForm'
import { useCreateProduction } from '../hooks/useProductionMutations'
import type { ProductionRequest } from '../types/production'

function NewProductionPage() {
  const { farmId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const animalId = searchParams.get('animalId') ?? undefined
  const herdId = searchParams.get('herdId') ?? undefined
  const navigate = useNavigate()
  const createProduction = useCreateProduction(farmId)
  const [serverError, setServerError] = useState<string | null>(null)

  const backPath = animalId
    ? `/farms/${farmId}/livestock/animals/${animalId}`
    : `/farms/${farmId}/livestock/productions`

  const handleSubmit = async (request: ProductionRequest) => {
    setServerError(null)

    try {
      await createProduction.mutateAsync(request)
      navigate(backPath)
    } catch {
      setServerError('No se pudo guardar la producción. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={backPath} className="text-sm text-gray-500 hover:text-green-700">
        ← {animalId ? 'Ficha del animal' : 'Producción'}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nueva producción</h1>

      <ProductionForm
        farmId={farmId}
        defaultAnimalId={animalId}
        defaultHerdId={herdId}
        submitLabel="Guardar producción"
        isSubmitting={createProduction.isPending}
        serverError={serverError}
        cancelTo={backPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewProductionPage
