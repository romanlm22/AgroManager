import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import FieldForm from '../features/field/FieldForm'
import { useCreateField } from '../hooks/useFieldMutations'
import type { FieldRequest } from '../types/field'

function NewFieldPage() {
  const { farmId = '' } = useParams()
  const navigate = useNavigate()
  const createField = useCreateField(farmId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/fields`

  const handleSubmit = async (request: FieldRequest) => {
    setServerError(null)

    try {
      await createField.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo crear el lote. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Lotes
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Nuevo lote</h1>

      <FieldForm
        submitLabel="Crear lote"
        isSubmitting={createField.isPending}
        serverError={serverError}
        cancelTo={listPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewFieldPage