import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import MaintenanceForm from '../features/machinery/MaintenanceForm'
import { useCreateMaintenance } from '../hooks/useMaintenanceMutations'
import type { MaintenanceRequest } from '../types/machinery'

function NewMaintenancePage() {
  const { farmId = '', machineryId = '' } = useParams()
  const navigate = useNavigate()
  const createMaintenance = useCreateMaintenance(farmId, machineryId)
  const [serverError, setServerError] = useState<string | null>(null)
  const detailPath = `/farms/${farmId}/machinery/${machineryId}`

  const handleSubmit = async (request: MaintenanceRequest) => {
    setServerError(null)

    try {
      await createMaintenance.mutateAsync(request)
      navigate(detailPath)
    } catch {
      setServerError('No se pudo crear el mantenimiento. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={detailPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Máquina
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo mantenimiento</h1>

      <MaintenanceForm
        submitLabel="Crear mantenimiento"
        isSubmitting={createMaintenance.isPending}
        serverError={serverError}
        cancelTo={detailPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewMaintenancePage
