import { flexRender, type Table } from '@tanstack/react-table'
import { Paginacion } from './Paginacion'

interface TablaDatosProps<T> {
  tabla: Table<T>
}

export function TablaDatos<T>({ tabla }: TablaDatosProps<T>) {
  const { pageIndex, pageSize } = tabla.getState().pagination
  const totalFilas = tabla.getPrePaginationRowModel().rows.length

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-gray-100 hover:bg-gray-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalFilas > pageSize && (
        <Paginacion pagina={pageIndex} total={totalFilas} limit={pageSize} onCambiar={(p) => tabla.setPageIndex(p)} />
      )}
    </div>
  )
}
