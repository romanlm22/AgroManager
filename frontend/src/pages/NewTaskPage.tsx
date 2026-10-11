import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import TaskForm from '../features/task/TaskForm'
import { useCreateTask } from '../hooks/useTaskMutations'
import type { TaskRequest } from '../types/task'

function NewTaskPage() {
  const { farmId = '', fieldId = '' } = useParams()
  const navigate = useNavigate()
  const createTask = useCreateTask(farmId, fieldId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/fields/${fieldId}/tasks`

  const handleSubmit = async (request: TaskRequest) => {
    setServerError(null)

    try {
      await createTask.mutateAsync(request)
      navigate(listPath)
    } catch {
      setServerError('No se pudo crear la labor. Revisá los datos e intentá de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Labores
      </Link>
      <h2 className="mt-2 mb-6 text-xl font-bold text-gray-900">Nueva labor</h2>

      <TaskForm
        farmId={farmId}
        fieldId={fieldId}
        submitLabel="Crear labor"
        isSubmitting={createTask.isPending}
        serverError={serverError}
        cancelTo={listPath}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NewTaskPage
