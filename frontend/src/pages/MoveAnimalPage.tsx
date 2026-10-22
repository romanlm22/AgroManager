import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import MoveForm from '../features/livestock/MoveForm'
import { useAnimal } from '../hooks/useAnimal'
import { useMoveAnimal } from '../hooks/useAnimalMutations'
import type { MoveRequest } from '../types/livestock'

function MoveAnimalPage() {
  const { farmId = '', animalId = '' } = useParams()
  const navigate = useNavigate()
  const { data: animal, isPending, isError } = useAnimal(farmId, animalId)
  const moveAnimal = useMoveAnimal(farmId, animalId)
  const [serverError, setServerError] = useState<string | null>(null)
  const detailPath = `/farms/${farmId}/livestock/animals/${animalId}`

  const handleSubmit = async (request: MoveRequest) => {
    setServerError(null)

    try {
      await moveAnimal.mutateAsync(request)
      navigate(detailPath)
    } catch {
      setServerError('No se pudo mover el animal. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={detailPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Ficha del animal
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Mover animal</h1>

      {isPending && <p className="mt-4 text-gray-600">Cargando animal...</p>}

      {isError && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
          No se encontró el animal.
        </p>
      )}

      {animal && animal.status !== 'ACTIVO' && (
        <p role="alert" className="mt-4 rounded bg-amber-50 p-4 text-amber-800">
          Solo se pueden mover animales activos.
        </p>
      )}

      {animal && animal.status === 'ACTIVO' && (
        <>
          <p className="mt-1 mb-6 text-sm text-gray-600">
            Caravana {animal.tagNumber} · Potrero actual: {animal.fieldName ?? 'sin potrero'}
          </p>

          <MoveForm
            farmId={farmId}
            currentFieldId={animal.fieldId}
            submitLabel="Mover animal"
            isSubmitting={moveAnimal.isPending}
            serverError={serverError}
            cancelTo={detailPath}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  )
}

export default MoveAnimalPage
