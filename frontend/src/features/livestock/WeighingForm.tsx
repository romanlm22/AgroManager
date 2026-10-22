import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import type { Weighing, WeighingRequest } from '../../types/weighing'
import { todayIso } from '../../utils/dates'
import { toNumber, toText } from '../../utils/formValues'

const weighingSchema = z.object({
  weighingDate: z
    .string()
    .min(1, { error: 'Ingresá la fecha del pesaje' })
    .refine((value) => value <= todayIso(), { error: 'La fecha no puede ser futura' }),
  weightKg: z
    .string()
    .refine(
      (value) => {
        const parsed = Number(value.replace(',', '.'))
        return value.trim() !== '' && !Number.isNaN(parsed) && parsed > 0
      },
      { error: 'Ingresá un peso mayor a 0' },
    ),
  notes: z.string(),
})

interface WeighingFormProps {
  initialWeighing?: Weighing
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: WeighingRequest) => Promise<void>
}

function WeighingForm({
  initialWeighing,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: WeighingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(weighingSchema),
    defaultValues: {
      weighingDate: initialWeighing?.weighingDate ?? todayIso(),
      weightKg: initialWeighing?.weightKg.toString() ?? '',
      notes: initialWeighing?.notes ?? '',
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      weighingDate: values.weighingDate,
      weightKg: Number(toNumber(values.weightKg)),
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
        <FormField
          label="Fecha del pesaje"
          htmlFor="weighingDate"
          error={errors.weighingDate?.message}
        >
          <input
            id="weighingDate"
            type="date"
            max={todayIso()}
            {...register('weighingDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Peso en kg" htmlFor="weightKg" error={errors.weightKg?.message}>
          <input
            id="weightKg"
            type="text"
            inputMode="decimal"
            {...register('weightKg')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField label="Observaciones (opcional)" htmlFor="notes" error={errors.notes?.message}>
        <textarea id="notes" rows={3} {...register('notes')} className={inputClassName} />
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

export default WeighingForm
