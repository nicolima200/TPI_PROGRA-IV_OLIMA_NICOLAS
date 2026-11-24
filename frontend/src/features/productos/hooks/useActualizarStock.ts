import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarStock } from '../api/productos'
import type { ProductoStockUpdate } from '../types/producto'

interface VariablesStock {
  id: number
  datos: ProductoStockUpdate
}

export function useActualizarStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: VariablesStock) => actualizarStock(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })
}
