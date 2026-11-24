import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario } from '../api/usuarios'

interface VariablesActivacion {
  id: number
  activar: boolean
}

export function useCambiarActivacionUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: VariablesActivacion) => (activar ? activarUsuario(id) : desactivarUsuario(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}
