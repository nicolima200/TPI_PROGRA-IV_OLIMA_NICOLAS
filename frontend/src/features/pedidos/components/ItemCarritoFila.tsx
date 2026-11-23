import { useCartStore, type ItemCarrito } from '../../../store/cartStore'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'

interface ItemCarritoFilaProps {
  item: ItemCarrito
}

export function ItemCarritoFila({ item }: ItemCarritoFilaProps) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
      {item.imagen_url ? (
        <img src={item.imagen_url} alt={item.nombre} className="h-20 w-20 rounded object-cover" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
          Sin imagen
        </div>
      )}

      <div className="flex-1">
        <p className="font-semibold text-gray-900">{item.nombre}</p>
        <p className="text-sm text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Quitar una unidad de ${item.nombre}`}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
          className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
        >
          −
        </button>
        <span className="w-8 text-center font-medium" aria-live="polite">
          {item.cantidad}
        </span>
        <button
          type="button"
          aria-label={`Agregar una unidad de ${item.nombre}`}
          disabled={item.cantidad >= item.stock}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
          className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <p className="w-32 text-right font-semibold text-gray-900">
        {formatearPrecio(item.precio_unitario * item.cantidad)}
      </p>

      <button
        type="button"
        onClick={() => quitar(item.producto_id)}
        className="text-sm text-red-600 hover:underline"
      >
        Quitar
      </button>
    </li>
  )
}
