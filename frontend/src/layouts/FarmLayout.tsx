import { Link, NavLink, Outlet, useParams } from 'react-router'
import { useFarm } from '../hooks/useFarm'

const sections = [
  { to: 'dashboard', label: 'Dashboard', ready: true },
  { to: 'fields', label: 'Lotes', ready: true  },
  { to: 'inventory', label: 'Inventario', ready: false },
  { to: 'machinery', label: 'Maquinaria', ready: false },
  { to: 'weather', label: 'Clima', ready: false },
  { to: 'reports', label: 'Reportes', ready: false },
]

function FarmLayout() {
  const { farmId } = useParams()
  const { data: farm, isPending } = useFarm(farmId)

  return (
    <div className="flex w-full flex-col md:flex-row">
      <aside className="border-b border-gray-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="p-4">
          <Link to="/farms" className="text-xs text-gray-500 hover:text-green-700">
            ← Mis establecimientos
          </Link>
          <p className="mt-2 truncate font-semibold text-gray-900">
            {isPending ? 'Cargando...' : (farm?.name ?? 'Establecimiento')}
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-4">
          {sections.map((section) =>
            section.ready ? (
              <NavLink
                key={section.to}
                to={section.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {section.label}
              </NavLink>
            ) : (
              <span
                key={section.to}
                title="Próximamente"
                className="whitespace-nowrap rounded px-3 py-2 text-sm text-gray-400"
              >
                {section.label}
              </span>
            ),
          )}
        </nav>
      </aside>

      <section className="flex-1 p-6">
        <Outlet />
      </section>
    </div>
  )
}

export default FarmLayout