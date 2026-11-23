import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number
  total: number
  limit: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, total, limit, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variante="secondary" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button variante="secondary" disabled={pagina >= totalPaginas - 1} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
      </Button>
    </div>
  )
}
