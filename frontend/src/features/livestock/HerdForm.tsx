import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useFields } from '../../hooks/useFields'
import type { Herd, HerdRequest } from '../../types/livestock'
import { toNumber, toText } from '../../utils/formValues'
import { grazingFields } from '../../utils/livestock'
import { livestockCategoryLabels } from '../../utils/labels'

const herdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Ingresá el nombre del rodeo' })
    .max(150, { error: 'Máximo 150 caracteres' }),
  category: z.enum(['TERNERO', 'VAQUILLONA', 'VACA', 'TORO', 'NOVILLO', 'OTRA']),
  fieldId: z.string(),
  manualHeadCount: z
    .string()
    .refine((value) => value.trim() === '' || /^\d+$/.test(value.trim()), {
      error: 'Ingresá un número entero mayor o igual a 0',
    }),
  notes: z.string(),
})

interface HerdFormProps {
  farmId: string
  initialHerd?: Herd
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: HerdRequest) => Promise<void>
}

function HerdForm({
  farmId,
  initialHerd,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: HerdFormProps) {
  const fields = useFields(farmId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(herdSchema),
    defaultValues: {
      name: initialHerd?.name ?? '',
      category: initialHerd?.category ?? 'VACA',
      fieldId: initialHerd?.fieldId ?? '',
      manualHeadCount: initialHerd?.manualHeadCount.toString() ?? '0',
      notes: initialHerd?.notes ?? '',
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

  const paddocks = grazingFields(fields.data, initialHerd?.fieldId)
  const usesTags = initialHerd?.headCountMode === 'FICHAS'

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      category: values.category,
      fieldId: toText(values.fieldId),
      manualHeadCount: toNumber(values.manualHeadCount),
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

      <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
        <input id="name" type="text" {...register('name')} className={inputClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Categoría" htmlFor="category" error={errors.category?.message}>
          <select id="category" {...register('category')} className={inputClassName}>
            {Object.entries(livestockCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Cantidad de cabezas"
          htmlFor="manualHeadCount"
          error={errors.manualHeadCount?.message}
          hint={
            usesTags
              ? `Este rodeo tiene ${initialHerd?.trackedAnimals} fichas activas: mientras las tenga, la cantidad se calcula con ellas y este conteo no se usa.`
              : 'Conteo manual. Si cargás fichas individuales en este rodeo, la cantidad pasa a calcularse con ellas.'
          }
        >
          <input
            id="manualHeadCount"
            type="text"
            inputMode="numeric"
            {...register('manualHeadCount')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField
        label="Potrero (opcional)"
        htmlFor="fieldId"
        error={errors.fieldId?.message}
        hint={
          paddocks.length === 0
            ? 'Todavía no tenés potreros: marcá un lote como Ganadería o Mixto en la sección Lotes.'
            : initialHerd
              ? 'Si cambiás el potrero, los animales activos del rodeo se mueven con él y queda registrado.'
              : undefined
        }
      >
        <select id="fieldId" {...register('fieldId')} className={inputClassName}>
          <option value="">Sin potrero</option>
          {paddocks.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name}
            </option>
          ))}
        </select>
      </FormField>

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

export default HerdForm
