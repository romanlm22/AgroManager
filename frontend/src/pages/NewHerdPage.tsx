import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import HerdForm from '../features/livestock/HerdForm'
import { useCreateHerd } from '../hooks/useHerdMutations'
import type { HerdRequest } from '../types/livestock'

function NewHerdPage() {
  const { farmId = '' } = useParams()
  const navigate = useNavigate()
  const createHerd = useCreateHerd(farmId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/herds`

  const handleSubmit = async (request: HerdRequest) => {
    setServerError(null)

    try {
      await createHerd.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo crear el rodeo. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Rodeos
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo rodeo</h1>

      <HerdForm
        farmId={farmId}
        submitLabel="Crear rodeo"
        isSubmitting={createHerd.isPending}
        serverError={serverError}
        cancelTo={listPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewHerdPage
