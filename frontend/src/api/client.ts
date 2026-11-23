import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '../stores/authStore'

type DetalleValidacion = { loc: (string | number)[]; msg: string }
type ErrorFastAPI = { detail?: string | DetalleValidacion[] }

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function extraerMensaje(error: AxiosError<ErrorFastAPI>): string {
  if (!error.response) return 'No se pudo conectar con el servidor'
  const detail = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join('. ')
  }
  return 'Error inesperado'
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorFastAPI>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser()
    }
    return Promise.reject(new ApiError(error.response?.status ?? 0, extraerMensaje(error)))
  },
)
