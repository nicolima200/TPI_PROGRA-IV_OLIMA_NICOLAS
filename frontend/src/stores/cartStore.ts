import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio: number
  imagen_url: string | null
  stock: number
  cantidad: number
}

type ProductoParaCarrito = Omit<ItemCarrito, 'cantidad'>

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  quitar: (productoId: number) => void
  vaciar: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      agregar: (producto, cantidad = 1) =>
        set((state) => {
          if (producto.stock < 1) return state
          const existente = state.items.find((i) => i.producto_id === producto.producto_id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, ...producto, cantidad: Math.min(i.cantidad + cantidad, producto.stock) }
                  : i,
              ),
            }
          }
          return {
            items: [...state.items, { ...producto, cantidad: Math.min(cantidad, producto.stock) }],
          }
        }),
      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((i) => i.producto_id !== productoId)
              : state.items.map((i) =>
                  i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i,
                ),
        })),
      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),
      vaciar: () => set({ items: [] }),
    }),
    {
      name: 'food-store-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export const calcularTotal = (items: ItemCarrito[]): number =>
  items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

export const contarUnidades = (items: ItemCarrito[]): number =>
  items.reduce((acc, i) => acc + i.cantidad, 0)
