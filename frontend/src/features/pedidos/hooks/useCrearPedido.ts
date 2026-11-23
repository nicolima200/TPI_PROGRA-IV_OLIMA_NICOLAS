import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearPedido } from '../api/pedidos'

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
