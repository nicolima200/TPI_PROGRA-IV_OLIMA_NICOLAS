import { useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
  type TableOptions,
} from '@tanstack/react-table'

const FILAS_POR_PAGINA = 10

export function useTablaPaginada<T>(data: T[], columns: TableOptions<T>['columns']) {
  const [paginacion, setPaginacion] = useState<PaginationState>({ pageIndex: 0, pageSize: FILAS_POR_PAGINA })
  const ultimaPagina = Math.max(0, Math.ceil(data.length / paginacion.pageSize) - 1)

  return useReactTable({
    data,
    columns,
    state: { pagination: { ...paginacion, pageIndex: Math.min(paginacion.pageIndex, ultimaPagina) } },
    onPaginationChange: setPaginacion,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
