import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ReproductionEventForm from '../features/livestock/ReproductionEventForm'
import { useReproductionEvent } from '../hooks/useReproductionEvent'
import { useUpdateReproductionEvent } from '../hooks/useReproductionEventMutations'
import type { ReproductionEventRequest } from '../types/reproduction'

function EditReproductionEventPage() {
  const { farmId = '', eventId = '' } = useParams()
  const navigate = useNavigate()
  const { data: event, isPending, isError } = useReproductionEvent(farmId, eventId)
  const updateEvent = useUpdateReproductionEvent(farmId, eventId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/reproduction`

  const handleSubmit = async (request: ReproductionEventRequest) => {
    setServerError(null)

    try {
      await updateEvent.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar el evento. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Reproducción
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar evento reproductivo</h1>

      {isPending && <p className="text-gray-600">Cargando evento...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el evento.
        </p>
      )}

      {event && (
        <ReproductionEventForm
          farmId={farmId}
          initialEvent={event}
          submitLabel="Guardar cambios"
          isSubmitting={updateEvent.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditReproductionEventPage
