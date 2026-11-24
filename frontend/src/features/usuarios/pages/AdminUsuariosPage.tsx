import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useUsuarios } from '../hooks/useUsuarios'
import { AccionUsuario } from '../components/AccionUsuario'
import { useAuthStore } from '../../../store/authStore'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { useTablaPaginada } from '../../../shared/hooks/useTablaPaginada'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import type { Usuario } from '../types/usuario'

const SIN_USUARIOS: Usuario[] = []
const columnHelper = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const { data, isPending, isError, error, refetch } = useUsuarios()
  const idActual = useAuthStore((s) => s.usuario?.id)

  const columnas = useMemo(
    () => [
      columnHelper.accessor('username', { header: 'Usuario' }),
      columnHelper.accessor('full_name', { header: 'Nombre' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) =>
          info.getValue() === 'admin' ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">Admin</span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Cliente</span>
          ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Activo</span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <AccionUsuario usuario={row.original} esUsuarioActual={row.original.id === idActual} />
        ),
      }),
    ],
    [idActual],
  )

  const tabla = useTablaPaginada(data ?? SIN_USUARIOS, columnas)

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Usuarios</h1>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => refetch()} />
      ) : data.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios registrados." />
      ) : (
        <TablaDatos tabla={tabla} />
      )}
    </section>
  )
}
