import type { EstadoPedido } from '../../features/pedidos/types/pedido'

const estilos: Record<EstadoPedido, { texto: string; clases: string }> = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-yellow-100 text-yellow-800' },
  EN_PREPARACION: { texto: 'En preparación', clases: 'bg-blue-100 text-blue-800' },
  ENTREGADO: { texto: 'Entregado', clases: 'bg-green-100 text-green-800' },
  CANCELADO: { texto: 'Cancelado', clases: 'bg-red-100 text-red-800' },
}

interface BadgeEstadoProps {
  estado: EstadoPedido
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const { texto, clases } = estilos[estado]
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${clases}`}>{texto}</span>
}
