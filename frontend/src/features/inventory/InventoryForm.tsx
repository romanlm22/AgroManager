import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { z } from 'zod'
import FormField from '../../components/FormField'
import { inputClassName } from '../../components/formStyles'
import type { InventoryItem, InventoryItemRequest } from '../../types/inventory'
import { optionalNumber, toNumber, toText } from '../../utils/formValues'
import { inventoryCategoryLabels, unitLabels } from '../../utils/labels'

const itemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Ingresá el nombre del insumo' })
    .max(150, { error: 'Máximo 150 caracteres' }),
  category: z.enum([
    'SEMILLA',
    'FERTILIZANTE',
    'HERBICIDA',
    'FUNGICIDA',
    'INSECTICIDA',
    'OTRO',
  ]),
  unit: z.enum(['KG', 'LITRO', 'UNIDAD', 'BOLSA', 'TONELADA']),
  stock: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  price: optionalNumber('Ingresá un número mayor o igual a 0', 0),
  supplier: z.string().max(150, { error: 'Máximo 150 caracteres' }),
  expirationDate: z.string(),
  batchNumber: z.string().max(100, { error: 'Máximo 100 caracteres' }),
})

interface InventoryFormProps {
  initialItem?: InventoryItem
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (request: InventoryItemRequest) => Promise<void>
}

function InventoryForm({
  initialItem,
  submitLabel,
  isSubmitting,
  serverError,
  cancelTo,
  onSubmit,
}: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: initialItem?.name ?? '',
      category: initialItem?.category ?? 'SEMILLA',
      unit: initialItem?.unit ?? 'KG',
      stock: initialItem?.stock?.toString() ?? '0',
      price: initialItem?.price?.toString() ?? '',
      supplier: initialItem?.supplier ?? '',
      expirationDate: initialItem?.expirationDate ?? '',
      batchNumber: initialItem?.batchNumber ?? '',
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      category: values.category,
      unit: values.unit,
      stock: toNumber(values.stock) ?? 0,
      price: toNumber(values.price),
      supplier: toText(values.supplier),
      expirationDate: toText(values.expirationDate),
      batchNumber: toText(values.batchNumber),
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
            {Object.entries(inventoryCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Proveedor (opcional)" htmlFor="supplier" error={errors.supplier?.message}>
          <input
            id="supplier"
            type="text"
            {...register('supplier')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Stock" htmlFor="stock" error={errors.stock?.message}>
          <input
            id="stock"
            type="text"
            inputMode="decimal"
            {...register('stock')}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Unidad" htmlFor="unit" error={errors.unit?.message}>
          <select id="unit" {...register('unit')} className={inputClassName}>
            {Object.entries(unitLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Precio por unidad en ARS (opcional)"
          htmlFor="price"
          error={errors.price?.message}
        >
          <input
            id="price"
            type="text"
            inputMode="decimal"
            {...register('price')}
            className={inputClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Vencimiento (opcional)"
          htmlFor="expirationDate"
          error={errors.expirationDate?.message}
        >
          <input
            id="expirationDate"
            type="date"
            {...register('expirationDate')}
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Lote o partida del fabricante (opcional)"
          htmlFor="batchNumber"
          error={errors.batchNumber?.message}
        >
          <input
            id="batchNumber"
            type="text"
            {...register('batchNumber')}
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

export default InventoryForm
