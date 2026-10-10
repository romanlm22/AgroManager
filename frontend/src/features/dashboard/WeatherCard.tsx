import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Weather } from '../../types/dashboard'
import { formatShortDay } from '../../utils/format'

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function WeatherCard({ weather }: { weather: Weather | null }) {
  if (!weather) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Clima</h2>
        <p className="mt-3 text-sm text-gray-600">
          No hay datos de clima. Cargá las coordenadas del establecimiento o
          intentá de nuevo más tarde.
        </p>
      </section>
    )
  }

  const data = weather.forecast.map((day) => ({
    day: formatShortDay(day.date),
    min: day.tempMinC,
    max: day.tempMaxC,
    rain: day.precipitationSumMm,
  }))

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">Clima</h2>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Metric label="Temperatura" value={`${weather.current.temperatureC} °C`} />
        <Metric label="Humedad" value={`${weather.current.humidityPercent} %`} />
        <Metric label="Lluvia ahora" value={`${weather.current.precipitationMm} mm`} />
        <Metric label="Viento" value={`${weather.current.windSpeedKmh} km/h`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Temperatura, próximos 7 días
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis unit="°" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="max" name="Máxima" stroke="#dc2626" />
              <Line type="monotone" dataKey="min" name="Mínima" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Lluvia prevista, próximos 7 días
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rain" name="Lluvia (mm)" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

export default WeatherCard