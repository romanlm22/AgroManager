import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import ReproductionEventForm from '../features/livestock/ReproductionEventForm'
import { useCreateReproductionEvent } from '../hooks/useReproductionEventMutations'
import type { ReproductionEventRequest } from '../types/reproduction'
import { describeDuplicateTags, getDuplicateTags } from '../utils/livestock'

function NewReproductionEventPage() {
  const { farmId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const animalId = searchParams.get('animalId') ?? undefined
  const navigate = useNavigate()
  const createEvent = useCreateReproductionEvent(farmId)
  const [serverError, setServerError] = useState<string | null>(null)

  // Si se llegó desde la ficha de un animal, se vuelve a ella.
  const backPath = animalId
    ? `/farms/${farmId}/livestock/animals/${animalId}`
    : `/farms/${farmId}/livestock/reproduction`

  const handleSubmit = async (request: ReproductionEventRequest) => {
    setServerError(null)

    try {
      await createEvent.mutateAsync(request)
      navigate(backPath)
    } catch (error) {
      const duplicates = getDuplicateTags(error)
      setServerError(
        duplicates
          ? describeDuplicateTags(duplicates)
          : 'No se pudo guardar el evento. Revisá los datos e intentá de nuevo.',
      )
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={backPath} className="text-sm text-gray-500 hover:text-green-700">
        ← {animalId ? 'Ficha del animal' : 'Reproducción'}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo evento reproductivo</h1>

      <ReproductionEventForm
        farmId={farmId}
        defaultAnimalId={animalId}
        submitLabel="Guardar evento"
        isSubmitting={createEvent.isPending}
        serverError={serverError}
        cancelTo={backPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewReproductionEventPage
