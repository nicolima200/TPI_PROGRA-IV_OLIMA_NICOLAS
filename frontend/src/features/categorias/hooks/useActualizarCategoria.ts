import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarCategoria } from '../api/categorias'
import type { CategoriaUpdate } from '../types/categoria'

interface VariablesActualizar {
  id: number
  datos: CategoriaUpdate
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: VariablesActualizar) => actualizarCategoria(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
