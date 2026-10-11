import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import type { Farm, FarmRequest } from '../../types/farm'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'

const farmSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Ingresá el nombre del establecimiento' })
    .max(150, { error: 'Máximo 150 caracteres' }),
  description: z.string(),
  location: z.string(),
  totalAreaHa: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  latitude: optionalNumber('La latitud debe estar entre -90 y 90', -90, 90),
  longitude: optionalNumber('La longitud debe estar entre -180 y 180', -180, 180),
})

interface FarmFormProps {
  initialFarm?: Farm
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: FarmRequest) => Promise<void>
}

function FarmForm({
  initialFarm,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: FarmFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: initialFarm?.name ?? '',
      description: initialFarm?.description ?? '',
      location: initialFarm?.location ?? '',
      totalAreaHa: initialFarm?.totalAreaHa?.toString() ?? '',
      latitude: initialFarm?.latitude?.toString() ?? '',
      longitude: initialFarm?.longitude?.toString() ?? '',
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: toText(values.description),
      location: toText(values.location),
      totalAreaHa: toNumber(values.totalAreaHa),
      latitude: toNumber(values.latitude),
      longitude: toNumber(values.longitude),
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

      <FormField
        label="Ubicación (opcional)"
        htmlFor="location"
        error={errors.location?.message}
      >
        <input
          id="location"
          type="text"
          {...register('location')}
          className={inputClassName}
        />
      </FormField>

      <FormField
        label="Superficie total en hectáreas (opcional)"
        htmlFor="totalAreaHa"
        error={errors.totalAreaHa?.message}
      >
        <input
          id="totalAreaHa"
          type="text"
          inputMode="decimal"
          {...register('totalAreaHa')}
          className={inputClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Latitud (opcional)"
          htmlFor="latitude"
          error={errors.latitude?.message}
          hint="Ej: -27.4692. Con coordenadas se muestra el clima."
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
          hint="Ej: -58.8306"
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

export default FarmForm
