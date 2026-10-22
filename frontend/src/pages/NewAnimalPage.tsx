import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import AnimalForm from '../features/livestock/AnimalForm'
import { useCreateAnimal } from '../hooks/useAnimalMutations'
import type { AnimalRequest } from '../types/livestock'
import { describeDuplicateTags, getDuplicateTags } from '../utils/livestock'

function NewAnimalPage() {
  const { farmId = '' } = useParams()
  const navigate = useNavigate()
  const createAnimal = useCreateAnimal(farmId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/animals`

  const handleSubmit = async (request: AnimalRequest) => {
    setServerError(null)

    try {
      await createAnimal.mutateAsync(request)
      navigate(listPath)
    } catch (error) {
      const duplicates = getDuplicateTags(error)
      setServerError(
        duplicates
          ? describeDuplicateTags(duplicates)
          : 'No se pudo crear el animal. Revisá los datos e intentá de nuevo.',
      )
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Animales
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo animal</h1>

      <AnimalForm
        farmId={farmId}
        submitLabel="Crear animal"
        isSubmitting={createAnimal.isPending}
        serverError={serverError}
        cancelTo={listPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewAnimalPage
