import type {
  DashboardInventoryItem,
  DashboardMachinery,
} from '../../types/dashboard'
import { formatDate, formatNumber } from '../../utils/format'
import { unitLabels } from '../../utils/labels'

interface AlertsCardProps {
  lowStockItems: DashboardInventoryItem[]
  expiringSoonItems: DashboardInventoryItem[]
  machineryDueForMaintenance: DashboardMachinery[]
}

function AlertsCard({
  lowStockItems,
  expiringSoonItems,
  machineryDueForMaintenance,
}: AlertsCardProps) {
  const total =
    lowStockItems.length +
    expiringSoonItems.length +
    machineryDueForMaintenance.length

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">Alertas</h2>

      {total === 0 ? (
        <p className="mt-3 text-sm text-gray-600">
          Sin alertas por ahora. Todo en orden.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {lowStockItems.map((item) => (
            <li
              key={`stock-${item.id}`}
              className="rounded bg-amber-50 px-3 py-2 text-amber-800"
            >
              Stock bajo: {item.name} ({formatNumber(item.stock)}{' '}
              {unitLabels[item.unit] ?? item.unit})
            </li>
          ))}

          {expiringSoonItems.map((item) => (
            <li
              key={`exp-${item.id}`}
              className="rounded bg-red-50 px-3 py-2 text-red-700"
            >
              Vence pronto: {item.name}
              {item.expirationDate ? ` el ${formatDate(item.expirationDate)}` : ''}
            </li>
          ))}

          {machineryDueForMaintenance.map((machine) => (
            <li
              key={`maint-${machine.id}`}
              className="rounded bg-blue-50 px-3 py-2 text-blue-800"
            >
              Mantenimiento próximo: {machine.name}
              {machine.nextMaintenanceDate
                ? ` (${formatDate(machine.nextMaintenanceDate)})`
                : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AlertsCard
