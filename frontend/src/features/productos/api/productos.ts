import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { FiltrosProductos, Producto, ProductosPaginados } from '../types/producto'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const search = filtros.search?.trim()
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    params: { ...filtros, search: search ? search : undefined },
  })
  return data
}

export async function getProducto(id: number): Promise<Producto> {
  const { data } = await axiosInstance.get<Producto>(`/productos/${id}`)
  return data
}
