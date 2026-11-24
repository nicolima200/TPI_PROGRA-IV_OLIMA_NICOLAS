import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eliminarCategoria } from '../api/categorias'

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
