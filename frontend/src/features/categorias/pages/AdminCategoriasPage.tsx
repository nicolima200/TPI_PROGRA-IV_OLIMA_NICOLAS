import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useCategorias } from '../hooks/useCategorias'
import { useEliminarCategoria } from '../hooks/useEliminarCategoria'
import { CategoriaForm } from '../components/CategoriaForm'
import { handleApiError } from '../../../shared/api/handleApiError'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { useTablaPaginada } from '../../../shared/hooks/useTablaPaginada'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Modal } from '../../../shared/ui/Modal'
import { Button } from '../../../shared/ui/Button'
import type { Categoria } from '../types/categoria'

const SIN_CATEGORIAS: Categoria[] = []
const columnHelper = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias()
  const eliminar = useEliminarCategoria()
  const [formAbierto, setFormAbierto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null)

  const columnas = useMemo(
    () => [
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => info.getValue() ?? <span className="text-gray-400">—</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variante="secondary"
              onClick={() => {
                setCategoriaEditando(row.original)
                setFormAbierto(true)
              }}
            >
              Editar
            </Button>
            <Button variante="danger" onClick={() => setCategoriaAEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [],
  )

  const tabla = useTablaPaginada(data ?? SIN_CATEGORIAS, columnas)

  const abrirCrear = () => {
    setCategoriaEditando(null)
    setFormAbierto(true)
  }

  const cerrarForm = () => {
    setFormAbierto(false)
    setCategoriaEditando(null)
  }

  const cerrarEliminar = () => {
    setCategoriaAEliminar(null)
    eliminar.reset()
  }

  const confirmarEliminar = () => {
    if (!categoriaAEliminar) return
    eliminar.mutate(categoriaAEliminar.id, { onSuccess: () => setCategoriaAEliminar(null) })
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={abrirCrear}>Nueva categoría</Button>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => refetch()} />
      ) : data.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay categorías.">
          <Button onClick={abrirCrear}>Crear la primera</Button>
        </EstadoVacio>
      ) : (
        <TablaDatos tabla={tabla} />
      )}

      <Modal
        abierto={formAbierto}
        titulo={categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={cerrarForm}
      >
        <CategoriaForm categoria={categoriaEditando} onGuardado={cerrarForm} onCancelar={cerrarForm} />
      </Modal>

      <Modal abierto={categoriaAEliminar !== null} titulo="Eliminar categoría" onCerrar={cerrarEliminar}>
        <div className="flex flex-col gap-4">
          <p>
            ¿Seguro que querés eliminar la categoría <strong>{categoriaAEliminar?.nombre}</strong>? Sus productos
            no se eliminan.
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
