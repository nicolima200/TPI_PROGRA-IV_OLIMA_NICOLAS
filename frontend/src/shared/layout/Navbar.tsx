import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const enlacesAdmin = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const unidades = useCartStore((s) => s.unidades())
  const vaciarCarrito = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    vaciarCarrito()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link to="/" className="text-xl font-bold text-orange-600">
          Food Store
        </Link>

        <NavLink to="/carrito" className={claseEnlace}>
          Carrito ({unidades})
        </NavLink>

        {usuario && (
          <NavLink to="/mis-pedidos" className={claseEnlace}>
            Mis pedidos
          </NavLink>
        )}

        {usuario?.role === 'admin' &&
          enlacesAdmin.map((enlace) => (
            <NavLink key={enlace.to} to={enlace.to} className={claseEnlace}>
              {enlace.texto}
            </NavLink>
          ))}

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-gray-600">
                {usuario.full_name} <span className="text-gray-400">({usuario.role})</span>
              </span>
              <Button variante="secondary" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseEnlace}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseEnlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
