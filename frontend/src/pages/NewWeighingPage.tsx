import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import WeighingForm from '../features/livestock/WeighingForm'
import { useAnimal } from '../hooks/useAnimal'
import { useCreateWeighing } from '../hooks/useWeighingMutations'
import type { WeighingRequest } from '../types/weighing'

function NewWeighingPage() {
  const { farmId = '', animalId = '' } = useParams()
  const navigate = useNavigate()
  const { data: animal } = useAnimal(farmId, animalId)
  const createWeighing = useCreateWeighing(farmId, animalId)
  const [serverError, setServerError] = useState<string | null>(null)
  const detailPath = `/farms/${farmId}/livestock/animals/${animalId}`

  const handleSubmit = async (request: WeighingRequest) => {
    setServerError(null)

    try {
      await createWeighing.mutateAsync(request)
      navigate(detailPath)
    } catch {
      setServerError('No se pudo guardar el pesaje. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={detailPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Ficha del animal
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Nuevo pesaje</h1>
      {animal && <p className="mt-1 mb-6 text-sm text-gray-600">Caravana {animal.tagNumber}</p>}
      {!animal && <div className="mb-6" />}

      <WeighingForm
        submitLabel="Guardar pesaje"
        isSubmitting={createWeighing.isPending}
        serverError={serverError}
        cancelTo={detailPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewWeighingPage
