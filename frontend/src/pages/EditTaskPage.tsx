import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import TaskForm from '../features/task/TaskForm'
import { useTask } from '../hooks/useTask'
import { useUpdateTask } from '../hooks/useTaskMutations'
import type { TaskRequest } from '../types/task'

function EditTaskPage() {
  const { farmId = '', fieldId = '', taskId = '' } = useParams()
  const navigate = useNavigate()
  const { data: task, isPending, isError } = useTask(farmId, fieldId, taskId)
  const updateTask = useUpdateTask(farmId, fieldId, taskId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/fields/${fieldId}/tasks`

  const handleSubmit = async (request: TaskRequest) => {
    setServerError(null)

    try {
      await updateTask.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo guardar la labor. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Labores
      </Link>
      <h2 className="mt-2 mb-6 text-xl font-bold text-gray-900">Editar labor</h2>

      {isPending && <p className="text-gray-600">Cargando labor...</p>}

      {isError && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se encontró la labor.
        </p>
      )}

      {task && (
        <TaskForm
          farmId={farmId}
          fieldId={fieldId}
          initialTask={task}
          submitLabel="Guardar cambios"
          isSubmitting={updateTask.isPending}
          serverError={serverError}
          cancelTo={listPath}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default EditTaskPage
