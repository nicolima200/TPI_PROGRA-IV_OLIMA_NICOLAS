import { useState } from 'react'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { ACCIONES_TRANSICION, TRANSICIONES } from '../utils/estados'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import type { Pedido } from '../types/pedido'

interface AccionesPedidoProps {
  pedido: Pedido
  onVerDetalle: () => void
}

export function AccionesPedido({ pedido, onVerDetalle }: AccionesPedidoProps) {
  const cambiar = useCambiarEstadoPedido()
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false)

  if (confirmandoCancelacion) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">¿Cancelar?</span>
        <Button variante="secondary" onClick={() => setConfirmandoCancelacion(false)}>
          No
        </Button>
        <Button
          variante="danger"
          loading={cambiar.isPending}
          onClick={() =>
            cambiar.mutate(
              { id: pedido.id, estado: 'CANCELADO' },
              { onSettled: () => setConfirmandoCancelacion(false) },
            )
          }
        >
          Sí
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <Button variante="secondary" onClick={onVerDetalle}>
          Detalle
        </Button>
        {TRANSICIONES[pedido.estado].map((destino) => {
          const accion = ACCIONES_TRANSICION[destino]
          return (
            <Button
              key={destino}
              variante={accion.variante}
              disabled={cambiar.isPending}
              loading={cambiar.isPending && cambiar.variables.estado === destino}
              onClick={() => {
                cambiar.reset()
                if (destino === 'CANCELADO') {
                  setConfirmandoCancelacion(true)
                } else {
                  cambiar.mutate({ id: pedido.id, estado: destino })
                }
              }}
            >
              {accion.etiqueta}
            </Button>
          )
        })}
      </div>
      {cambiar.isError && (
        <p role="alert" className="text-xs text-red-600">
          {handleApiError(cambiar.error)}
        </p>
      )}
    </div>
  )
}
