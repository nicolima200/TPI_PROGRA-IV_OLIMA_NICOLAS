import { useResumenPedidos } from '../hooks/useResumenPedidos'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Card } from '../../../shared/ui/Card'

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resumen</h1>

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => refetch()} />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { titulo: 'Pendientes', valor: data.pendientes },
            { titulo: 'En preparación', valor: data.en_preparacion },
            { titulo: 'Entregados', valor: data.entregados },
            { titulo: 'Cancelados', valor: data.cancelados },
            { titulo: 'Pedidos de hoy', valor: data.pedidos_hoy },
            { titulo: 'Ingresos (entregados)', valor: formatearPrecio(data.ingresos_entregados) },
          ].map((tarjeta) => (
            <Card key={tarjeta.titulo}>
              <p className="text-sm text-gray-500">{tarjeta.titulo}</p>
              <p className="mt-2 text-3xl font-bold">{tarjeta.valor}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
