import { useQuery } from '@tanstack/react-query'
import { getTasks } from '../services/taskService'

export function useTasks(farmId: string, fieldId: string) {
  return useQuery({
    queryKey: ['farms', farmId, 'fields', fieldId, 'tasks'],
    queryFn: () => getTasks(farmId, fieldId),
    enabled: Boolean(farmId) && Boolean(fieldId),
  })
}
