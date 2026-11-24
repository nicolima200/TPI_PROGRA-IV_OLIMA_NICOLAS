import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePedidos } from '../hooks/usePedidos'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { formatearFecha } from '../../../shared/utils/formatearFecha'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { OPCIONES_ESTADO, esEstadoPedido } from '../utils/estados'
import type { EstadoPedido } from '../types/pedido'

const LIMIT = 10

export function MisPedidosPage() {
  const location = useLocation()
  const pedidoCreado = (location.state as { pedidoCreado?: number } | null)?.pedidoCreado
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePedidos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    estado,
  })

  const seleccionado = data?.items.find((p) => p.id === seleccionadoId) ?? null

  const cambiarEstado = (valor: string) => {
    setEstado(esEstadoPedido(valor) ? valor : undefined)
    setPagina(0)
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Mis pedidos</h1>
        <select
          aria-label="Filtrar por estado"
          value={estado ?? ''}
          onChange={(e) => cambiarEstado(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Todos los estados</option>
          {OPCIONES_ESTADO.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {pedidoCreado !== undefined && (
        <p role="status" className="rounded bg-green-50 px-4 py-3 text-green-700">
          ¡Listo! Tu pedido #{pedidoCreado} fue registrado.
        </p>
      )}

      {isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje={estado ? 'No tenés pedidos en este estado.' : 'Todavía no hiciste ningún pedido.'}>
          {!estado && (
            <Link to="/" className="font-medium text-orange-600 hover:underline">
              Ver el catálogo
            </Link>
          )}
        </EstadoVacio>
      ) : (
        <>
          <ul className={`flex flex-col gap-3 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
            {data.items.map((pedido) => (
              <li
                key={pedido.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Pedido #{pedido.id}</p>
                  <p className="text-sm text-gray-500">
                    {formatearFecha(pedido.created_at)} · {pedido.items.length}{' '}
                    {pedido.items.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <BadgeEstado estado={pedido.estado} />
                <span className="w-32 font-bold sm:text-right">{formatearPrecio(pedido.total)}</span>
                <Button variante="secondary" onClick={() => setSeleccionadoId(pedido.id)}>
                  Ver detalle
                </Button>
              </li>
            ))}
          </ul>
          {data.total > LIMIT && (
            <Paginacion
              pagina={pagina}
              total={data.total}
              limit={LIMIT}
              onCambiar={setPagina}
              deshabilitada={isPlaceholderData}
            />
          )}
        </>
      )}

      <DetallePedidoModal pedido={seleccionado} onCerrar={() => setSeleccionadoId(null)} />
    </section>
  )
}
