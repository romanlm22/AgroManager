import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import FarmForm from '../features/farm/FarmForm'
import { useCreateFarm } from '../hooks/useCreateFarm'
import type { FarmRequest } from '../types/farm'

function NewFarmPage() {
  const navigate = useNavigate()
  const createFarm = useCreateFarm()
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (request: FarmRequest) => {
    setServerError(null)

    try {
      const farm = await createFarm.mutateAsync(request)
      navigate(`/farms/${farm.id}/dashboard`)
    } catch {
      setServerError(
        'No se pudo crear el establecimiento. Revisá los datos e intentá de nuevo.',
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Link to="/farms" className="text-sm text-gray-500 hover:text-green-700">
        ← Mis establecimientos
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo establecimiento</h1>

      <FarmForm
        submitLabel="Crear establecimiento"
        isSubmitting={createFarm.isPending}
        serverError={serverError}
        cancelTo="/farms"
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewFarmPage
