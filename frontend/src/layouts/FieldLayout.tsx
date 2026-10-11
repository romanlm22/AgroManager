import { Link, NavLink, Outlet, useParams } from 'react-router'
import { useField } from '../hooks/useField'
import { formatNumber } from '../utils/format'

const tabs = [
  { to: 'crops', label: 'Cultivos', ready: true },
  { to: 'tasks', label: 'Labores', ready: true },
]

function FieldLayout() {
  const { farmId = '', fieldId = '' } = useParams()
  const { data: field, isPending, isError } = useField(farmId, fieldId)

  return (
    <div>
      <Link
        to={`/farms/${farmId}/fields`}
        className="text-sm text-gray-500 hover:text-green-700"
      >
        ← Lotes
      </Link>

      {isPending && <p className="mt-2 text-gray-600">Cargando lote...</p>}

      {isError && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
          No se encontró el lote.
        </p>
      )}

      {field && (
        <>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{field.name}</h1>
          <p className="text-sm text-gray-600">
            {field.areaHa !== null ? `${formatNumber(field.areaHa)} ha` : 'Sin superficie'}
            {field.soilType ? ` · ${field.soilType}` : ''}
          </p>

          <nav className="mt-4 flex gap-1 border-b border-gray-200">
            {tabs.map((tab) =>
              tab.ready ? (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                      isActive
                        ? 'border-green-700 text-green-800'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ) : (
                <span
                  key={tab.to}
                  title="Próximamente"
                  className="-mb-px border-b-2 border-transparent px-4 py-2 text-sm text-gray-400"
                >
                  {tab.label}
                </span>
              ),
            )}
          </nav>

          <div className="mt-6">
            <Outlet />
          </div>
        </>
      )}
    </div>
  )
}

export default FieldLayout
