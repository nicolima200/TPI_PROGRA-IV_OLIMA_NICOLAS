from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import AuthService, CredencialesInvalidas, CuentaDesactivada
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(datos: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:
    try:
        return service.registrar(datos)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/token", response_model=Mensaje)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> Mensaje:
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except CuentaDesactivada as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
        path="/",
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response) -> Mensaje:
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", secure=False, path="/")
    return Mensaje(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def me(current_user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
    return current_user
