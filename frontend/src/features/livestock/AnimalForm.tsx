import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useFields } from '../../hooks/useFields'
import { useHerds } from '../../hooks/useHerds'
import type { Animal, AnimalRequest } from '../../types/livestock'
import { todayIso } from '../../utils/dates'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { grazingFields } from '../../utils/livestock'
import {
  animalSexLabels,
  animalStatusLabels,
  livestockCategoryLabels,
} from '../../utils/labels'

const animalSchema = z.object({
  tagNumber: z
    .string()
    .trim()
    .min(1, { error: 'Ingresá la caravana' })
    .max(50, { error: 'Máximo 50 caracteres' }),
  sex: z.enum(['MACHO', 'HEMBRA']),
  category: z.enum(['TERNERO', 'VAQUILLONA', 'VACA', 'TORO', 'NOVILLO', 'OTRA']),
  status: z.enum(['ACTIVO', 'VENDIDO', 'MUERTO']),
  breed: z.string().max(100, { error: 'Máximo 100 caracteres' }),
  birthDate: z
    .string()
    .refine((value) => value === '' || value <= todayIso(), {
      error: 'La fecha de nacimiento no puede ser futura',
    }),
  currentWeightKg: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  herdId: z.string(),
  fieldId: z.string(),
  notes: z.string(),
})

interface AnimalFormProps {
  farmId: string
  initialAnimal?: Animal
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: AnimalRequest) => Promise<void>
}

function AnimalForm({
  farmId,
  initialAnimal,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: AnimalFormProps) {
  const fields = useFields(farmId)
  const herds = useHerds(farmId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      tagNumber: initialAnimal?.tagNumber ?? '',
      sex: initialAnimal?.sex ?? 'HEMBRA',
      category: initialAnimal?.category ?? 'VACA',
      status: initialAnimal?.status ?? 'ACTIVO',
      breed: initialAnimal?.breed ?? '',
      birthDate: initialAnimal?.birthDate ?? '',
      currentWeightKg: initialAnimal?.currentWeightKg?.toString() ?? '',
      herdId: initialAnimal?.herdId ?? '',
      fieldId: initialAnimal?.fieldId ?? '',
      notes: initialAnimal?.notes ?? '',
    },
  })

  if (fields.isPending || herds.isPending) {
    return <p className="text-gray-600">Cargando rodeos y potreros...</p>
  }

  if (fields.isError || herds.isError) {
    return (
      <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
        No se pudieron cargar los rodeos y potreros.
      </p>
    )
  }

  const paddocks = grazingFields(fields.data, initialAnimal?.fieldId)
  const isEdit = Boolean(initialAnimal)

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      tagNumber: values.tagNumber,
      sex: values.sex,
      category: values.category,
      status: values.status,
      breed: toText(values.breed),
      birthDate: toText(values.birthDate),
      currentWeightKg: toNumber(values.currentWeightKg),
      herdId: toText(values.herdId),
      fieldId: toText(values.fieldId),
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
        <FormField label="Caravana" htmlFor="tagNumber" error={errors.tagNumber?.message}>
          <input
            id="tagNumber"
            type="text"
            {...register('tagNumber')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
          <select id="status" {...register('status')} className={inputClassName}>
            {Object.entries(animalStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Sexo" htmlFor="sex" error={errors.sex?.message}>
          <select id="sex" {...register('sex')} className={inputClassName}>
            {Object.entries(animalSexLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Categoría" htmlFor="category" error={errors.category?.message}>
          <select id="category" {...register('category')} className={inputClassName}>
            {Object.entries(livestockCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Raza (opcional)" htmlFor="breed" error={errors.breed?.message}>
          <input id="breed" type="text" {...register('breed')} className={inputClassName} />
        </FormField>

        <FormField
          label="Nacimiento (opcional)"
          htmlFor="birthDate"
          error={errors.birthDate?.message}
        >
          <input
            id="birthDate"
            type="date"
            max={todayIso()}
            {...register('birthDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Peso actual en kg (opcional)"
          htmlFor="currentWeightKg"
          error={errors.currentWeightKg?.message}
        >
          <input
            id="currentWeightKg"
            type="text"
            inputMode="decimal"
            {...register('currentWeightKg')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Rodeo (opcional)" htmlFor="herdId" error={errors.herdId?.message}>
          <select id="herdId" {...register('herdId')} className={inputClassName}>
            <option value="">Sin rodeo</option>
            {herds.data.map((herd) => (
              <option key={herd.id} value={herd.id}>
                {herd.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Potrero (opcional)"
          htmlFor="fieldId"
          error={errors.fieldId?.message}
          hint={
            isEdit
              ? 'Si cambiás el potrero, se registra un movimiento.'
              : 'Si lo dejás vacío y elegiste un rodeo, usa el potrero del rodeo.'
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

export default AnimalForm
