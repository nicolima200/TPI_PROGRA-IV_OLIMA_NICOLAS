# Food Store — TPI Programación IV

Sistema de pedidos de comida: los clientes navegan el catálogo, arman un carrito y realizan pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

**Alumno:** Nicolás Olima — Tecnicatura Universitaria en Programación a Distancia (UTN)

**Repositorio:** https://github.com/nicolima200/TPI_PROGRA-IV_OLIMA_NICOLAS
**Video de presentación:** _link_al_video_

---

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Python, FastAPI, SQLModel, PostgreSQL (o SQLite en desarrollo), JWT en cookie HttpOnly, bcrypt |
| Frontend | React + TypeScript, Vite, Tailwind CSS, Axios, TanStack Query, TanStack Form, TanStack Table, Zustand, React Router |

Las versiones exactas están fijadas en `backend/requirements.txt` y `frontend/package.json`.

## Requisitos

- **Python 3.11 a 3.13** (SQLModel puede malfuncionar con 3.14)
- **Node.js 20.19 o superior**
- **pnpm 9 o superior** (si no está instalado: `npm install -g pnpm`)
- **PostgreSQL 15 o superior** — opcional: por defecto el proyecto usa SQLite y no requiere instalar ninguna base de datos

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/nicolima200/TPI_PROGRA-IV_OLIMA_NICOLAS.git
cd TPI_PROGRA-IV_OLIMA_NICOLAS
```

### 2. Backend

Desde la carpeta `backend/`:

```bash
cd backend
```

Crear y activar el entorno virtual:

```bash
# Windows (PowerShell)
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3.11 -m venv venv
source venv/bin/activate
```

> Si PowerShell bloquea `Activate.ps1`, ejecutar una vez
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y volver a activar.

Instalar dependencias, configurar el entorno y cargar los datos iniciales:

```bash
pip install -r requirements.txt

# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env

python -m app.db.seed
```

El seed crea las tablas, el usuario administrador, categorías y productos con stock. Es idempotente: puede ejecutarse más de una vez sin duplicar datos.

Levantar la API:

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación interactiva: http://localhost:8000/docs y http://localhost:8000/redoc

### 3. Frontend

En **otra terminal**, desde la raíz del repositorio:

```bash
cd frontend

# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env

pnpm install
pnpm dev
```

Abrir http://localhost:5173

Para generar la versión de producción: `pnpm build`.

## Usuario administrador

| Usuario | Contraseña |
|---|---|
| `admin` | `Admin1234!` |

Los clientes se crean desde la pantalla de registro.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | `sqlite:///./food_store.db` |
| `SECRET_KEY` | Clave de firma del JWT (mínimo 32 caracteres) | `cambiar-por-una-clave-generada-con-secrets-token-hex` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

Para generar una clave segura:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Frontend (`frontend/.env`)

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### Usar PostgreSQL

1. Crear la base de datos `foodstore_db` (por ejemplo, desde pgAdmin).
2. En `backend/.env`, reemplazar la línea de `DATABASE_URL` por:
   ```
   DATABASE_URL=postgresql+psycopg2://USUARIO:CLAVE@localhost:5432/foodstore_db
   ```
3. Ejecutar `python -m app.db.seed` y levantar la API como se indica arriba.

## Funcionalidades

**Cliente:** registro e inicio de sesión · catálogo con búsqueda, filtro por categoría y paginación · carrito persistente · checkout con forma de pago y dirección · historial de pedidos con detalle y cancelación mientras el pedido está pendiente.

**Administrador:** resumen de pedidos por estado · ABM de categorías y productos con baja lógica · actualización de stock · gestión de pedidos (avanzar estado o cancelar, con restitución de stock) · activación y desactivación de usuarios.

## Estructura del proyecto

```
backend/
  app/
    core/       Configuración, base de datos, seguridad, dependencias, UnitOfWork y BaseRepository
    modules/    auth, usuarios, categorias, productos y pedidos
                (models, schemas, repository, unit_of_work, service, router)
    db/seed.py  Datos iniciales idempotentes
frontend/
  src/
    features/   Un módulo por dominio: auth, categorias, productos, pedidos, usuarios
                (api, hooks, components, pages, types, utils)
    routes/     AppRouter y ProtectedRoute (rutas protegidas por rol)
    store/      Estado del cliente con Zustand: authStore y cartStore (persistentes)
    shared/
      api/        Instancia de Axios, manejo de errores de la API y QueryClient
      components/ Tabla, paginación, estados de error, vacío y carga
      hooks/      useTablaPaginada
      layout/     MainLayout y Navbar
      ui/         Componentes base: Button, Input, Card, Modal, BadgeEstado
      utils/      Formateo de precios y fechas
```