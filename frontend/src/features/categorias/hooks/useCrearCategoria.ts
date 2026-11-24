import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearCategoria } from '../api/categorias'

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
