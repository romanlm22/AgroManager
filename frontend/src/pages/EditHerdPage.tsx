import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import HerdForm from '../features/livestock/HerdForm'
import { useHerd } from '../hooks/useHerd'
import { useUpdateHerd } from '../hooks/useHerdMutations'
import type { HerdRequest } from '../types/livestock'

function EditHerdPage() {
  const { farmId = '', herdId = '' } = useParams()
  const navigate = useNavigate()
  const { data: herd, isPending, isError } = useHerd(farmId, herdId)
  const updateHerd = useUpdateHerd(farmId, herdId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/herds`

  const handleSubmit = async (request: HerdRequest) => {
    setServerError(null)

    try {
      await updateHerd.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar el rodeo. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Rodeos
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar rodeo</h1>

      {isPending && <p className="text-gray-600">Cargando rodeo...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el rodeo.
        </p>
      )}

      {herd && (
        <HerdForm
          farmId={farmId}
          initialHerd={herd}
          submitLabel="Guardar cambios"
          isSubmitting={updateHerd.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditHerdPage
