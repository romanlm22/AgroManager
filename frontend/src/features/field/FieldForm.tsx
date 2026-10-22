import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import type { Field, FieldRequest } from '../../types/field'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { fieldStatusLabels, landUseLabels } from '../../utils/labels'

const fieldSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Ingresá el nombre del lote' })
    .max(150, { error: 'Máximo 150 caracteres' }),
  areaHa: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  soilType: z.string(),
  latitude: optionalNumber('La latitud debe estar entre -90 y 90', -90, 90),
  longitude: optionalNumber('La longitud debe estar entre -180 y 180', -180, 180),
  status: z.enum(['ACTIVE', 'FALLOW', 'INACTIVE']),
  landUse: z.enum(['AGRICULTURA', 'GANADERIA', 'MIXTO']),
  notes: z.string(),
})

interface FieldFormProps {
  initialField?: Field
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: FieldRequest) => Promise<void>
}

function FieldForm({
  initialField,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: FieldFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: initialField?.name ?? '',
      areaHa: initialField?.areaHa?.toString() ?? '',
      soilType: initialField?.soilType ?? '',
      latitude: initialField?.latitude?.toString() ?? '',
      longitude: initialField?.longitude?.toString() ?? '',
      status: initialField?.status ?? 'ACTIVE',
      landUse: initialField?.landUse ?? 'AGRICULTURA',
      notes: initialField?.notes ?? '',
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      areaHa: toNumber(values.areaHa),
      soilType: toText(values.soilType),
      latitude: toNumber(values.latitude),
      longitude: toNumber(values.longitude),
      status: values.status,
      landUse: values.landUse,
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
        <FormField
          label="Superficie en hectáreas (opcional)"
          htmlFor="areaHa"
          error={errors.areaHa?.message}
        >
          <input
            id="areaHa"
            type="text"
            inputMode="decimal"
            {...register('areaHa')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
          <select id="status" {...register('status')} className={inputClassName}>
            {Object.entries(fieldStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="Uso del lote"
        htmlFor="landUse"
        error={errors.landUse?.message}
        hint="Los lotes de ganadería o mixtos se pueden elegir como potrero en la sección Ganadería."
      >
        <select id="landUse" {...register('landUse')} className={inputClassName}>
          {Object.entries(landUseLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Tipo de suelo (opcional)"
        htmlFor="soilType"
        error={errors.soilType?.message}
      >
        <input
          id="soilType"
          type="text"
          {...register('soilType')}
          className={inputClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Latitud (opcional)"
          htmlFor="latitude"
          error={errors.latitude?.message}
        >
          <input
            id="latitude"
            type="text"
            inputMode="decimal"
            {...register('latitude')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Longitud (opcional)"
          htmlFor="longitude"
          error={errors.longitude?.message}
        >
          <input
            id="longitude"
            type="text"
            inputMode="decimal"
            {...register('longitude')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField label="Observaciones (opcional)" htmlFor="notes" error={errors.notes?.message}>
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

export default FieldForm
