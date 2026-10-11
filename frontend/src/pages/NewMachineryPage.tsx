import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import MachineryForm from '../features/machinery/MachineryForm'
import { useCreateMachinery } from '../hooks/useMachineryMutations'
import type { MachineryRequest } from '../types/machinery'

function NewMachineryPage() {
  const { farmId = '' } = useParams()
  const navigate = useNavigate()
  const createMachinery = useCreateMachinery(farmId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/machinery`

  const handleSubmit = async (request: MachineryRequest) => {
    setServerError(null)

    try {
      await createMachinery.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo crear la máquina. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Maquinaria
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nueva máquina</h1>

      <MachineryForm
        submitLabel="Crear máquina"
        isSubmitting={createMachinery.isPending}
        serverError={serverError}
        cancelTo={listPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewMachineryPage
