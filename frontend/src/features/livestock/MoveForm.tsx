import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useFields } from '../../hooks/useFields'
import type { MoveRequest } from '../../types/livestock'
import { todayIso } from '../../utils/dates'
import { toText } from '../../utils/formValues'
import { grazingFields } from '../../utils/livestock'

const moveSchema = z.object({
  toFieldId: z.string().min(1, { error: 'Elegí el potrero de destino' }),
  movementDate: z
    .string()
    .min(1, { error: 'Ingresá la fecha del movimiento' })
    .refine((value) => value <= todayIso(), { error: 'La fecha no puede ser futura' }),
  notes: z.string(),
})

interface MoveFormProps {
  farmId: string
  /** Potrero actual: no se ofrece como destino. */
  currentFieldId: string | null
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: MoveRequest) => Promise<void>
}

function MoveForm({
  farmId,
  currentFieldId,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: MoveFormProps) {
  const fields = useFields(farmId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(moveSchema),
    defaultValues: {
      toFieldId: '',
      movementDate: todayIso(),
      notes: '',
    },
  })

  if (fields.isPending) {
    return <p className="text-gray-600">Cargando potreros...</p>
  }

  if (fields.isError) {
    return (
      <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
        No se pudieron cargar los potreros.
      </p>
    )
  }

  const destinations = grazingFields(fields.data).filter(
    (field) => field.id !== currentFieldId,
  )

  if (destinations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">
        No hay otro potrero disponible. Marcá un lote como Ganadería o Mixto en la sección
        Lotes para poder mover animales hacia él.
      </p>
    )
  }

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      toFieldId: values.toFieldId,
      movementDate: values.movementDate,
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
          label="Potrero de destino"
          htmlFor="toFieldId"
          error={errors.toFieldId?.message}
        >
          <select id="toFieldId" {...register('toFieldId')} className={inputClassName}>
            <option value="">Elegí un potrero</option>
            {destinations.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Fecha del movimiento"
          htmlFor="movementDate"
          error={errors.movementDate?.message}
        >
          <input
            id="movementDate"
            type="date"
            max={todayIso()}
            {...register('movementDate')}
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
          {isSubmitting ? 'Moviendo...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default MoveForm
