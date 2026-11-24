import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eliminarProducto } from '../api/productos'

export function useEliminarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })
}
