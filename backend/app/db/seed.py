import app.db.models
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def seed_admin() -> None:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username("admin") is not None:
            print("Admin ya existe, se omite")
            return
        uow.usuarios.add(
            Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
            )
        )
        print("Admin creado")


def main() -> None:
    create_all_tables()
    seed_admin()


if __name__ == "__main__":
    main()
