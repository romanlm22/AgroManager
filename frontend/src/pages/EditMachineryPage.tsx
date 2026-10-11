import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import MachineryForm from '../features/machinery/MachineryForm'
import { useMachinery } from '../hooks/useMachinery'
import { useUpdateMachinery } from '../hooks/useMachineryMutations'
import type { MachineryRequest } from '../types/machinery'

function EditMachineryPage() {
  const { farmId = '', machineryId = '' } = useParams()
  const navigate = useNavigate()
  const { data: machine, isPending, isError } = useMachinery(farmId, machineryId)
  const updateMachinery = useUpdateMachinery(farmId, machineryId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/machinery`

  const handleSubmit = async (request: MachineryRequest) => {
    setServerError(null)

    try {
      await updateMachinery.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar la máquina. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Maquinaria
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar máquina</h1>

      {isPending && <p className="text-gray-600">Cargando máquina...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró la máquina.
        </p>
      )}

      {machine && (
        <MachineryForm
          initialMachinery={machine}
          submitLabel="Guardar cambios"
          isSubmitting={updateMachinery.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditMachineryPage
