from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoNoCancelable(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse en el pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=PENDIENTE,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_activo_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"disponible {producto.stock}, solicitado {item.cantidad}"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        skip: int,
        limit: int,
        estado: str | None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if es_admin else usuario_id
            total, pedidos = uow.pedidos.list_by_usuario(filtro_usuario, skip, limit, estado)
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_pedido(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, datos: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_pedido(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, datos.estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_pedido(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise PedidoNoCancelable("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_hoy = (
                datetime.now()
                .astimezone()
                .replace(hour=0, minute=0, second=0, microsecond=0)
                .astimezone(timezone.utc)
            )
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(PENDIENTE),
                en_preparacion=uow.pedidos.count_by_estado(EN_PREPARACION),
                entregados=uow.pedidos.count_by_estado(ENTREGADO),
                cancelados=uow.pedidos.count_by_estado(CANCELADO),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(ENTREGADO),
            )

    def _obtener_pedido(self, uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    def _aplicar_transicion(self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        if nuevo_estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")

        if nuevo_estado == CANCELADO:
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto is not None:
                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)

        pedido.estado = nuevo_estado
        uow.pedidos.add(pedido)
