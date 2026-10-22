import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import FormField from '../components/FormField'
import { inputClassName } from '../components/formStyles'
import { parseTags } from '../features/livestock/bulkTags'
import { useCreateAnimalsBulk } from '../hooks/useAnimalMutations'
import { useFields } from '../hooks/useFields'
import { useHerds } from '../hooks/useHerds'
import { todayIso } from '../utils/dates'
import { toText } from '../utils/formValues'
import { animalSexLabels, livestockCategoryLabels } from '../utils/labels'
import { describeDuplicateTags, getDuplicateTags, grazingFields } from '../utils/livestock'

const bulkSchema = z.object({
  mode: z.enum(['RANGO', 'LISTA']),
  prefix: z.string().max(40, { error: 'Máximo 40 caracteres' }),
  from: z.string(),
  to: z.string(),
  list: z.string(),
  sex: z.enum(['MACHO', 'HEMBRA']),
  category: z.enum(['TERNERO', 'VAQUILLONA', 'VACA', 'TORO', 'NOVILLO', 'OTRA']),
  breed: z.string().max(100, { error: 'Máximo 100 caracteres' }),
  birthDate: z
    .string()
    .refine((value) => value === '' || value <= todayIso(), {
      error: 'La fecha de nacimiento no puede ser futura',
    }),
  herdId: z.string(),
  fieldId: z.string(),
  notes: z.string(),
})

function BulkAnimalsPage() {
  const { farmId = '' } = useParams()
  const navigate = useNavigate()
  const fields = useFields(farmId)
  const herds = useHerds(farmId)
  const createBulk = useCreateAnimalsBulk(farmId)
  const [serverError, setServerError] = useState<string | null>(null)
  const listPath = `/farms/${farmId}/livestock/animals`

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      mode: 'RANGO' as const,
      prefix: '',
      from: '',
      to: '',
      list: '',
      sex: 'HEMBRA' as const,
      category: 'VACA' as const,
      breed: '',
      birthDate: '',
      herdId: '',
      fieldId: '',
      notes: '',
    },
  })

  const values = watch()
  const parsed = parseTags({
    mode: values.mode,
    prefix: values.prefix ?? '',
    from: values.from ?? '',
    to: values.to ?? '',
    list: values.list ?? '',
  })

  const submit = handleSubmit(async (formValues) => {
    setServerError(null)

    const result = parseTags(formValues)
    if (result.error || result.tags.length === 0) {
      setError(result.errorField ?? 'list', {
        message: result.error ?? 'Ingresá al menos una caravana',
      })
      return
    }

    try {
      await createBulk.mutateAsync({
        tagNumbers: result.tags,
        sex: formValues.sex,
        category: formValues.category,
        breed: toText(formValues.breed),
        birthDate: toText(formValues.birthDate),
        herdId: toText(formValues.herdId),
        fieldId: toText(formValues.fieldId),
        notes: toText(formValues.notes),
      })
      navigate(listPath)
    } catch (error) {
      const duplicates = getDuplicateTags(error)
      setServerError(
        duplicates
          ? `${describeDuplicateTags(duplicates)} No se cargó ningún animal.`
          : 'No se pudieron crear los animales. Revisá los datos e intentá de nuevo.',
      )
    }
  })

  const paddocks = fields.data ? grazingFields(fields.data) : []

  return (
    <div className="max-w-2xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Animales
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Carga masiva de animales</h1>
      <p className="mt-1 mb-6 text-sm text-gray-600">
        Creá varias fichas de una vez. Todas comparten los mismos datos; si tenés
        machos y hembras, hacé una carga por cada sexo.
      </p>

      {(fields.isPending || herds.isPending) && (
        <p className="text-gray-600">Cargando rodeos y potreros...</p>
      )}

      {(fields.isError || herds.isError) && (
        <p role="alert" className="rounded bg-red-50 p-4 text-red-700">
          No se pudieron cargar los rodeos y potreros.
        </p>
      )}

      {fields.data && herds.data && (
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
            <legend className="text-sm font-medium text-gray-700">Caravanas</legend>
            <div className="mt-2 flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" value="RANGO" {...register('mode')} />
                Por rango
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="LISTA" {...register('mode')} />
                Pegar lista
              </label>
            </div>
          </fieldset>

          {values.mode === 'RANGO' ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                label="Prefijo (opcional)"
                htmlFor="prefix"
                error={errors.prefix?.message}
                hint="Ej: AR-"
              >
                <input
                  id="prefix"
                  type="text"
                  {...register('prefix')}
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Desde" htmlFor="from" error={errors.from?.message} hint="Ej: 0001">
                <input
                  id="from"
                  type="text"
                  inputMode="numeric"
                  {...register('from')}
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Hasta" htmlFor="to" error={errors.to?.message} hint="Ej: 0050">
                <input
                  id="to"
                  type="text"
                  inputMode="numeric"
                  {...register('to')}
                  className={inputClassName}
                />
              </FormField>
            </div>
          ) : (
            <FormField
              label="Lista de caravanas"
              htmlFor="list"
              error={errors.list?.message}
              hint="Separadas por espacios, comas o renglones. Podés pegarlas desde una planilla."
            >
              <textarea
                id="list"
                rows={5}
                {...register('list')}
                className={inputClassName}
              />
            </FormField>
          )}

          {parsed.hasInput && (
            <div className="rounded bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {parsed.error ? (
                <span className="text-amber-700">{parsed.error}</span>
              ) : (
                <>
                  Se van a crear <strong>{parsed.tags.length}</strong>{' '}
                  {parsed.tags.length === 1 ? 'animal' : 'animales'}:{' '}
                  {parsed.tags.slice(0, 3).join(', ')}
                  {parsed.tags.length > 4 && ' … '}
                  {parsed.tags.length > 3 && parsed.tags.slice(-1)[0]}
                  {parsed.ignoredRepeats > 0 &&
                    ` (se ignoraron ${parsed.ignoredRepeats} repetidas)`}
                </>
              )}
            </div>
          )}

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

          <div className="grid gap-4 sm:grid-cols-2">
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
              hint="Si lo dejás vacío y elegiste un rodeo, usa el potrero del rodeo."
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
            <textarea id="notes" rows={2} {...register('notes')} className={inputClassName} />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to={listPath}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={createBulk.isPending}
              className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {createBulk.isPending
                ? 'Creando...'
                : parsed.tags.length > 0
                  ? `Crear ${parsed.tags.length} ${parsed.tags.length === 1 ? 'animal' : 'animales'}`
                  : 'Crear animales'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default BulkAnimalsPage
