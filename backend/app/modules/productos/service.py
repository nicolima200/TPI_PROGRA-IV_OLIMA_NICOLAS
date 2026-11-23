from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.listar_activos(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in productos],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            if uow.categorias.get_activa_by_id(datos.categoria_id) is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            producto = Producto.model_validate(datos)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            cambios = datos.model_dump(exclude_unset=True)
            nueva_categoria_id = cambios.get("categoria_id")
            if nueva_categoria_id is not None:
                if uow.categorias.get_activa_by_id(nueva_categoria_id) is None:
                    raise CategoriaNoEncontrada("Categoría no encontrada")
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.stock = datos.stock
            producto.disponible = datos.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.productos.add(producto)
