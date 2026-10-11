import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useFields } from '../hooks/useFields'
import { useDeleteField } from '../hooks/useFieldMutations'
import type { Field } from '../types/field'
import { formatNumber } from '../utils/format'
import { fieldStatusLabels } from '../utils/labels'

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  FALLOW: 'bg-amber-100 text-amber-800',
  INACTIVE: 'bg-gray-100 text-gray-700',
}

function FieldsPage() {
  const { farmId = '' } = useParams()
  const { data: fields, isPending, isError, refetch } = useFields(farmId)
  const deleteField = useDeleteField(farmId)
  const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const closeDialog = () => {
    setFieldToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!fieldToDelete) return
    setDeleteError(null)

    try {
      await deleteField.mutateAsync(fieldToDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el lote. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Lotes</h1>
        <Link
          to={`/farms/${farmId}/fields/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuevo lote
        </Link>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando lotes...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar los lotes.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {fields && fields.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Este establecimiento todavía no tiene lotes. Creá el primero con el botón de arriba.
        </div>
      )}

      {fields && fields.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Superficie</th>
                <th className="px-4 py-3 font-medium">Suelo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field) => (
                <tr key={field.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`/farms/${farmId}/fields/${field.id}`}
                      className="text-green-700 hover:underline"
                    >
                      {field.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {field.areaHa !== null ? `${formatNumber(field.areaHa)} ha` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{field.soilType ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusStyles[field.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {fieldStatusLabels[field.status] ?? field.status}
                    </span>
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right">
                    <Link
                      to={`/farms/${farmId}/fields/${field.id}/edit`}
                      className="text-green-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setFieldToDelete(field)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fieldToDelete && (
        <ConfirmDialog
          title="Eliminar lote"
          message={`¿Seguro que querés eliminar "${fieldToDelete.name}"? Se eliminarán también todos sus cultivos y labores. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteField.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default FieldsPage
