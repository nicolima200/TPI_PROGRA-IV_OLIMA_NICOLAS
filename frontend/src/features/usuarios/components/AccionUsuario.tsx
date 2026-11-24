import { useCambiarActivacionUsuario } from '../hooks/useCambiarActivacionUsuario'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import type { Usuario } from '../types/usuario'

interface AccionUsuarioProps {
  usuario: Usuario
  esUsuarioActual: boolean
}

export function AccionUsuario({ usuario, esUsuarioActual }: AccionUsuarioProps) {
  const cambiar = useCambiarActivacionUsuario()

  if (esUsuarioActual) {
    return <span className="text-sm text-gray-400">Tu cuenta</span>
  }

  return (
    <div className="flex flex-col gap-1">
      {usuario.disabled ? (
        <Button
          variante="primary"
          loading={cambiar.isPending}
          onClick={() => cambiar.mutate({ id: usuario.id, activar: true })}
        >
          Activar
        </Button>
      ) : (
        <Button
          variante="danger"
          loading={cambiar.isPending}
          onClick={() => cambiar.mutate({ id: usuario.id, activar: false })}
        >
          Desactivar
        </Button>
      )}
      {cambiar.isError && (
        <p role="alert" className="text-xs text-red-600">
          {handleApiError(cambiar.error)}
        </p>
      )}
    </div>
  )
}
