import { NavLink, Outlet } from 'react-router'

const tabs = [
  { to: 'herds', label: 'Rodeos' },
  { to: 'animals', label: 'Animales' },
  { to: 'health', label: 'Sanidad' },
  { to: 'reproduction', label: 'Reproducción' },
  { to: 'productions', label: 'Producción' },
]

function LivestockLayout() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ganadería</h1>

      <nav className="mt-4 flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
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
        ))}
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}

export default LivestockLayout
