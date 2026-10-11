import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import type { Maintenance, MaintenanceRequest } from '../../types/machinery'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'

const maintenanceSchema = z.object({
  maintenanceDate: z.string().min(1, { error: 'Ingresá la fecha del mantenimiento' }),
  description: z.string(),
  cost: optionalNumber('Ingresá un número mayor o igual a 0', 0),
})

interface MaintenanceFormProps {
  initialMaintenance?: Maintenance
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: MaintenanceRequest) => Promise<void>
}

function MaintenanceForm({
  initialMaintenance,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: MaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenanceDate: initialMaintenance?.maintenanceDate ?? '',
      description: initialMaintenance?.description ?? '',
      cost: initialMaintenance?.cost?.toString() ?? '',
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      maintenanceDate: values.maintenanceDate,
      description: toText(values.description),
      cost: toNumber(values.cost),
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
        <FormField
          label="Fecha"
          htmlFor="maintenanceDate"
          error={errors.maintenanceDate?.message}
        >
          <input
            id="maintenanceDate"
            type="date"
            {...register('maintenanceDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Costo en ARS (opcional)" htmlFor="cost" error={errors.cost?.message}>
          <input
            id="cost"
            type="text"
            inputMode="decimal"
            {...register('cost')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField
        label="Descripción (opcional)"
        htmlFor="description"
        error={errors.description?.message}
      >
        <textarea
          id="description"
          rows={3}
          {...register('description')}
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

export default MaintenanceForm
