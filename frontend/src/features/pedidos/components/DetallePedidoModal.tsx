import { useState } from 'react'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { formatearFecha } from '../../../shared/utils/formatearFecha'
import { Modal } from '../../../shared/ui/Modal'
import { Button } from '../../../shared/ui/Button'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import type { FormaPago, Pedido } from '../types/pedido'

const ETIQUETAS_FORMA_PAGO: Record<FormaPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
}

interface DetallePedidoModalProps {
  pedido: Pedido | null
  onCerrar: () => void
  permitirCancelar?: boolean
}

export function DetallePedidoModal({ pedido, onCerrar, permitirCancelar = true }: DetallePedidoModalProps) {
  const cancelar = useCancelarPedido()
  const [confirmando, setConfirmando] = useState(false)

  const cerrar = () => {
    setConfirmando(false)
    cancelar.reset()
    onCerrar()
  }

  if (!pedido) return null

  return (
    <Modal abierto titulo={`Pedido #${pedido.id}`} onCerrar={cerrar}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatearFecha(pedido.created_at)}</span>
          <BadgeEstado estado={pedido.estado} />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 font-medium">Producto</th>
              <th className="py-2 text-right font-medium">Precio</th>
              <th className="py-2 text-right font-medium">Cant.</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((linea) => (
              <tr key={linea.producto_id} className="border-b border-gray-100">
                <td className="py-2">{linea.nombre_producto}</td>
                <td className="py-2 text-right">{formatearPrecio(linea.precio_unitario)}</td>
                <td className="py-2 text-right">{linea.cantidad}</td>
                <td className="py-2 text-right">{formatearPrecio(linea.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={3} className="pt-3">
                Total
              </td>
              <td className="pt-3 text-right">{formatearPrecio(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="font-medium text-gray-500">Dirección</dt>
          <dd>{pedido.direccion_entrega}</dd>
          <dt className="font-medium text-gray-500">Forma de pago</dt>
          <dd>{ETIQUETAS_FORMA_PAGO[pedido.forma_pago]}</dd>
          {pedido.notas && (
            <>
              <dt className="font-medium text-gray-500">Notas</dt>
              <dd>{pedido.notas}</dd>
            </>
          )}
        </dl>

        {cancelar.isError && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {handleApiError(cancelar.error)}
          </p>
        )}

        {permitirCancelar && pedido.estado === 'PENDIENTE' && (
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            {confirmando ? (
              <>
                <span className="mr-auto self-center text-sm text-gray-700">¿Cancelar este pedido?</span>
                <Button variante="secondary" onClick={() => setConfirmando(false)}>
                  No
                </Button>
                <Button
                  variante="danger"
                  loading={cancelar.isPending}
                  onClick={() => cancelar.mutate(pedido.id, { onSuccess: () => setConfirmando(false) })}
                >
                  Sí, cancelar
                </Button>
              </>
            ) : (
              <Button variante="danger" onClick={() => setConfirmando(true)}>
                Cancelar pedido
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
