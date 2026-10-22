import { api } from './api'

export type ReportType =
  | 'tasks'
  | 'inventory'
  | 'production'
  | 'expenses'
  | 'livestock-stock'
  | 'livestock-health'
  | 'livestock-production'

export interface ReportFile {
  blob: Blob
  filename: string
}

function filenameFromHeader(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const match = /filename="?([^";]+)"?/i.exec(header)
  return match ? match[1] : fallback
}

export async function downloadReport(
  farmId: string,
  type: ReportType,
  startDate?: string,
  endDate?: string,
): Promise<ReportFile> {
  const response = await api.get<Blob>(`/api/farms/${farmId}/reports/${type}/pdf`, {
    responseType: 'blob',
    params: {
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
  })

  return {
    blob: response.data,
    filename: filenameFromHeader(
      response.headers['content-disposition'] as string | undefined,
      `reporte-${type}.pdf`,
    ),
  }
}

export function saveFile({ blob, filename }: ReportFile): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
