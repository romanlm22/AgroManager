import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import type { Machinery, MachineryRequest } from '../../types/machinery'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { machineryStatusLabels, machineryTypeLabels } from '../../utils/labels'

const currentYear = new Date().getFullYear()

const optionalYear = z.string().refine(
  (value) => {
    if (value.trim() === '') return true
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed >= 1900 && parsed <= currentYear + 1
  },
  { error: `Ingresá un año entre 1900 y ${currentYear + 1}` },
)

const machinerySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Ingresá el nombre de la máquina' })
    .max(150, { error: 'Máximo 150 caracteres' }),
  machineryType: z.enum(['TRACTOR', 'SEMBRADORA', 'PULVERIZADORA', 'COSECHADORA', 'OTRA']),
  status: z.enum(['OPERATIVA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO']),
  brand: z.string().max(100, { error: 'Máximo 100 caracteres' }),
  model: z.string().max(100, { error: 'Máximo 100 caracteres' }),
  year: optionalYear,
  hoursUsed: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  nextMaintenanceDate: z.string(),
})

interface MachineryFormProps {
  initialMachinery?: Machinery
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: MachineryRequest) => Promise<void>
}

function MachineryForm({
  initialMachinery,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: MachineryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(machinerySchema),
    defaultValues: {
      name: initialMachinery?.name ?? '',
      machineryType: initialMachinery?.machineryType ?? 'TRACTOR',
      status: initialMachinery?.status ?? 'OPERATIVA',
      brand: initialMachinery?.brand ?? '',
      model: initialMachinery?.model ?? '',
      year: initialMachinery?.year?.toString() ?? '',
      hoursUsed: initialMachinery?.hoursUsed?.toString() ?? '',
      nextMaintenanceDate: initialMachinery?.nextMaintenanceDate ?? '',
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      machineryType: values.machineryType,
      status: values.status,
      brand: toText(values.brand),
      model: toText(values.model),
      year: toNumber(values.year),
      hoursUsed: toNumber(values.hoursUsed),
      nextMaintenanceDate: toText(values.nextMaintenanceDate),
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

      <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
        <input id="name" type="text" {...register('name')} className={inputClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo" htmlFor="machineryType" error={errors.machineryType?.message}>
          <select id="machineryType" {...register('machineryType')} className={inputClassName}>
            {Object.entries(machineryTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
          <select id="status" {...register('status')} className={inputClassName}>
            {Object.entries(machineryStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Marca (opcional)" htmlFor="brand" error={errors.brand?.message}>
          <input id="brand" type="text" {...register('brand')} className={inputClassName} />
        </FormField>

        <FormField label="Modelo (opcional)" htmlFor="model" error={errors.model?.message}>
          <input id="model" type="text" {...register('model')} className={inputClassName} />
        </FormField>

        <FormField label="Año (opcional)" htmlFor="year" error={errors.year?.message}>
          <input
            id="year"
            type="text"
            inputMode="numeric"
            {...register('year')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Horas de uso (opcional)"
          htmlFor="hoursUsed"
          error={errors.hoursUsed?.message}
        >
          <input
            id="hoursUsed"
            type="text"
            inputMode="decimal"
            {...register('hoursUsed')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Próximo mantenimiento (opcional)"
          htmlFor="nextMaintenanceDate"
          error={errors.nextMaintenanceDate?.message}
        >
          <input
            id="nextMaintenanceDate"
            type="date"
            {...register('nextMaintenanceDate')}
            className={inputClassName}
          />
        </FormField>
      </div>

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

export default MachineryForm
