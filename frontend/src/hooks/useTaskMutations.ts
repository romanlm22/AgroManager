import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTask, deleteTask, updateTask } from '../services/taskService'
import type { TaskRequest } from '../types/task'

function useInvalidateFarm(farmId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['farms', farmId] })
}

export function useCreateTask(farmId: string, fieldId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: TaskRequest) => createTask(farmId, fieldId, request),
    onSuccess: invalidate,
  })
}

export function useUpdateTask(farmId: string, fieldId: string, taskId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (request: TaskRequest) =>
      updateTask(farmId, fieldId, taskId, request),
    onSuccess: invalidate,
  })
}

export function useDeleteTask(farmId: string, fieldId: string) {
  const invalidate = useInvalidateFarm(farmId)

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(farmId, fieldId, taskId),
    onSuccess: invalidate,
  })
}
