import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarProducto } from '../api/productos'
import type { ProductoUpdate } from '../types/producto'

interface VariablesActualizar {
  id: number
  datos: ProductoUpdate
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: VariablesActualizar) => actualizarProducto(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })
}
