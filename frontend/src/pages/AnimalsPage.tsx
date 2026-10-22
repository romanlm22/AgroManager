import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog'
import { inputClassName } from '../components/formStyles'
import { useAnimals } from '../hooks/useAnimals'
import { useDeleteAnimal } from '../hooks/useAnimalMutations'
import { useHerds } from '../hooks/useHerds'
import type { Animal } from '../types/livestock'
import { formatNumber } from '../utils/format'
import {
  animalSexLabels,
  animalStatusLabels,
  livestockCategoryLabels,
} from '../utils/labels'

const PAGE_SIZE = 100

const statusStyles: Record<string, string> = {
  ACTIVO: 'bg-green-100 text-green-800',
  VENDIDO: 'bg-blue-100 text-blue-800',
  MUERTO: 'bg-gray-100 text-gray-700',
}

function AnimalsPage() {
  const { farmId = '' } = useParams()
  const { data: animals, isPending, isError, refetch } = useAnimals(farmId)
  const herds = useHerds(farmId)
  const deleteAnimal = useDeleteAnimal(farmId)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ACTIVO')
  const [herdFilter, setHerdFilter] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [toDelete, setToDelete] = useState<Animal | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const basePath = `/farms/${farmId}/livestock/animals`

  const normalizedSearch = search.trim().toLowerCase()
  const filtered = (animals ?? []).filter((animal) => {
    if (statusFilter !== 'ALL' && animal.status !== statusFilter) return false
    if (herdFilter === 'NONE' && animal.herdId !== null) return false
    if (herdFilter !== '' && herdFilter !== 'NONE' && animal.herdId !== herdFilter) return false
    if (normalizedSearch && !animal.tagNumber.toLowerCase().includes(normalizedSearch)) {
      return false
    }
    return true
  })
  const shown = filtered.slice(0, visible)

  const resetVisible = () => setVisible(PAGE_SIZE)

  const closeDialog = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setDeleteError(null)

    try {
      await deleteAnimal.mutateAsync(toDelete.id)
      closeDialog()
    } catch {
      setDeleteError('No se pudo eliminar el animal. Intentá de nuevo.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {animals
            ? `${formatNumber(filtered.length)} de ${formatNumber(animals.length)} animales`
            : 'Fichas individuales con caravana.'}
        </p>
        <div className="flex gap-2">
          <Link
            to={`${basePath}/bulk`}
            className="rounded border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
          >
            Carga masiva
          </Link>
          <Link
            to={`${basePath}/new`}
            className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            Nuevo animal
          </Link>
        </div>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando animales...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar los animales.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {animals && animals.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Todavía no cargaste animales. Creá uno con el botón de arriba o usá la carga
          masiva para varios a la vez.
        </div>
      )}

      {animals && animals.length > 0 && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                resetVisible()
              }}
              placeholder="Buscar caravana"
              aria-label="Buscar caravana"
              className={inputClassName}
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                resetVisible()
              }}
              aria-label="Filtrar por estado"
              className={inputClassName}
            >
              <option value="ALL">Todos los estados</option>
              {Object.entries(animalStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={herdFilter}
              onChange={(event) => {
                setHerdFilter(event.target.value)
                resetVisible()
              }}
              aria-label="Filtrar por rodeo"
              className={inputClassName}
            >
              <option value="">Todos los rodeos</option>
              <option value="NONE">Sin rodeo</option>
              {herds.data?.map((herd) => (
                <option key={herd.id} value={herd.id}>
                  {herd.name}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              Ningún animal coincide con los filtros.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Caravana</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Sexo</th>
                    <th className="px-4 py-3 font-medium">Rodeo</th>
                    <th className="px-4 py-3 font-medium">Potrero</th>
                    <th className="px-4 py-3 font-medium">Peso</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shown.map((animal) => (
                    <tr key={animal.id}>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          to={`${basePath}/${animal.id}`}
                          className="text-green-700 hover:underline"
                        >
                          {animal.tagNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {livestockCategoryLabels[animal.category] ?? animal.category}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {animalSexLabels[animal.sex] ?? animal.sex}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{animal.herdName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{animal.fieldName ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {animal.currentWeightKg !== null
                          ? `${formatNumber(animal.currentWeightKg)} kg`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusStyles[animal.status] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {animalStatusLabels[animal.status] ?? animal.status}
                        </span>
                      </td>
                      <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          to={`${basePath}/${animal.id}`}
                          className="text-green-700 hover:underline"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`${basePath}/${animal.id}/edit`}
                          className="text-green-700 hover:underline"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setToDelete(animal)}
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
          )}

          {filtered.length > shown.length && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setVisible((current) => current + PAGE_SIZE)}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mostrar más ({formatNumber(filtered.length - shown.length)} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar animal"
          message={`¿Seguro que querés eliminar la caravana "${toDelete.tagNumber}"? También se elimina su historial de movimientos. Si el animal se vendió o murió, conviene cambiar su estado en vez de borrarlo. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isLoading={deleteAnimal.isPending}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}

export default AnimalsPage
