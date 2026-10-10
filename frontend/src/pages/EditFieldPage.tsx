import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import FieldForm from '../features/field/FieldForm'
import { useField } from '../hooks/useField'
import { useUpdateField } from '../hooks/useFieldMutations'
import type { FieldRequest } from '../types/field'

function EditFieldPage() {
  const { farmId = '', fieldId = '' } = useParams()
  const navigate = useNavigate()
  const { data: field, isPending, isError } = useField(farmId, fieldId)
  const updateField = useUpdateField(farmId, fieldId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/fields`

  const handleSubmit = async (request: FieldRequest) => {
    setServerError(null)

    try {
      await updateField.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar el lote. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Lotes
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">Editar lote</h1>

      {isPending && <p className="text-gray-600">Cargando lote...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el lote.
        </p>
      )}

      {field && (
        <FieldForm
          initialField={field}
          submitLabel="Guardar cambios"
          isSubmitting={updateField.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditFieldPage