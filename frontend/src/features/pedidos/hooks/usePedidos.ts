import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getPedidos } from '../api/pedidos'
import type { FiltrosPedidos } from '../types/pedido'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}
