import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import HealthEventForm from '../features/livestock/HealthEventForm'
import { useCreateHealthEvent } from '../hooks/useHealthEventMutations'
import type { HealthEventRequest } from '../types/health'

function NewHealthEventPage() {
  const { farmId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const animalId = searchParams.get('animalId') ?? undefined
  const herdId = searchParams.get('herdId') ?? undefined
  const navigate = useNavigate()
  const createEvent = useCreateHealthEvent(farmId)
  const [serverError, setServerError] = useState<string | null>(null)

  // Si se llegó desde la ficha de un animal, se vuelve a ella.
  const backPath = animalId
    ? `/farms/${farmId}/livestock/animals/${animalId}`
    : `/farms/${farmId}/livestock/health`

  const handleSubmit = async (request: HealthEventRequest) => {
    setServerError(null)

    try {
      await createEvent.mutateAsync(request)
      navigate(backPath)
    } catch {
      setServerError('No se pudo guardar el evento. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={backPath} className="text-sm text-gray-500 hover:text-green-700">
        ← {animalId ? 'Ficha del animal' : 'Sanidad'}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo evento sanitario</h1>

      <HealthEventForm
        farmId={farmId}
        defaultAnimalId={animalId}
        defaultHerdId={herdId}
        submitLabel="Guardar evento"
        isSubmitting={createEvent.isPending}
        serverError={serverError}
        cancelTo={backPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewHealthEventPage
