import type { EstadoPedido } from '../types/pedido'

export const OPCIONES_ESTADO: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
  { valor: 'EN_PREPARACION', etiqueta: 'En preparación' },
  { valor: 'ENTREGADO', etiqueta: 'Entregados' },
  { valor: 'CANCELADO', etiqueta: 'Cancelados' },
]

export function esEstadoPedido(valor: string): valor is EstadoPedido {
  return OPCIONES_ESTADO.some((o) => o.valor === valor)
}

type EstadoDestino = Exclude<EstadoPedido, 'PENDIENTE'>

export const TRANSICIONES: Record<EstadoPedido, EstadoDestino[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export const ACCIONES_TRANSICION: Record<EstadoDestino, { etiqueta: string; variante: 'primary' | 'danger' }> = {
  EN_PREPARACION: { etiqueta: 'Preparar', variante: 'primary' },
  ENTREGADO: { etiqueta: 'Entregar', variante: 'primary' },
  CANCELADO: { etiqueta: 'Cancelar', variante: 'danger' },
}
