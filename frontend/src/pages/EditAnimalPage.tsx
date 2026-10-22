import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import AnimalForm from '../features/livestock/AnimalForm'
import { useAnimal } from '../hooks/useAnimal'
import { useUpdateAnimal } from '../hooks/useAnimalMutations'
import type { AnimalRequest } from '../types/livestock'
import { describeDuplicateTags, getDuplicateTags } from '../utils/livestock'

function EditAnimalPage() {
  const { farmId = '', animalId = '' } = useParams()
  const navigate = useNavigate()
  const { data: animal, isPending, isError } = useAnimal(farmId, animalId)
  const updateAnimal = useUpdateAnimal(farmId, animalId)
  const [serverError, setServerError] = useState<string | null>(null)
  const detailPath = `/farms/${farmId}/livestock/animals/${animalId}`

  const handleSubmit = async (request: AnimalRequest) => {
    setServerError(null)

    try {
      await updateAnimal.mutateAsync(request)
      navigate(detailPath)
    } catch (error) {
      const duplicates = getDuplicateTags(error)
      setServerError(
        duplicates
          ? describeDuplicateTags(duplicates)
          : 'No se pudo guardar el animal. Revisá los datos e intentá de nuevo.',
      )
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={detailPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Ficha del animal
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar animal</h1>

      {isPending && <p className="text-gray-600">Cargando animal...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el animal.
        </p>
      )}

      {animal && (
        <AnimalForm
          farmId={farmId}
          initialAnimal={animal}
          submitLabel="Guardar cambios"
          isSubmitting={updateAnimal.isPending}
          serverError={serverError}
          cancelTo={detailPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditAnimalPage
