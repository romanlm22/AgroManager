import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { useCrops } from '../hooks/useCrops'
import { useTasks } from '../hooks/useTasks'
import { useDeleteTask } from '../hooks/useTaskMutations'
import type { Task } from '../types/task'
import { formatCurrency, formatDate } from '../utils/format'
import { taskStatusLabels, taskTypeLabels } from '../utils/labels'

const statusStyles: Record<string, string> = {
  PLANIFICADA: 'bg-blue-100 text-blue-800',
  EN_PROGRESO: 'bg-amber-100 text-amber-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-gray-100 text-gray-700',
}

function TasksPage() {
  const { farmId = '', fieldId = '' } = useParams()
  const { data: tasks, isPending, isError, refetch } = useTasks(farmId, fieldId)
  const { data: crops } = useCrops(farmId, fieldId)
  const deleteTask = useDeleteTask(farmId, fieldId)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/fields/${fieldId}/tasks`

  const cropNames = new Map((crops ?? []).map((crop) => [crop.id, crop.cropTypeName]))

  const closeDialog = () => {
    setTaskToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return
    setDeleteError(null)

    try {
      await deleteTask.mutateAsync(taskToDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar la labor. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Labores</h2>
        <Link
          to={`${basePath}/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nueva labor
        </Link>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando labores...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar las labores.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {tasks && tasks.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Este lote todavía no tiene labores. Registrá la primera con el botón de arriba.
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Labor</th>
                <th className="px-4 py-3 font-medium">Cultivo</th>
                <th className="px-4 py-3 font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {formatDate(task.taskDate)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {taskTypeLabels[task.taskType] ?? task.taskType}
                    {task.notes && (
                      <p className="max-w-xs truncate text-xs font-normal text-gray-500">
                        {task.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {task.cropId ? (cropNames.get(task.cropId) ?? '—') : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {task.cost !== null ? formatCurrency(task.cost) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{task.responsibleEmail}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusStyles[task.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {taskStatusLabels[task.status] ?? task.status}
                    </span>
                  </td>
                  <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`${basePath}/${task.id}/edit`}
                      className="text-green-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
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

      {taskToDelete && (
        <ConfirmDialog
          title="Eliminar labor"
          message={`¿Seguro que querés eliminar la labor de ${(taskTypeLabels[taskToDelete.taskType] ?? taskToDelete.taskType).toLowerCase()} del ${formatDate(taskToDelete.taskDate)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteTask.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default TasksPage
