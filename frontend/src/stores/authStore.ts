import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../types/usuario'

interface AuthState {
  user: Usuario | null
  setUser: (user: Usuario) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
