import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import CropForm from '../features/crop/CropForm'
import { useCreateCrop } from '../hooks/useCropMutations'
import type { CropRequest } from '../types/crop'

function NewCropPage() {
  const { farmId = '', fieldId = '' } = useParams()
  const navigate = useNavigate()
  const createCrop = useCreateCrop(farmId, fieldId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/fields/${fieldId}/crops`

  const handleSubmit = async (request: CropRequest) => {
    setServerError(null)

    try {
      await createCrop.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo crear el cultivo. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Cultivos
      </Link>
      <h2 className="mt-2 mb-6 text-xl font-bold text-gray-900">Nuevo cultivo</h2>

      <CropForm
        submitLabel="Crear cultivo"
        isSubmitting={createCrop.isPending}
        serverError={serverError}
        cancelTo={listPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewCropPage
