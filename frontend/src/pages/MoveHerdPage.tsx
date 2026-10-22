import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import MoveForm from '../features/livestock/MoveForm'
import { useHerd } from '../hooks/useHerd'
import { useMoveHerd } from '../hooks/useHerdMutations'
import type { MoveRequest } from '../types/livestock'

function MoveHerdPage() {
  const { farmId = '', herdId = '' } = useParams()
  const navigate = useNavigate()
  const { data: herd, isPending, isError } = useHerd(farmId, herdId)
  const moveHerd = useMoveHerd(farmId, herdId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/herds`

  const handleSubmit = async (request: MoveRequest) => {
    setServerError(null)

    try {
      await moveHerd.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo mover el rodeo. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Rodeos
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Mover rodeo</h1>

      {isPending && <p className="mt-4 text-gray-600">Cargando rodeo...</p>}

      {isError && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
          No se encontró el rodeo.
        </p>
      )}

      {herd && (
        <>
          <p className="mt-1 mb-6 text-sm text-gray-600">
            {herd.name} · Potrero actual: {herd.fieldName ?? 'sin potrero'}. Los animales
            activos del rodeo se mueven con él y cada uno queda con su movimiento registrado.
          </p>

          <MoveForm
            farmId={farmId}
            currentFieldId={herd.fieldId}
            submitLabel="Mover rodeo"
            isSubmitting={moveHerd.isPending}
            serverError={serverError}
            cancelTo={listPath}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  )
}

export default MoveHerdPage
