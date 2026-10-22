import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import HealthEventForm from '../features/livestock/HealthEventForm'
import { useHealthEvent } from '../hooks/useHealthEvent'
import { useUpdateHealthEvent } from '../hooks/useHealthEventMutations'
import type { HealthEventRequest } from '../types/health'

function EditHealthEventPage() {
  const { farmId = '', eventId = '' } = useParams()
  const navigate = useNavigate()
  const { data: event, isPending, isError } = useHealthEvent(farmId, eventId)
  const updateEvent = useUpdateHealthEvent(farmId, eventId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/health`

  const handleSubmit = async (request: HealthEventRequest) => {
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
        ← Sanidad
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar evento sanitario</h1>

      {isPending && <p className="text-gray-600">Cargando evento...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el evento.
        </p>
      )}

      {event && (
        <HealthEventForm
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

export default EditHealthEventPage
