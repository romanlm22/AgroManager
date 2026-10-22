import { useParams } from 'react-router'
import ReportCard from '../features/report/ReportCard'

function ReportsPage() {
  const { farmId = '' } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
      <p className="mt-1 text-sm text-gray-600">
        Se generan al momento con los datos actuales del establecimiento.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ReportCard
          farmId={farmId}
          type="tasks"
          title="Labores"
          description="Listado de labores del establecimiento, con el costo total."
          withDateRange
        />
        <ReportCard
          farmId={farmId}
          type="inventory"
          title="Inventario"
          description="Estado actual del inventario de insumos."
          withDateRange={false}
        />
        <ReportCard
          farmId={farmId}
          type="production"
          title="Producción"
          description="Resumen de la producción de cultivos."
          withDateRange
        />
        <ReportCard
          farmId={farmId}
          type="expenses"
          title="Gastos"
          description="Resumen de gastos del establecimiento."
          withDateRange
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-gray-900">Ganadería</h2>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <ReportCard
          farmId={farmId}
          type="livestock-stock"
          title="Stock ganadero"
          description="Cabezas por categoría, rodeos y animales activos con su ubicación."
          withDateRange={false}
        />
        <ReportCard
          farmId={farmId}
          type="livestock-health"
          title="Sanidad"
          description="Vacunaciones, desparasitaciones y tratamientos, con su costo."
          withDateRange
        />
        <ReportCard
          farmId={farmId}
          type="livestock-production"
          title="Producción ganadera"
          description="Leche, carne, lana y otros productos, con totales e ingresos."
          withDateRange
        />
      </div>
    </div>
  )
}

export default ReportsPage
