import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useCrops } from '../../hooks/useCrops'
import type { Task, TaskRequest } from '../../types/task'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { taskStatusLabels, taskTypeLabels } from '../../utils/labels'

const taskSchema = z.object({
  taskType: z.enum([
    'SIEMBRA',
    'FERTILIZACION',
    'PULVERIZACION',
    'RIEGO',
    'COSECHA',
    'CONTROL_MALEZAS',
    'OTRA',
  ]),
  status: z.enum(['PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA']),
  taskDate: z.string().min(1, { error: 'Ingresá la fecha de la labor' }),
  cropId: z.string(),
  cost: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  notes: z.string(),
})

interface TaskFormProps {
  farmId: string
  fieldId: string
  initialTask?: Task
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: TaskRequest) => Promise<void>
}

function TaskForm({
  farmId,
  fieldId,
  initialTask,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: TaskFormProps) {
  const crops = useCrops(farmId, fieldId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskType: initialTask?.taskType ?? 'SIEMBRA',
      status: initialTask?.status ?? 'PLANIFICADA',
      taskDate: initialTask?.taskDate ?? '',
      cropId: initialTask?.cropId ?? '',
      cost: initialTask?.cost?.toString() ?? '',
      notes: initialTask?.notes ?? '',
    },
  })

  if (crops.isPending) {
    return <p className="text-gray-600">Cargando cultivos del lote...</p>
  }

  if (crops.isError) {
    return (
      <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
        No se pudieron cargar los cultivos del lote.
      </p>
    )
  }

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      cropId: values.cropId === '' ? null : values.cropId,
      taskType: values.taskType,
      status: values.status,
      taskDate: values.taskDate,
      cost: toNumber(values.cost),
      notes: toText(values.notes),
    })
  })

  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {serverError && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo de labor" htmlFor="taskType" error={errors.taskType?.message}>
          <select id="taskType" {...register('taskType')} className={inputClassName}>
            {Object.entries(taskTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
          <select id="status" {...register('status')} className={inputClassName}>
            {Object.entries(taskStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Fecha" htmlFor="taskDate" error={errors.taskDate?.message}>
          <input
            id="taskDate"
            type="date"
            {...register('taskDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Cultivo (opcional)"
          htmlFor="cropId"
          error={errors.cropId?.message}
        >
          <select id="cropId" {...register('cropId')} className={inputClassName}>
            <option value="">Sin cultivo</option>
            {crops.data.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.cropTypeName} ({new Date(`${crop.plantingDate}T00:00:00`).toLocaleDateString('es-AR')})
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Costo en ARS (opcional)"
          htmlFor="cost"
          error={errors.cost?.message}
        >
          <input
            id="cost"
            type="text"
            inputMode="decimal"
            {...register('cost')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField label="Notas (opcional)" htmlFor="notes" error={errors.notes?.message}>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className={inputClassName}
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Link
          to={cancelTo}
          className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
