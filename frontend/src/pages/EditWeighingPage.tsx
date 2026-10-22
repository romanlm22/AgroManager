import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import WeighingForm from '../features/livestock/WeighingForm'
import { useWeighing } from '../hooks/useWeighing'
import { useUpdateWeighing } from '../hooks/useWeighingMutations'
import type { WeighingRequest } from '../types/weighing'

function EditWeighingPage() {
  const { farmId = '', animalId = '', weighingId = '' } = useParams()
  const navigate = useNavigate()
  const { data: weighing, isPending, isError } = useWeighing(farmId, animalId, weighingId)
  const updateWeighing = useUpdateWeighing(farmId, animalId, weighingId)
  const [serverError, setServerError] = useState<string | null>(null)
  const detailPath = `/farms/${farmId}/livestock/animals/${animalId}`

  const handleSubmit = async (request: WeighingRequest) => {
    setServerError(null)

    try {
      await updateWeighing.mutateAsync(request)
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
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar pesaje</h1>

      {isPending && <p className="text-gray-600">Cargando pesaje...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el pesaje.
        </p>
      )}

      {weighing && (
        <WeighingForm
          initialWeighing={weighing}
          submitLabel="Guardar cambios"
          isSubmitting={updateWeighing.isPending}
          serverError={serverError}
          cancelTo={detailPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditWeighingPage
