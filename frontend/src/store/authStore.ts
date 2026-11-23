import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { axiosInstance, registrarSesionInvalida } from '../shared/api/axiosInstance'
import type { Usuario } from '../features/usuarios/types/usuario'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await axiosInstance.post('/auth/token', new URLSearchParams({ username, password }))
        const { data } = await axiosInstance.get<Usuario>('/auth/me')
        set({ usuario: data })
      },
      logout: async () => {
        await axiosInstance.post('/auth/logout').catch(() => undefined)
        set({ usuario: null })
      },
      checkSession: async () => {
        set({ cargando: true })
        try {
          const { data } = await axiosInstance.get<Usuario>('/auth/me')
          set({ usuario: data })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },
      limpiar: () => set({ usuario: null }),
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

registrarSesionInvalida(() => useAuthStore.getState().limpiar())
