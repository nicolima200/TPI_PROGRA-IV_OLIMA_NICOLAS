import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido'

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', datos)
  return data
}

export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', { params: filtros })
  return data
}

export async function getPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`)
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
  return data
}

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')
  return data
}
