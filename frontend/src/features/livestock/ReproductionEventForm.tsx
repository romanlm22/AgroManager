import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useAnimals } from '../../hooks/useAnimals'
import type { Animal } from '../../types/livestock'
import type {
  ReproductionEvent,
  ReproductionEventRequest,
} from '../../types/reproduction'
import { todayIso } from '../../utils/dates'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import {
  animalSexLabels,
  reproductionEventTypeLabels,
  serviceTypeLabels,
  tactoResultLabels,
} from '../../utils/labels'

const reproductionSchema = z.object({
  animalTag: z.string().trim().min(1, { error: 'Ingresá la caravana de la hembra' }),
  eventType: z.enum(['SERVICIO', 'TACTO', 'PARTO', 'ABORTO']),
  eventDate: z
    .string()
    .min(1, { error: 'Ingresá la fecha' })
    .refine((value) => value <= todayIso(), { error: 'La fecha no puede ser futura' }),
  serviceType: z.enum(['NATURAL', 'INSEMINACION']),
  sire: z.string().max(150, { error: 'Máximo 150 caracteres' }),
  tactoResult: z.enum(['PRENADA', 'VACIA']),
  registerCalf: z.boolean(),
  calfTag: z.string().max(50, { error: 'Máximo 50 caracteres' }),
  calfSex: z.enum(['MACHO', 'HEMBRA']),
  calfWeight: optionalNumber('Ingresá un número mayor a 0', 0.1),
  notes: z.string(),
})

interface ReproductionEventFormProps {
  farmId: string
  initialEvent?: ReproductionEvent
  defaultAnimalId?: string
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: ReproductionEventRequest) => Promise<void>
}

type InnerProps = ReproductionEventFormProps & { animals: Animal[] }

function ReproductionEventFormInner({
  initialEvent,
  defaultAnimalId,
  animals,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: InnerProps) {
  const isEdit = Boolean(initialEvent)
  const females = animals.filter((animal) => animal.sex === 'HEMBRA' && animal.status === 'ACTIVO')
  const males = animals.filter((animal) => animal.sex === 'MACHO' && animal.status === 'ACTIVO')
  const defaultAnimal = animals.find((animal) => animal.id === defaultAnimalId)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reproductionSchema),
    defaultValues: {
      animalTag: initialEvent?.animalTagNumber ?? defaultAnimal?.tagNumber ?? '',
      eventType: initialEvent?.eventType ?? 'SERVICIO',
      eventDate: initialEvent?.eventDate ?? todayIso(),
      serviceType: initialEvent?.serviceType ?? 'NATURAL',
      sire: initialEvent?.sireTagNumber ?? initialEvent?.sireDescription ?? '',
      tactoResult: initialEvent?.tactoResult ?? 'PRENADA',
      registerCalf: false,
      calfTag: '',
      calfSex: 'HEMBRA' as 'MACHO' | 'HEMBRA',
      calfWeight: '',
      notes: initialEvent?.notes ?? '',
    },
  })

  const eventType = watch('eventType')
  const registerCalf = watch('registerCalf')

  const submit = handleSubmit(async (values) => {
    const tag = values.animalTag.trim().toLowerCase()
    const animal = animals.find((candidate) => candidate.tagNumber.toLowerCase() === tag)

    if (!animal) {
      setError('animalTag', { message: 'No hay ningún animal con esa caravana' })
      return
    }
    if (animal.sex !== 'HEMBRA') {
      setError('animalTag', { message: 'Solo las hembras tienen eventos reproductivos' })
      return
    }

    let sireAnimalId: string | null = null
    let sireDescription: string | null = null
    if (values.eventType === 'SERVICIO') {
      const sireText = values.sire.trim()
      const sireAnimal = males.find(
        (candidate) => candidate.tagNumber.toLowerCase() === sireText.toLowerCase(),
      )
      sireAnimalId = sireAnimal?.id ?? null
      sireDescription = sireAnimal ? null : toText(sireText)
    }

    let calf: ReproductionEventRequest['calf'] = null
    if (!isEdit && values.eventType === 'PARTO' && values.registerCalf) {
      const calfTag = values.calfTag.trim()
      if (calfTag === '') {
        setError('calfTag', { message: 'Ingresá la caravana de la cría' })
        return
      }
      if (animals.some((candidate) => candidate.tagNumber.toLowerCase() === calfTag.toLowerCase())) {
        setError('calfTag', { message: 'Ya existe un animal con esa caravana' })
        return
      }
      calf = { tagNumber: calfTag, sex: values.calfSex, birthWeightKg: toNumber(values.calfWeight) }
    }

    await onSubmit({
      animalId: animal.id,
      eventType: values.eventType,
      eventDate: values.eventDate,
      serviceType: values.eventType === 'SERVICIO' ? values.serviceType : null,
      sireAnimalId,
      sireDescription,
      tactoResult: values.eventType === 'TACTO' ? values.tactoResult : null,
      calf,
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

      <FormField
        label="Caravana de la hembra"
        htmlFor="animalTag"
        error={errors.animalTag?.message}
        hint="Empezá a escribir y elegí de la lista."
      >
        <input
          id="animalTag"
          type="text"
          list="reproduction-female-tags"
          autoComplete="off"
          {...register('animalTag')}
          className={inputClassName}
        />
        <datalist id="reproduction-female-tags">
          {females.map((animal) => (
            <option key={animal.id} value={animal.tagNumber} />
          ))}
        </datalist>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Evento" htmlFor="eventType" error={errors.eventType?.message}>
          <select id="eventType" {...register('eventType')} className={inputClassName}>
            {Object.entries(reproductionEventTypeLabels).map(([value, label]) => (
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

      {eventType === 'SERVICIO' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de servicio" htmlFor="serviceType" error={errors.serviceType?.message}>
            <select id="serviceType" {...register('serviceType')} className={inputClassName}>
              {Object.entries(serviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Toro o pajuela (opcional)"
            htmlFor="sire"
            error={errors.sire?.message}
            hint="Elegí la caravana de un toro cargado o escribí el nombre del toro o de la pajuela."
          >
            <input
              id="sire"
              type="text"
              list="reproduction-male-tags"
              autoComplete="off"
              {...register('sire')}
              className={inputClassName}
            />
            <datalist id="reproduction-male-tags">
              {males.map((animal) => (
                <option key={animal.id} value={animal.tagNumber} />
              ))}
            </datalist>
          </FormField>
        </div>
      )}

      {eventType === 'TACTO' && (
        <FormField label="Resultado" htmlFor="tactoResult" error={errors.tactoResult?.message}>
          <select id="tactoResult" {...register('tactoResult')} className={inputClassName}>
            {Object.entries(tactoResultLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {eventType === 'PARTO' && !isEdit && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" {...register('registerCalf')} />
            Registrar la cría
          </label>

          {registerCalf && (
            <>
              <p className="text-sm text-gray-600">
                Se crea la ficha del ternero con la fecha del parto, el rodeo y el potrero de
                la madre.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Caravana de la cría"
                  htmlFor="calfTag"
                  error={errors.calfTag?.message}
                >
                  <input
                    id="calfTag"
                    type="text"
                    {...register('calfTag')}
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Sexo" htmlFor="calfSex" error={errors.calfSex?.message}>
                  <select id="calfSex" {...register('calfSex')} className={inputClassName}>
                    {Object.entries(animalSexLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Peso al nacer en kg (opcional)"
                  htmlFor="calfWeight"
                  error={errors.calfWeight?.message}
                >
                  <input
                    id="calfWeight"
                    type="text"
                    inputMode="decimal"
                    {...register('calfWeight')}
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </>
          )}
        </div>
      )}

      {eventType === 'PARTO' && isEdit && (
        <p className="text-sm text-gray-600">
          La cría solo se registra al cargar el parto. Si ya tiene ficha, se edita desde
          Animales.
        </p>
      )}

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

function ReproductionEventForm(props: ReproductionEventFormProps) {
  const animals = useAnimals(props.farmId)

  if (animals.isPending) {
    return <p className="text-gray-600">Cargando animales...</p>
  }

  if (animals.isError) {
    return (
      <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
        No se pudieron cargar los animales.
      </p>
    )
  }

  return <ReproductionEventFormInner {...props} animals={animals.data} />
}

export default ReproductionEventForm
