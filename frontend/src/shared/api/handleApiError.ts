import { isAxiosError } from 'axios'

type DetalleValidacion = { msg: string }
type ErrorFastAPI = { detail?: string | DetalleValidacion[] }

export function handleApiError(error: unknown): string {
  if (isAxiosError<ErrorFastAPI>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => d.msg).join('. ')
    }
    return 'Error inesperado'
  }
  if (error instanceof Error) return error.message
  return 'Error inesperado'
}
