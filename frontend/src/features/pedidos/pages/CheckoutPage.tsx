import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/useCrearPedido'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatearPrecio } from '../../../shared/utils/formatearPrecio'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import type { FormaPago } from '../types/pedido'

const FORMAS_PAGO: { valor: FormaPago; etiqueta: string }[] = [
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
]

function esFormaPago(valor: string): valor is FormaPago {
  return FORMAS_PAGO.some((f) => f.valor === valor)
}

interface ValoresCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

const VALORES_INICIALES: ValoresCheckout = {
  direccion_entrega: '',
  forma_pago: 'EFECTIVO',
  notas: '',
}

function validarDireccion(value: string): string | undefined {
  const largo = value.trim().length
  if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
  if (largo > 200) return 'La dirección puede tener hasta 200 caracteres'
  return undefined
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()
  const crear = useCrearPedido()
  const [carritoVacioAlEntrar] = useState(() => useCartStore.getState().items.length === 0)

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      try {
        const notas = value.notas.trim()
        const pedido = await crear.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: notas ? notas : null,
        })
        vaciar()
        navigate('/mis-pedidos', { replace: true, state: { pedidoCreado: pedido.id } })
      } catch {
        return
      }
    },
  })

  if (items.length === 0) {
    return carritoVacioAlEntrar ? <Navigate to="/carrito" replace /> : null
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Confirmar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="direccion_entrega"
              validators={{ onChange: ({ value }) => validarDireccion(value) }}
              children={(field) => (
                <Input
                  label="Dirección de entrega"
                  name={field.name}
                  autoComplete="street-address"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
                />
              )}
            />

            <form.Field
              name="forma_pago"
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <label htmlFor="forma_pago" className="text-sm font-medium text-gray-700">
                    Forma de pago
                  </label>
                  <select
                    id="forma_pago"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      if (esFormaPago(e.target.value)) field.handleChange(e.target.value)
                    }}
                    onBlur={field.handleBlur}
                    className="rounded border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {FORMAS_PAGO.map((f) => (
                      <option key={f.valor} value={f.valor}>
                        {f.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />

            <form.Field
              name="notas"
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <label htmlFor="notas" className="text-sm font-medium text-gray-700">
                    Notas (opcional)
                  </label>
                  <textarea
                    id="notas"
                    name={field.name}
                    rows={3}
                    placeholder="Ej.: tocar timbre 2B, sin cebolla..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            />

            {crear.isError && (
              <div role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
                <p>{handleApiError(crear.error)}</p>
                <Link to="/carrito" className="font-medium underline">
                  Revisar el carrito
                </Link>
              </div>
            )}

            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(enviando) => (
                <Button type="submit" loading={enviando}>
                  Confirmar pedido
                </Button>
              )}
            />
          </form>
        </Card>

        <Card className="flex h-fit flex-col gap-4">
          <h2 className="text-lg font-semibold">Tu pedido</h2>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-2 text-sm">
                <span className="text-gray-700">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-gray-200 pt-4 text-xl font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Link to="/carrito" className="text-center text-sm text-orange-600 hover:underline">
            Modificar el carrito
          </Link>
        </Card>
      </div>
    </section>
  )
}
