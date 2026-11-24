import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { usePedidos } from '../hooks/usePedidos'
import { AccionesPedido } from '../components/AccionesPedido'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { OPCIONES_ESTADO, esEstadoPedido } from '../utils/estados'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { formatearFecha } from '../../../shared/utils/formatearFecha'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { useTablaPaginada } from '../../../shared/hooks/useTablaPaginada'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import type { EstadoPedido, Pedido } from '../types/pedido'

const LIMIT = 100
const SIN_PEDIDOS: Pedido[] = []
const columnHelper = createColumnHelper<Pedido>()

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePedidos({ limit: LIMIT, estado })

  const seleccionado = data?.items.find((p) => p.id === seleccionadoId) ?? null

  const columnas = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'N.º', cell: (info) => `#${info.getValue()}` }),
      columnHelper.accessor('usuario_id', { header: 'Usuario', cell: (info) => `Usuario #${info.getValue()}` }),
      columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
      columnHelper.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
      columnHelper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <AccionesPedido pedido={row.original} onVerDetalle={() => setSeleccionadoId(row.original.id)} />
        ),
      }),
    ],
    [],
  )

  const tabla = useTablaPaginada(data?.items ?? SIN_PEDIDOS, columnas)

  const cambiarFiltro = (valor: string) => {
    setEstado(esEstadoPedido(valor) ? valor : undefined)
    tabla.setPageIndex(0)
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          aria-label="Filtrar por estado"
          value={estado ?? ''}
          onChange={(e) => cambiarFiltro(e.target.value)}
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

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje={estado ? 'No hay pedidos con ese estado.' : 'Todavía no hay pedidos.'} />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60' : ''}>
          {data.total > data.items.length && (
            <p className="mb-2 text-sm text-gray-500">
              Se muestran los {data.items.length} pedidos más recientes de {data.total}.
            </p>
          )}
          <TablaDatos tabla={tabla} />
        </div>
      )}

      <DetallePedidoModal pedido={seleccionado} onCerrar={() => setSeleccionadoId(null)} permitirCancelar={false} />
    </section>
  )
}
