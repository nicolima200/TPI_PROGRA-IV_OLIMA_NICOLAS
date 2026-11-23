from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(access_token: str | None = Cookie(default=None)) -> UserPublic:
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
    )
    if access_token is None:
        raise no_autenticado
    username = decode_access_token(access_token)
    if username is None:
        raise no_autenticado
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise no_autenticado
        return UserPublic.model_validate(usuario)


def get_current_active_user(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    def verificar_rol(current_user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción",
            )
        return current_user

    return verificar_rol
