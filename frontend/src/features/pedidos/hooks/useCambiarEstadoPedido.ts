import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cambiarEstado } from '../api/pedidos'
import type { EstadoPedido } from '../types/pedido'

interface VariablesCambioEstado {
  id: number
  estado: EstadoPedido
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: VariablesCambioEstado) => cambiarEstado(id, estado),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
