import { useQuery } from '@tanstack/react-query'
import { getCategorias } from '../api/categorias'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })
}
