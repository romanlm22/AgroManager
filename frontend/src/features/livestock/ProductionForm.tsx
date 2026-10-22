import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import { useAnimals } from '../../hooks/useAnimals'
import { useHerds } from '../../hooks/useHerds'
import type { Animal, Herd } from '../../types/livestock'
import type { LivestockProductType, Production, ProductionRequest } from '../../types/production'
import { todayIso } from '../../utils/dates'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { productTypeLabels, productionUnitLabels } from '../../utils/labels'
import { resolveTarget } from './target'

const defaultUnits: Record<LivestockProductType, 'LITROS' | 'KG' | 'UNIDADES'> = {
  LECHE: 'LITROS',
  CARNE: 'KG',
  LANA: 'KG',
  HUEVOS: 'UNIDADES',
  CUERO: 'UNIDADES',
  OTRO: 'KG',
}

const productionSchema = z.object({
  targetType: z.enum(['NONE', 'HERD', 'ANIMAL']),
  animalTag: z.string(),
  herdId: z.string(),
  productType: z.enum(['LECHE', 'CARNE', 'LANA', 'HUEVOS', 'CUERO', 'OTRO']),
  productionDate: z
    .string()
    .min(1, { error: 'Ingresá la fecha' })
    .refine((value) => value <= todayIso(), { error: 'La fecha no puede ser futura' }),
  quantity: z.string().refine(
    (value) => {
      const parsed = Number(value.replace(',', '.'))
      return value.trim() !== '' && !Number.isNaN(parsed) && parsed > 0
    },
    { error: 'Ingresá una cantidad mayor a 0' },
  ),
  unit: z.enum(['LITROS', 'KG', 'UNIDADES']),
  pricePerUnit: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  notes: z.string(),
})

interface ProductionFormProps {
  farmId: string
  initialProduction?: Production
  defaultAnimalId?: string
  defaultHerdId?: string
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: ProductionRequest) => Promise<void>
}

type InnerProps = ProductionFormProps & { animals: Animal[]; herds: Herd[] }

function ProductionFormInner({
  initialProduction,
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

  let startTarget: 'NONE' | 'HERD' | 'ANIMAL' = 'NONE'
  if (initialProduction?.animalId || (!initialProduction && defaultAnimal)) {
    startTarget = 'ANIMAL'
  } else if (initialProduction?.herdId || (!initialProduction && defaultHerdId)) {
    startTarget = 'HERD'
  }

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      targetType: startTarget,
      animalTag: initialProduction?.animalTagNumber ?? defaultAnimal?.tagNumber ?? '',
      herdId: initialProduction?.herdId ?? defaultHerdId ?? '',
      productType: initialProduction?.productType ?? 'LECHE',
      productionDate: initialProduction?.productionDate ?? todayIso(),
      quantity: initialProduction?.quantity.toString() ?? '',
      unit: initialProduction?.unit ?? 'LITROS',
      pricePerUnit: initialProduction?.pricePerUnit?.toString() ?? '',
      notes: initialProduction?.notes ?? '',
    },
  })

  const targetType = watch('targetType')

  const submit = handleSubmit(async (values) => {
    const target = resolveTarget(values.targetType, values.animalTag, values.herdId, animals)
    if (target.error) {
      setError(target.error.field, { message: target.error.message })
      return
    }

    await onSubmit({
      productType: values.productType,
      productionDate: values.productionDate,
      quantity: Number(toNumber(values.quantity)),
      unit: values.unit,
      herdId: target.herdId,
      animalId: target.animalId,
      pricePerUnit: toNumber(values.pricePerUnit),
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
        <FormField label="Producto" htmlFor="productType" error={errors.productType?.message}>
          <select
            id="productType"
            {...register('productType', {
              onChange: (event) =>
                setValue('unit', defaultUnits[event.target.value as LivestockProductType]),
            })}
            className={inputClassName}
          >
            {Object.entries(productTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Fecha"
          htmlFor="productionDate"
          error={errors.productionDate?.message}
        >
          <input
            id="productionDate"
            type="date"
            max={todayIso()}
            {...register('productionDate')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Cantidad" htmlFor="quantity" error={errors.quantity?.message}>
          <input
            id="quantity"
            type="text"
            inputMode="decimal"
            {...register('quantity')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Unidad" htmlFor="unit" error={errors.unit?.message}>
          <select id="unit" {...register('unit')} className={inputClassName}>
            {Object.entries(productionUnitLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Precio por unidad (opcional)"
          htmlFor="pricePerUnit"
          error={errors.pricePerUnit?.message}
          hint="Con el precio se calcula el ingreso."
        >
          <input
            id="pricePerUnit"
            type="text"
            inputMode="decimal"
            {...register('pricePerUnit')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Origen (opcional)</legend>
        <div className="mt-2 flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" value="NONE" {...register('targetType')} />
            Todo el establecimiento
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="HERD" {...register('targetType')} />
            Un rodeo
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="ANIMAL" {...register('targetType')} />
            Un animal
          </label>
        </div>
      </fieldset>

      {targetType === 'HERD' && (
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

      {targetType === 'ANIMAL' && (
        <FormField
          label="Caravana del animal"
          htmlFor="animalTag"
          error={errors.animalTag?.message}
          hint="Empezá a escribir y elegí de la lista."
        >
          <input
            id="animalTag"
            type="text"
            list="production-animal-tags"
            autoComplete="off"
            {...register('animalTag')}
            className={inputClassName}
          />
          <datalist id="production-animal-tags">
            {animals.map((animal) => (
              <option key={animal.id} value={animal.tagNumber} />
            ))}
          </datalist>
        </FormField>
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

function ProductionForm(props: ProductionFormProps) {
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

  return <ProductionFormInner {...props} animals={animals.data} herds={herds.data} />
}

export default ProductionForm
