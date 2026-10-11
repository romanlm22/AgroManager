import type { DashboardTask } from '../../types/dashboard'
import { formatDate } from '../../utils/format'
import { taskStatusLabels, taskTypeLabels } from '../../utils/labels'

function UpcomingTasksCard({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">Próximas labores</h2>

      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">No hay labores programadas.</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 text-sm">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between py-2">
              <span className="font-medium text-gray-900">
                {taskTypeLabels[task.taskType] ?? task.taskType}
              </span>
              <span className="text-gray-600">
                {formatDate(task.taskDate)} ·{' '}
                {taskStatusLabels[task.status] ?? task.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default UpcomingTasksCard
