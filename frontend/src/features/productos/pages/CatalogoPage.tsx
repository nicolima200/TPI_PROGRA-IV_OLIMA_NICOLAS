import { useRef, useState } from 'react'
import { useProductos } from '../hooks/useProductos'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Button } from '../../../shared/ui/Button'

const LIMIT = 12
const DEMORA_BUSQUEDA_MS = 300

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { data: categorias } = useCategorias()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search,
    categoria_id: categoriaId,
  })

  const cambiarBusqueda = (texto: string) => {
    setTextoBusqueda(texto)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      setSearch(texto)
      setPagina(0)
    }, DEMORA_BUSQUEDA_MS)
  }

  const cambiarCategoria = (valor: string) => {
    setCategoriaId(valor ? Number(valor) : undefined)
    setPagina(0)
  }

  const limpiarFiltros = () => {
    clearTimeout(temporizador.current)
    setTextoBusqueda('')
    setSearch('')
    setCategoriaId(undefined)
    setPagina(0)
  }

  const hayFiltros = search.trim() !== '' || categoriaId !== undefined

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Catálogo</h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          value={textoBusqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          aria-label="Filtrar por categoría"
          value={categoriaId ?? ''}
          onChange={(e) => cambiarCategoria(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          mensaje={hayFiltros ? 'No hay productos que coincidan con la búsqueda.' : 'Todavía no hay productos.'}
        >
          {hayFiltros && (
            <Button variante="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </EstadoVacio>
      ) : (
        <>
          <div
            className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isPlaceholderData ? 'opacity-60' : ''}`}
          >
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          {data.total > LIMIT && (
            <Paginacion
              pagina={pagina}
              total={data.total}
              limit={LIMIT}
              onCambiar={setPagina}
              deshabilitada={isPlaceholderData}
            />
          )}
        </>
      )}
    </section>
  )
}
