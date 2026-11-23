import { useState } from 'react'
import { useCartStore } from '../../../store/cartStore'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { Button } from '../../../shared/ui/Button'
import type { Producto } from '../types/producto'

interface ProductoCardProps {
  producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock < 1
  const alcanzoElStock = enCarrito >= producto.stock
  const puedeAgregar = producto.disponible && !sinStock && !alcanzoElStock

  let textoBoton = 'Agregar al carrito'
  if (!producto.disponible) textoBoton = 'No disponible'
  else if (sinStock) textoBoton = 'Sin stock'
  else if (alcanzoElStock) textoBoton = 'Máximo en el carrito'

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          onError={() => setImagenRota(true)}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
          Sin imagen
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-orange-600">
          {producto.categoria.nombre}
        </span>
        <h2 className="text-lg font-semibold text-gray-900">{producto.nombre}</h2>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-gray-600">{producto.descripcion}</p>
        )}
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-xl font-bold text-gray-900">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-sm ${sinStock ? 'text-red-600' : 'text-gray-500'}`}>
            {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>
        {enCarrito > 0 && <p className="text-sm text-green-700">En el carrito: {enCarrito}</p>}
        <Button
          disabled={!puedeAgregar}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
              imagen_url: producto.imagen_url,
              stock: producto.stock,
            })
          }
        >
          {textoBoton}
        </Button>
      </div>
    </article>
  )
}
