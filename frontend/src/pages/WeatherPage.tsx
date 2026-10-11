import { isAxiosError } from 'axios'
import { useParams } from 'react-router'
import WeatherCard from '../features/dashboard/WeatherCard'
import { useWeather } from '../hooks/useWeather'
import { formatShortDay } from '../utils/format'

function WeatherPage() {
  const { farmId = '' } = useParams()
  const { data, isPending, isError, error, refetch, isFetching } = useWeather(farmId)

  const status = isAxiosError(error) ? error.response?.status : undefined

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Clima</h1>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60"
        >
          {isFetching ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {isPending && <p className="mt-6 text-gray-600">Cargando clima...</p>}

      {isError && (
        <div role="alert" className="mt-6 rounded bg-amber-50 p-4 text-amber-900">
          {status === 400 ? (
            <p>
              Este establecimiento no tiene coordenadas cargadas, así que no se puede
              consultar el clima. Cargá latitud y longitud al crear el establecimiento.
            </p>
          ) : status === 503 ? (
            <p>
              El servicio de clima no está disponible en este momento. Probá de nuevo en
              unos minutos.
            </p>
          ) : (
            <p>No se pudo cargar el clima.</p>
          )}
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          <p className="text-sm text-gray-600">
            Ubicación: {data.latitude}, {data.longitude}. Datos de Open-Meteo, consultados
            en vivo.
          </p>

          <WeatherCard weather={data} />

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <h2 className="px-5 pt-5 font-semibold text-gray-900">Pronóstico detallado</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Día</th>
                    <th className="px-5 py-3 font-medium">Mínima</th>
                    <th className="px-5 py-3 font-medium">Máxima</th>
                    <th className="px-5 py-3 font-medium">Lluvia</th>
                    <th className="px-5 py-3 font-medium">Prob. de lluvia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.forecast.map((day) => (
                    <tr key={day.date}>
                      <td className="px-5 py-3 font-medium capitalize text-gray-900">
                        {formatShortDay(day.date)}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{day.tempMinC} °C</td>
                      <td className="px-5 py-3 text-gray-700">{day.tempMaxC} °C</td>
                      <td className="px-5 py-3 text-gray-700">
                        {day.precipitationSumMm} mm
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {day.precipitationProbabilityPercent} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default WeatherPage
