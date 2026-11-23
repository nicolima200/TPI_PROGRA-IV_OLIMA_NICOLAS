from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @field_validator("nombre")
    @classmethod
    def no_nulo(cls, valor: str | None) -> str | None:
        if valor is None:
            raise ValueError("El campo no puede ser nulo")
        return valor


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
