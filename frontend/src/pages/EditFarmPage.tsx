import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import FarmForm from '../features/farm/FarmForm'
import { useFarm } from '../hooks/useFarm'
import { useDeleteFarm, useUpdateFarm } from '../hooks/useFarmMutations'
import type { FarmRequest } from '../types/farm'

function EditFarmPage() {
  const { farmId = '' } = useParams()
  const navigate = useNavigate()
  const { data: farm, isPending, isError } = useFarm(farmId)
  const updateFarm = useUpdateFarm(farmId)
  const deleteFarm = useDeleteFarm(farmId)
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleSubmit = async (request: FarmRequest) => {
    setServerError(null)
    setSavedMessage(false)

    try {
      await updateFarm.mutateAsync(request)
      setSavedMessage(true)
    } catch {
      setServerError('No se pudo guardar el establecimiento. Revisá los datos e intentá de nuevo.')
    }
  }

  const handleConfirmDelete = async () => {
    setDeleteError(null)

    try {
      await deleteFarm.mutateAsync()
      navigate('/farms', { replace: true })
    } catch (error) {
      setDeleteError(
        isAxiosError(error) && error.response?.status === 403
          ? 'Solo el propietario puede eliminar el establecimiento.'
          : 'No se pudo eliminar el establecimiento. Intentá de nuevo.',
      )
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Configuración</h1>

      {isPending && <p className="text-gray-600">Cargando establecimiento...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró el establecimiento.
        </p>
      )}

      {farm && (
        <>
          {savedMessage && (
            <p role="status" className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-800">
              Cambios guardados.
            </p>
          )}

          <FarmForm
            initialFarm={farm}
            submitLabel="Guardar cambios"
            isSubmitting={updateFarm.isPending}
            serverError={serverError}
            cancelTo={`/farms/${farmId}/dashboard`}
            onSubmit={handleSubmit}
          />

          {farm.myRole === 'OWNER' && (
            <section className="mt-8 rounded-xl border border-red-200 bg-white p-6">
              <h2 className="font-semibold text-red-700">Zona de peligro</h2>
              <p className="mt-1 text-sm text-gray-600">
                Eliminar el establecimiento borra también sus lotes, cultivos, labores,
                inventario y maquinaria. Esta acción no se puede deshacer.
              </p>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="mt-4 rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Eliminar establecimiento
              </button>
            </section>
          )}

          {confirmingDelete && (
            <ConfirmDialog
              title="Eliminar establecimiento"
              message={`¿Seguro que querés eliminar "${farm.name}"? Se borran todos sus datos y no se puede deshacer.`}
              confirmLabel="Eliminar"
              isLoading={deleteFarm.isPending}
              errorMessage={deleteError}
              onConfirm={handleConfirmDelete}
              onCancel={() => {
                setConfirmingDelete(false)
                setDeleteError(null)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default EditFarmPage
