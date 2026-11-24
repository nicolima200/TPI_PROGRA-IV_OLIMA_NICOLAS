import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useProductos } from '../hooks/useProductos'
import { useEliminarProducto } from '../hooks/useEliminarProducto'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { MiniaturaProducto } from '../components/MiniaturaProducto'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Modal } from '../../../shared/ui/Modal'
import { Button } from '../../../shared/ui/Button'
import type { Producto } from '../types/producto'

const LIMIT = 100
const SIN_PRODUCTOS: Producto[] = []
const columnHelper = createColumnHelper<Producto>()

export function AdminProductosPage() {
  const { data, isPending, isError, error, refetch } = useProductos({ limit: LIMIT })
  const eliminar = useEliminarProducto()
  const [formAbierto, setFormAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [productoStock, setProductoStock] = useState<Producto | null>(null)
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)

  const columnas = useMemo(
    () => [
      columnHelper.accessor('imagen_url', {
        header: 'Imagen',
        cell: ({ row }) => <MiniaturaProducto url={row.original.imagen_url} nombre={row.original.nombre} />,
      }),
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => formatearPrecio(info.getValue()),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span className={info.getValue() === 0 ? 'font-medium text-red-600' : ''}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Sí</span>
          ) : (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">No</span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variante="secondary"
              onClick={() => {
                setProductoEditando(row.original)
                setFormAbierto(true)
              }}
            >
              Editar
            </Button>
            <Button variante="secondary" onClick={() => setProductoStock(row.original)}>
              Stock
            </Button>
            <Button variante="danger" onClick={() => setProductoAEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [],
  )

  const tabla = useReactTable({
    data: data?.items ?? SIN_PRODUCTOS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const abrirCrear = () => {
    setProductoEditando(null)
    setFormAbierto(true)
  }

  const cerrarForm = () => {
    setFormAbierto(false)
    setProductoEditando(null)
  }

  const cerrarEliminar = () => {
    setProductoAEliminar(null)
    eliminar.reset()
  }

  const confirmarEliminar = () => {
    if (!productoAEliminar) return
    eliminar.mutate(productoAEliminar.id, { onSuccess: () => setProductoAEliminar(null) })
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={abrirCrear}>Nuevo producto</Button>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay productos.">
          <Button onClick={abrirCrear}>Crear el primero</Button>
        </EstadoVacio>
      ) : (
        <>
          {data.total > data.items.length && (
            <p className="text-sm text-gray-500">
              Se muestran los primeros {data.items.length} de {data.total} productos.
            </p>
          )}
          <TablaDatos tabla={tabla} />
        </>
      )}

      <Modal
        abierto={formAbierto}
        titulo={productoEditando ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={cerrarForm}
      >
        <ProductoForm producto={productoEditando} onGuardado={cerrarForm} onCancelar={cerrarForm} />
      </Modal>

      <Modal abierto={productoStock !== null} titulo="Actualizar stock" onCerrar={() => setProductoStock(null)}>
        {productoStock && (
          <StockForm
            producto={productoStock}
            onGuardado={() => setProductoStock(null)}
            onCancelar={() => setProductoStock(null)}
          />
        )}
      </Modal>

      <Modal abierto={productoAEliminar !== null} titulo="Eliminar producto" onCerrar={cerrarEliminar}>
        <div className="flex flex-col gap-4">
          <p>
            ¿Seguro que querés eliminar <strong>{productoAEliminar?.nombre}</strong>? Deja de aparecer en el
            catálogo, pero los pedidos que ya lo incluyen no cambian.
          </p>
          {eliminar.isError && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {handleApiError(eliminar.error)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variante="secondary" onClick={cerrarEliminar}>
              Cancelar
            </Button>
            <Button variante="danger" loading={eliminar.isPending} onClick={confirmarEliminar}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
