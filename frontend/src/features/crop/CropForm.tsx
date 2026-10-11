import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useCropTypes } from '../../hooks/useCropTypes'
import type { Crop, CropRequest } from '../../types/crop'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { cropStatusLabels } from '../../utils/labels'

const cropSchema = z.object({
  cropTypeId: z.string().min(1, { error: 'Elegí un tipo de cultivo' }),
  plantingDate: z.string().min(1, { error: 'Ingresá la fecha de siembra' }),
  estimatedHarvestDate: z.string(),
  actualHarvestDate: z.string(),
  plantedAreaHa: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  yieldKgHa: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  status: z.enum(['PLANTED', 'GROWING', 'HARVESTED', 'LOST']),
})

interface CropFormProps {
  initialCrop?: Crop
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: CropRequest) => Promise<void>
}

function CropForm({
  initialCrop,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: CropFormProps) {
  const cropTypes = useCropTypes()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      cropTypeId: initialCrop?.cropTypeId ?? '',
      plantingDate: initialCrop?.plantingDate ?? '',
      estimatedHarvestDate: initialCrop?.estimatedHarvestDate ?? '',
      actualHarvestDate: initialCrop?.actualHarvestDate ?? '',
      plantedAreaHa: initialCrop?.plantedAreaHa?.toString() ?? '',
      yieldKgHa: initialCrop?.yieldKgHa?.toString() ?? '',
      status: initialCrop?.status ?? 'PLANTED',
    },
  })

  if (cropTypes.isPending) {
    return <p className="text-gray-600">Cargando tipos de cultivo...</p>
  }

  if (cropTypes.isError) {
    return (
      <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
        No se pudieron cargar los tipos de cultivo.
      </p>
    )
  }

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      cropTypeId: values.cropTypeId,
      plantingDate: values.plantingDate,
      estimatedHarvestDate: toText(values.estimatedHarvestDate),
      actualHarvestDate: toText(values.actualHarvestDate),
      plantedAreaHa: toNumber(values.plantedAreaHa),
      yieldKgHa: toNumber(values.yieldKgHa),
      status: values.status,
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
          label="Tipo de cultivo"
          htmlFor="cropTypeId"
          error={errors.cropTypeId?.message}
        >
          <select id="cropTypeId" {...register('cropTypeId')} className={inputClassName}>
            <option value="">Elegí un cultivo</option>
            {cropTypes.data.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
          <select id="status" {...register('status')} className={inputClassName}>
            {Object.entries(cropStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Fecha de siembra"
          htmlFor="plantingDate"
          error={errors.plantingDate?.message}
        >
          <input
            id="plantingDate"
            type="date"
            {...register('plantingDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Cosecha estimada (opcional)"
          htmlFor="estimatedHarvestDate"
          error={errors.estimatedHarvestDate?.message}
        >
          <input
            id="estimatedHarvestDate"
            type="date"
            {...register('estimatedHarvestDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Cosecha real (opcional)"
          htmlFor="actualHarvestDate"
          error={errors.actualHarvestDate?.message}
        >
          <input
            id="actualHarvestDate"
            type="date"
            {...register('actualHarvestDate')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Superficie sembrada en ha (opcional)"
          htmlFor="plantedAreaHa"
          error={errors.plantedAreaHa?.message}
        >
          <input
            id="plantedAreaHa"
            type="text"
            inputMode="decimal"
            {...register('plantedAreaHa')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Rendimiento en kg/ha (opcional)"
          htmlFor="yieldKgHa"
          error={errors.yieldKgHa?.message}
        >
          <input
            id="yieldKgHa"
            type="text"
            inputMode="decimal"
            {...register('yieldKgHa')}
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

export default CropForm
