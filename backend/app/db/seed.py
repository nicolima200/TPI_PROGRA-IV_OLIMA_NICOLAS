import app.db.models
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ProductoSeed = tuple[str, str, float, int]

CATALOGO: dict[str, tuple[str, list[ProductoSeed]]] = {
    "Pizzas": (
        "Pizzas a la piedra",
        [
            ("Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500.0, 20),
            ("Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 9500.0, 15),
            ("Fugazzeta", "Cebolla, muzzarella y orégano", 9000.0, 12),
        ],
    ),
    "Hamburguesas": (
        "Hamburguesas caseras con papas",
        [
            ("Hamburguesa clásica", "Carne, lechuga, tomate y queso", 7800.0, 25),
            ("Hamburguesa doble cheddar", "Doble carne, cheddar y panceta", 10500.0, 18),
            ("Hamburguesa veggie", "Medallón de lentejas, rúcula y tomate", 8200.0, 10),
        ],
    ),
    "Empanadas": (
        "Empanadas al horno, por unidad",
        [
            ("Empanada de carne", "Carne cortada a cuchillo", 1500.0, 60),
            ("Empanada de jamón y queso", "Jamón cocido y muzzarella", 1400.0, 50),
            ("Empanada de humita", "Choclo cremoso", 1400.0, 40),
        ],
    ),
    "Bebidas": (
        "Bebidas frías",
        [
            ("Agua mineral 500 ml", "Sin gas", 1200.0, 48),
            ("Gaseosa cola 1,5 L", "Línea regular", 3200.0, 30),
            ("Cerveza rubia 1 L", "Retornable", 4500.0, 24),
        ],
    ),
}


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


def seed_catalogo() -> None:
    categorias_creadas = 0
    productos_creados = 0
    with ProductoUnitOfWork() as uow:
        for nombre_categoria, (descripcion_categoria, productos) in CATALOGO.items():
            categoria = uow.categorias.get_by_nombre(nombre_categoria)
            if categoria is None:
                categoria = uow.categorias.add(
                    Categoria(nombre=nombre_categoria, descripcion=descripcion_categoria)
                )
                categorias_creadas += 1

            for nombre, descripcion, precio, stock in productos:
                if uow.productos.get_by_nombre(nombre, categoria.id) is not None:
                    continue
                uow.productos.add(
                    Producto(
                        categoria_id=categoria.id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                    )
                )
                productos_creados += 1

    print(f"Catálogo: {categorias_creadas} categorías y {productos_creados} productos creados")


def main() -> None:
    create_all_tables()
    seed_admin()
    seed_catalogo()


if __name__ == "__main__":
    main()
