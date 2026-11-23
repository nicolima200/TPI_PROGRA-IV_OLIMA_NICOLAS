import axios, { type AxiosError } from 'axios'

const MENSAJE_CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'
const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']

let alInvalidarSesion: () => void = () => {}

export function registrarSesionInvalida(fn: () => void): void {
  alInvalidarSesion = fn
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail
    const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.includes(url)
    const cuentaDesactivada = status === 400 && detail === MENSAJE_CUENTA_DESACTIVADA
    if (sesionVencida || cuentaDesactivada) {
      alInvalidarSesion()
    }
    return Promise.reject(error)
  },
)
