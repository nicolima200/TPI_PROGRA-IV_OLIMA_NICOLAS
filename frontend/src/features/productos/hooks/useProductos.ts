import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProducto, getProductos } from '../api/productos'
import type { FiltrosProductos } from '../types/producto'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => getProducto(id),
  })
}
