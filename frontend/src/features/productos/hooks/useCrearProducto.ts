import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearProducto } from '../api/productos'

export function useCrearProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearProducto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })
}
