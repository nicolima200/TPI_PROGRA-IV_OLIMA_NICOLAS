from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username) is not None:
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(datos.email) is not None:
                raise UsuarioDuplicado("El email ya está registrado")
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=datos.email,
                hashed_password=hash_password(datos.password),
                role="user",
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas("Usuario o contraseña incorrectos")
            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")
            return create_access_token(usuario.username)
