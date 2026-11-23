import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { ItemCarritoFila } from '../components/ItemCarritoFila'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const unidades = useCartStore((s) => s.unidades())
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false)

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Carrito</h1>
        <EstadoVacio mensaje="Tu carrito está vacío.">
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ver el catálogo
          </Link>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Carrito</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <ItemCarritoFila key={item.producto_id} item={item} />
            ))}
          </ul>
        </Card>

        <Card className="flex h-fit flex-col gap-4">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <div className="flex justify-between text-gray-600">
            <span>Productos</span>
            <span>{unidades}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-4 text-xl font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
          <Button variante="secondary" onClick={() => setConfirmandoVaciar(true)}>
            Vaciar carrito
          </Button>
          <Link to="/" className="text-center text-sm text-orange-600 hover:underline">
            Seguir comprando
          </Link>
        </Card>
      </div>

      <Modal abierto={confirmandoVaciar} titulo="Vaciar carrito" onCerrar={() => setConfirmandoVaciar(false)}>
        <p className="mb-6 text-gray-700">Se van a quitar todos los productos del carrito.</p>
        <div className="flex justify-end gap-3">
          <Button variante="secondary" onClick={() => setConfirmandoVaciar(false)}>
            Cancelar
          </Button>
          <Button
            variante="danger"
            onClick={() => {
              vaciar()
              setConfirmandoVaciar(false)
            }}
          >
            Vaciar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
