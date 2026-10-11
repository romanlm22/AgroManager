import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import MaintenanceForm from '../features/machinery/MaintenanceForm'
import { useMaintenance } from '../hooks/useMaintenance'
import { useUpdateMaintenance } from '../hooks/useMaintenanceMutations'
import type { MaintenanceRequest } from '../types/machinery'

function EditMaintenancePage() {
  const { farmId = '', machineryId = '', maintenanceId = '' } = useParams()
  const navigate = useNavigate()
  const { data: maintenance, isPending, isError } = useMaintenance(
    farmId,
    machineryId,
    maintenanceId,
  )
  const updateMaintenance = useUpdateMaintenance(farmId, machineryId, maintenanceId)
  const [serverError, setServerError] = useState<string | null>(null)
  const detailPath = `/farms/${farmId}/machinery/${machineryId}`

  const handleSubmit = async (request: MaintenanceRequest) => {
    setServerError(null)

    try {
      await updateMaintenance.mutateAsync(request)
      navigate(detailPath)
    } catch {
      setServerError('No se pudo guardar el mantenimiento. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={detailPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Máquina
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar mantenimiento</h1>

      {isPending && <p className="text-gray-600">Cargando mantenimiento...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el mantenimiento.
        </p>
      )}

      {maintenance && (
        <MaintenanceForm
          initialMaintenance={maintenance}
          submitLabel="Guardar cambios"
          isSubmitting={updateMaintenance.isPending}
          serverError={serverError}
          cancelTo={detailPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditMaintenancePage
