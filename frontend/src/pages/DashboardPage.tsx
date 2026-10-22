import { useParams } from 'react-router'
import AlertsCard from '../features/dashboard/AlertsCard'
import StatCard from '../features/dashboard/StatCard'
import LivestockSection from '../features/dashboard/LivestockSection'
import UpcomingTasksCard from '../features/dashboard/UpcomingTasksCard'
import WeatherCard from '../features/dashboard/WeatherCard'
import { useDashboard } from '../hooks/useDashboard'
import { formatCurrency, formatNumber } from '../utils/format'

function DashboardPage() {
  const { farmId } = useParams()
  const { data, isPending, isError, refetch } = useDashboard(farmId)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {isPending && <p className="mt-6 text-gray-600">Cargando dashboard...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">
          <p>No se pudo cargar el dashboard.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Superficie total"
              value={
                data.totalAreaHa !== null
                  ? `${formatNumber(data.totalAreaHa)} ha`
                  : '—'
              }
            />
            <StatCard label="Lotes" value={formatNumber(data.fieldCount)} />
            <StatCard
              label="Cultivos activos"
              value={formatNumber(data.activeCropsCount)}
            />
            <StatCard
              label="Superficie sembrada"
              value={`${formatNumber(data.plantedAreaHa)} ha`}
            />
            <StatCard
              label="Costo de labores"
              value={formatCurrency(data.totalTaskCost)}
            />
            <StatCard
              label="Costo de mantenimientos"
              value={formatCurrency(data.totalMaintenanceCost)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AlertsCard
              lowStockItems={data.lowStockItems}
              expiringSoonItems={data.expiringSoonItems}
              machineryDueForMaintenance={data.machineryDueForMaintenance}
            />
            <UpcomingTasksCard tasks={data.upcomingTasks} />
          </div>

          <LivestockSection livestock={data.livestock} farmId={farmId ?? ''} />

          <WeatherCard weather={data.weather} />
        </div>
      )}
    </div>
  )
}

export default DashboardPage
