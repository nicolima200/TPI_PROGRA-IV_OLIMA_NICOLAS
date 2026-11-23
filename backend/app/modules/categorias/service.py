from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class CategoriaDuplicada(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.get_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise CategoriaDuplicada("Ya existe una categoría con ese nombre")
            categoria = Categoria.model_validate(datos)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            cambios = datos.model_dump(exclude_unset=True)
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None and nuevo_nombre != categoria.nombre:
                if uow.categorias.get_by_nombre(nuevo_nombre) is not None:
                    raise CategoriaDuplicada("Ya existe una categoría con ese nombre")
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)
