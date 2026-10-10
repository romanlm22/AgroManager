import { Link } from 'react-router'
import FarmCard from '../features/farm/FarmCard'
import { useFarms } from '../hooks/useFarms'

function FarmsPage() {
  const { data: farms, isPending, isError, refetch } = useFarms()

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Mis establecimientos</h1>
        <Link
          to="/farms/new"
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Nuevo establecimiento
        </Link>
      </div>

      {isPending && (
        <p className="mt-6 text-gray-600">Cargando establecimientos...</p>
      )}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudieron cargar los establecimientos.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {farms && farms.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Todavía no tenés establecimientos. Creá el primero con el botón de arriba.
        </div>
      )}

      {farms && farms.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <li key={farm.id}>
              <FarmCard farm={farm} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FarmsPage