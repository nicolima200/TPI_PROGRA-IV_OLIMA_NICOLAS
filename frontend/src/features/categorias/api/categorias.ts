import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Categoria } from '../types/categoria'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}
