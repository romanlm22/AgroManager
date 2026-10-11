import { useQuery } from '@tanstack/react-query'
import { getTask } from '../services/taskService'

export function useTask(farmId: string, fieldId: string, taskId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'fields', fieldId, 'tasks', taskId],
    queryFn: () => getTask(farmId, fieldId, taskId),
    enabled: Boolean(farmId) && Boolean(fieldId) && Boolean(taskId),
  })
}
