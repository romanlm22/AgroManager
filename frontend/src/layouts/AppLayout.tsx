import { Link, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link to="/farms" className="text-lg font-bold text-green-800">
          AgroManager
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-700">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout