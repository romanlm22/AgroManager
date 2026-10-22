import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import FormField from '../components/FormField'
import { inputClassName } from '../components/formStyles'
import { useAnimal } from '../hooks/useAnimal'
import { useRetireAnimal } from '../hooks/useAnimalMutations'
import { todayIso } from '../utils/dates'
import { optionalNumber, toNumber } from '../utils/formValues'

const retireSchema = z.object({
  status: z.enum(['VENDIDO', 'MUERTO']),
  retireDate: z
    .string()
    .min(1, { error: 'Ingresá la fecha' })
    .refine((value) => value <= todayIso(), { error: 'La fecha no puede ser futura' }),
  finalWeightKg: optionalNumber('Ingresá un número mayor a 0', 0.1),
  pricePerKg: optionalNumber('Ingresá un número mayor o igual a 0', 0),
})

function RetireAnimalPage() {
  const { farmId = '', animalId = '' } = useParams()
  const navigate = useNavigate()
  const { data: animal, isPending, isError } = useAnimal(farmId, animalId)
  const retireAnimal = useRetireAnimal(farmId, animalId)
  const [serverError, setServerError] = useState<string | null>(null)
  const detailPath = `/farms/${farmId}/livestock/animals/${animalId}`

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(retireSchema),
    defaultValues: {
      status: 'VENDIDO' as 'VENDIDO' | 'MUERTO',
      retireDate: todayIso(),
      finalWeightKg: '',
      pricePerKg: '',
    },
  })

  const status = watch('status')

  const submit = handleSubmit(async (values) => {
    setServerError(null)

    const finalWeightKg = values.status === 'VENDIDO' ? toNumber(values.finalWeightKg) : null
    const pricePerKg = values.status === 'VENDIDO' ? toNumber(values.pricePerKg) : null

    if (pricePerKg !== null && finalWeightKg === null) {
      setError('finalWeightKg', { message: 'Para cargar el precio indicá también el peso final' })
      return
    }

    try {
      await retireAnimal.mutateAsync({
        status: values.status,
        retireDate: values.retireDate,
        finalWeightKg,
        pricePerKg,
      })
      navigate(detailPath)
    } catch {
      setServerError('No se pudo dar de baja al animal. Revisá los datos e intentá de nuevo.')
    }
  })

  return (
    <div className="max-w-2xl">
      <Link to={detailPath} className="text-sm text-gray-500 hover:text-green-700">
        ← Ficha del animal
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Dar de baja</h1>

      {isPending && <p className="mt-4 text-gray-600">Cargando animal...</p>}

      {isError && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
          No se encontró el animal.
        </p>
      )}

      {animal && animal.status !== 'ACTIVO' && (
        <p role="alert" className="mt-4 rounded bg-amber-50 p-4 text-amber-800">
          Este animal ya está dado de baja.
        </p>
      )}

      {animal && animal.status === 'ACTIVO' && (
        <>
          <p className="mt-1 mb-6 text-sm text-gray-600">
            Caravana {animal.tagNumber}. Un animal dado de baja deja de contar en el total de
            cabezas y ya no se puede mover.
          </p>

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
              <FormField label="Motivo" htmlFor="status" error={errors.status?.message}>
                <select id="status" {...register('status')} className={inputClassName}>
                  <option value="VENDIDO">Venta o faena</option>
                  <option value="MUERTO">Muerte</option>
                </select>
              </FormField>

              <FormField label="Fecha" htmlFor="retireDate" error={errors.retireDate?.message}>
                <input
                  id="retireDate"
                  type="date"
                  max={todayIso()}
                  {...register('retireDate')}
                  className={inputClassName}
                />
              </FormField>
            </div>

            {status === 'VENDIDO' && (
              <>
                <p className="text-sm text-gray-600">
                  Si cargás el peso final se registra una producción de carne vinculada a este
                  animal, con su ingreso si indicás el precio.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Peso final en kg (opcional)"
                    htmlFor="finalWeightKg"
                    error={errors.finalWeightKg?.message}
                  >
                    <input
                      id="finalWeightKg"
                      type="text"
                      inputMode="decimal"
                      {...register('finalWeightKg')}
                      className={inputClassName}
                    />
                  </FormField>

                  <FormField
                    label="Precio por kg (opcional)"
                    htmlFor="pricePerKg"
                    error={errors.pricePerKg?.message}
                  >
                    <input
                      id="pricePerKg"
                      type="text"
                      inputMode="decimal"
                      {...register('pricePerKg')}
                      className={inputClassName}
                    />
                  </FormField>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Link
                to={detailPath}
                className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={retireAnimal.isPending}
                className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {retireAnimal.isPending ? 'Guardando...' : 'Dar de baja'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default RetireAnimalPage
