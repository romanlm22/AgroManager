import { useState } from 'react'
import { isAxiosError } from 'axios'
import { downloadReport, saveFile, type ReportType } from '../../services/reportService'
import { inputClassName } from '../../components/formStyles'

interface ReportCardProps {
  farmId: string
  type: ReportType
  title: string
  description: string
  withDateRange: boolean
}

function ReportCard({ farmId, type, title, description, withDateRange }: ReportCardProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setError(null)

    if (withDateRange && startDate && endDate && startDate > endDate) {
      setError('La fecha "desde" no puede ser posterior a la fecha "hasta".')
      return
    }

    setIsLoading(true)

    try {
      const file = await downloadReport(
        farmId,
        type,
        withDateRange ? startDate : undefined,
        withDateRange ? endDate : undefined,
      )
      saveFile(file)
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      setError(
        status === 403
          ? 'No tenés acceso a este establecimiento.'
          : 'No se pudo generar el reporte. Intentá de nuevo.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>

      {withDateRange && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${type}-start`} className="block text-xs text-gray-500">
              Desde (opcional)
            </label>
            <input
              id={`${type}-start`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={`${inputClassName} mt-1`}
            />
          </div>
          <div>
            <label htmlFor={`${type}-end`} className="block text-xs text-gray-500">
              Hasta (opcional)
            </label>
            <input
              id={`${type}-end`}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={`${inputClassName} mt-1`}
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isLoading}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {isLoading ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>
    </section>
  )
}

export default ReportCard
