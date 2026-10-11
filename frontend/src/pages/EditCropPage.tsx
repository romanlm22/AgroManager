import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import CropForm from '../features/crop/CropForm'
import { useCrop } from '../hooks/useCrop'
import { useUpdateCrop } from '../hooks/useCropMutations'
import type { CropRequest } from '../types/crop'

function EditCropPage() {
  const { farmId = '', fieldId = '', cropId = '' } = useParams()
  const navigate = useNavigate()
  const { data: crop, isPending, isError } = useCrop(farmId, fieldId, cropId)
  const updateCrop = useUpdateCrop(farmId, fieldId, cropId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/fields/${fieldId}/crops`

  const handleSubmit = async (request: CropRequest) => {
    setServerError(null)

    try {
      await updateCrop.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar el cultivo. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Cultivos
      </Link>
      <h2 className="mt-2 mb-6 text-xl font-bold text-gray-900">Editar cultivo</h2>

      {isPending && <p className="text-gray-600">Cargando cultivo...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el cultivo.
        </p>
      )}

      {crop && (
        <CropForm
          initialCrop={crop}
          submitLabel="Guardar cambios"
          isSubmitting={updateCrop.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditCropPage
