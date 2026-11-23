from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_activa_by_id(self, id: int) -> Categoria | None:
        categoria = self.get_by_id(id)
        if categoria is None or not categoria.activo:
            return None
        return categoria

    def get_activas(self) -> list[Categoria]:
        return list(self.session.exec(select(Categoria).where(Categoria.activo == True)).all())

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
