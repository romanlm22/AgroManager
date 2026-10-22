import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useAnimals } from '../../hooks/useAnimals'
import { useHerds } from '../../hooks/useHerds'
import type { HealthEvent, HealthEventRequest } from '../../types/health'
import type { Animal, Herd } from '../../types/livestock'
import { todayIso } from '../../utils/dates'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { healthEventTypeLabels } from '../../utils/labels'
import { resolveTarget } from './target'

const healthSchema = z.object({
  targetType: z.enum(['ANIMAL', 'HERD']),
  animalTag: z.string(),
  herdId: z.string(),
  eventType: z.enum(['VACUNACION', 'DESPARASITACION', 'TRATAMIENTO', 'OTRO']),
  eventDate: z
    .string()
    .min(1, { error: 'Ingresá la fecha' })
    .refine((value) => value <= todayIso(), { error: 'La fecha no puede ser futura' }),
  product: z
    .string()
    .trim()
    .min(1, { error: 'Ingresá el producto' })
    .max(150, { error: 'Máximo 150 caracteres' }),
  dose: z.string().max(100, { error: 'Máximo 100 caracteres' }),
  nextDoseDate: z.string(),
  cost: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  notes: z.string(),
})

interface HealthEventFormProps {
  farmId: string
  initialEvent?: HealthEvent
  defaultAnimalId?: string
  defaultHerdId?: string
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: HealthEventRequest) => Promise<void>
}

type InnerProps = HealthEventFormProps & { animals: Animal[]; herds: Herd[] }

function HealthEventFormInner({
  initialEvent,
  defaultAnimalId,
  defaultHerdId,
  animals,
  herds,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: InnerProps) {
  const defaultAnimal = animals.find((animal) => animal.id === defaultAnimalId)
  const startsOnHerd = initialEvent ? initialEvent.herdId !== null : Boolean(defaultHerdId)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      targetType: (startsOnHerd ? 'HERD' : 'ANIMAL') as 'ANIMAL' | 'HERD',
      animalTag: initialEvent?.animalTagNumber ?? defaultAnimal?.tagNumber ?? '',
      herdId: initialEvent?.herdId ?? defaultHerdId ?? '',
      eventType: initialEvent?.eventType ?? 'VACUNACION',
      eventDate: initialEvent?.eventDate ?? todayIso(),
      product: initialEvent?.product ?? '',
      dose: initialEvent?.dose ?? '',
      nextDoseDate: initialEvent?.nextDoseDate ?? '',
      cost: initialEvent?.cost?.toString() ?? '',
      notes: initialEvent?.notes ?? '',
    },
  })

  const targetType = watch('targetType')

  const submit = handleSubmit(async (values) => {
    const target = resolveTarget(values.targetType, values.animalTag, values.herdId, animals)
    if (target.error) {
      setError(target.error.field, { message: target.error.message })
      return
    }

    if (values.nextDoseDate !== '' && values.nextDoseDate < values.eventDate) {
      setError('nextDoseDate', {
        message: 'La próxima dosis no puede ser anterior a la fecha del evento',
      })
      return
    }

    await onSubmit({
      animalId: target.animalId,
      herdId: target.herdId,
      eventType: values.eventType,
      eventDate: values.eventDate,
      product: values.product,
      dose: toText(values.dose),
      nextDoseDate: toText(values.nextDoseDate),
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

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Se aplica a</legend>
        <div className="mt-2 flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" value="ANIMAL" {...register('targetType')} />
            Un animal
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="HERD" {...register('targetType')} />
            Un rodeo completo
          </label>
        </div>
      </fieldset>

      {targetType === 'ANIMAL' ? (
        <FormField
          label="Caravana del animal"
          htmlFor="animalTag"
          error={errors.animalTag?.message}
          hint="Empezá a escribir y elegí de la lista."
        >
          <input
            id="animalTag"
            type="text"
            list="health-animal-tags"
            autoComplete="off"
            {...register('animalTag')}
            className={inputClassName}
          />
          <datalist id="health-animal-tags">
            {animals.map((animal) => (
              <option key={animal.id} value={animal.tagNumber} />
            ))}
          </datalist>
        </FormField>
      ) : (
        <FormField label="Rodeo" htmlFor="herdId" error={errors.herdId?.message}>
          <select id="herdId" {...register('herdId')} className={inputClassName}>
            <option value="">Elegí un rodeo</option>
            {herds.map((herd) => (
              <option key={herd.id} value={herd.id}>
                {herd.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tipo" htmlFor="eventType" error={errors.eventType?.message}>
          <select id="eventType" {...register('eventType')} className={inputClassName}>
            {Object.entries(healthEventTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Fecha" htmlFor="eventDate" error={errors.eventDate?.message}>
          <input
            id="eventDate"
            type="date"
            max={todayIso()}
            {...register('eventDate')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Producto"
          htmlFor="product"
          error={errors.product?.message}
          hint="Ej: Aftosa, Ivermectina"
        >
          <input id="product" type="text" {...register('product')} className={inputClassName} />
        </FormField>

        <FormField label="Dosis (opcional)" htmlFor="dose" error={errors.dose?.message}>
          <input id="dose" type="text" {...register('dose')} className={inputClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Próxima dosis (opcional)"
          htmlFor="nextDoseDate"
          error={errors.nextDoseDate?.message}
          hint="Genera un aviso cuando se acerca o se vence."
        >
          <input
            id="nextDoseDate"
            type="date"
            {...register('nextDoseDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Costo (opcional)" htmlFor="cost" error={errors.cost?.message}>
          <input
            id="cost"
            type="text"
            inputMode="decimal"
            {...register('cost')}
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

function HealthEventForm(props: HealthEventFormProps) {
  const animals = useAnimals(props.farmId)
  const herds = useHerds(props.farmId)

  if (animals.isPending || herds.isPending) {
    return <p className="text-gray-600">Cargando animales y rodeos...</p>
  }

  if (animals.isError || herds.isError) {
    return (
      <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
        No se pudieron cargar los animales y rodeos.
      </p>
    )
  }

  return <HealthEventFormInner {...props} animals={animals.data} herds={herds.data} />
}

export default HealthEventForm
