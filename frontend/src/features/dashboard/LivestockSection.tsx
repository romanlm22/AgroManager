import { Link } from 'react-router'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LivestockSummary } from '../../types/dashboard'
import {
  formatCurrency,
  formatDate,
  formatMonth,
  formatNumber,
} from '../../utils/format'
import {
  livestockCategoryLabels,
  productTypeLabels,
  productionUnitLabels,
} from '../../utils/labels'
import StatCard from './StatCard'

interface LivestockSectionProps {
  livestock: LivestockSummary
  farmId: string
}

function birthText(daysToDue: number): string {
  if (daysToDue < 0) return `vencido hace ${Math.abs(daysToDue)} días`
  if (daysToDue === 0) return 'hoy'
  return `en ${daysToDue} días`
}

function LivestockSection({ livestock, farmId }: LivestockSectionProps) {
  const hasLivestock = livestock.totalHeadCount > 0 || livestock.herdCount > 0

  if (!hasLivestock) {
    return null
  }

  const categoryData = livestock.headByCategory.map((item) => ({
    category: livestockCategoryLabels[item.category] ?? item.category,
    headCount: item.headCount,
  }))

  const incomeData = livestock.monthlyIncome.map((item) => ({
    month: formatMonth(item.month),
    income: item.income,
  }))

  const hasIncome = livestock.monthlyIncome.some((item) => item.income > 0)
  const alertCount = livestock.dueDosesTotal + livestock.dueBirthsTotal

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Ganadería</h2>
        <Link
          to={`/farms/${farmId}/livestock/herds`}
          className="text-sm text-green-700 underline"
        >
          Ver hacienda
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cabezas" value={formatNumber(livestock.totalHeadCount)} />
        <StatCard label="Hembras preñadas" value={formatNumber(livestock.pregnantCount)} />
        <StatCard
          label="GDP promedio"
          value={
            livestock.averageDailyGainKg !== null
              ? `${formatNumber(livestock.averageDailyGainKg)} kg/día`
              : '—'
          }
        />
        <StatCard
          label="Ingresos del mes"
          value={formatCurrency(livestock.currentMonthIncome)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Alertas de hacienda</h3>

          {alertCount === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              Sin dosis ni partos próximos. Todo en orden.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {livestock.dueDoses.map((dose) => (
                <li
                  key={`dose-${dose.eventId}`}
                  className={
                    dose.overdue
                      ? 'rounded bg-red-50 px-3 py-2 text-red-700'
                      : 'rounded bg-amber-50 px-3 py-2 text-amber-800'
                  }
                >
                  {dose.overdue ? 'Dosis vencida' : 'Dosis próxima'}: {dose.product} (
                  {dose.herdTarget ? 'rodeo' : 'caravana'} {dose.targetName}) —{' '}
                  {formatDate(dose.nextDoseDate)}
                </li>
              ))}

              {livestock.dueBirths.map((birth) => (
                <li
                  key={`birth-${birth.animalId}`}
                  className="rounded bg-blue-50 px-3 py-2 text-blue-800"
                >
                  Parto estimado: caravana {birth.tagNumber} —{' '}
                  {formatDate(birth.estimatedDueDate)} ({birthText(birth.daysToDue)})
                </li>
              ))}
            </ul>
          )}

          {livestock.dueDosesTotal > livestock.dueDoses.length && (
            <p className="mt-3 text-xs text-gray-500">
              Hay {livestock.dueDosesTotal - livestock.dueDoses.length} dosis más en{' '}
              <Link to={`/farms/${farmId}/livestock/health`} className="underline">
                Sanidad
              </Link>
              .
            </p>
          )}
          {livestock.dueBirthsTotal > livestock.dueBirths.length && (
            <p className="mt-1 text-xs text-gray-500">
              Hay {livestock.dueBirthsTotal - livestock.dueBirths.length} partos más en{' '}
              <Link to={`/farms/${farmId}/livestock/reproduction`} className="underline">
                Reproducción
              </Link>
              .
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Cabezas por categoría</h3>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="headCount" name="Cabezas" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Producción del mes</h3>

          {livestock.currentMonthProduction.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              Todavía no hay producción registrada este mes.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {livestock.currentMonthProduction.map((total) => (
                <li
                  key={`${total.productType}-${total.unit}`}
                  className="flex justify-between rounded bg-gray-50 px-3 py-2"
                >
                  <span>{productTypeLabels[total.productType] ?? total.productType}</span>
                  <span className="font-medium">
                    {formatNumber(total.quantity)}{' '}
                    {productionUnitLabels[total.unit] ?? total.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-sm text-gray-600">
            Costo sanitario acumulado:{' '}
            <span className="font-medium text-gray-900">
              {formatCurrency(livestock.totalHealthCost)}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Los costos y los ingresos de ganadería se muestran aparte de los costos agrícolas.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Ingresos por producción, últimos meses</h3>

          {hasIncome ? (
            <div className="mt-3">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="income" name="Ingresos" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">
              Cargá producción con precio para ver los ingresos mensuales.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default LivestockSection
