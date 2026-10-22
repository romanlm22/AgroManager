import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { inputClassName } from '../components/formStyles'
import { useProductions } from '../hooks/useProductions'
import { useDeleteProduction } from '../hooks/useProductionMutations'
import type { Production } from '../types/production'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'
import { productTypeLabels, productionUnitLabels } from '../utils/labels'

interface Summary {
  key: string
  label: string
  quantity: number
  income: number
}

function summarize(productions: Production[]): Summary[] {
  const byKey = new Map<string, Summary>()

  for (const production of productions) {
    const key = `${production.productType}|${production.unit}`
    const current = byKey.get(key) ?? {
      key,
      label: `${productTypeLabels[production.productType] ?? production.productType} (${
        productionUnitLabels[production.unit] ?? production.unit
      })`,
      quantity: 0,
      income: 0,
    }

    current.quantity += production.quantity
    current.income += production.totalIncome ?? 0
    byKey.set(key, current)
  }

  return [...byKey.values()]
}

function ProductionPage() {
  const { farmId = '' } = useParams()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const filters = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }
  const { data: productions, isPending, isError, refetch } = useProductions(farmId, filters)
  const deleteProduction = useDeleteProduction(farmId)
  const [toDelete, setToDelete] = useState<Production | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/livestock/productions`

  const summaries = productions ? summarize(productions) : []
  const totalIncome = summaries.reduce((sum, item) => sum + item.income, 0)
  const rangeInvalid = startDate !== '' && endDate !== '' && endDate < startDate

  const closeDialog = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setDeleteError(null)

    try {
      await deleteProduction.mutateAsync(toDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el registro. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Leche, carne, lana y otros productos ganaderos.</p>
        <Link
          to={`${basePath}/new`}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nueva producción
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="startDate" className="block text-xs text-gray-500">
            Desde
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-xs text-gray-500">
            Hasta
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={inputClassName}
          />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="pb-2 text-sm text-gray-600 underline"
          >
            Limpiar fechas
          </button>
        )}
      </div>

      {rangeInvalid && (
        <p role="alert" className="mt-2 text-sm text-amber-700">
          La fecha final es anterior a la inicial.
        </p>
      )}

      {isPending && <p className="mt-6 text-gray-600">Cargando producción...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudo cargar la producción.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {productions && productions.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          No hay registros de producción
          {startDate || endDate ? ' en ese rango de fechas.' : ' todavía.'}
        </div>
      )}

      {productions && productions.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaries.map((summary) => (
              <div
                key={summary.key}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">{summary.label}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {formatNumber(summary.quantity)}
                </p>
                {summary.income > 0 && (
                  <p className="text-sm text-gray-600">{formatCurrency(summary.income)}</p>
                )}
              </div>
            ))}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-green-800">Ingresos totales</p>
              <p className="mt-1 text-xl font-semibold text-green-900">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-green-800">Solo registros con precio</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Origen</th>
                  <th className="px-4 py-3 font-medium">Precio unit.</th>
                  <th className="px-4 py-3 font-medium">Ingreso</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productions.map((production) => (
                  <tr key={production.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {formatDate(production.productionDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {productTypeLabels[production.productType] ?? production.productType}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {formatNumber(production.quantity)}{' '}
                      {productionUnitLabels[production.unit] ?? production.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {production.animalId
                        ? `Caravana ${production.animalTagNumber}`
                        : production.herdId
                          ? `Rodeo ${production.herdName}`
                          : 'Establecimiento'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {production.pricePerUnit !== null
                        ? formatCurrency(production.pricePerUnit)
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {production.totalIncome !== null
                        ? formatCurrency(production.totalIncome)
                        : '—'}
                    </td>
                    <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        to={`${basePath}/${production.id}/edit`}
                        className="text-green-700 hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(production)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar registro"
          message={`¿Seguro que querés eliminar este registro de producción del ${formatDate(toDelete.productionDate)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteProduction.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default ProductionPage
