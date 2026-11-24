import { useQuery } from '@tanstack/react-query'
import { getResumen } from '../api/pedidos'

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: getResumen,
  })
}
