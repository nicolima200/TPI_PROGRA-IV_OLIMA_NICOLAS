import { useForm } from '@tanstack/react-form'
import { useActualizarStock } from '../hooks/useActualizarStock'
import { validarStock } from '../utils/validaciones'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import type { Producto } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onGuardado: () => void
  onCancelar: () => void
}

export function StockForm({ producto, onGuardado, onCancelar }: StockFormProps) {
  const actualizar = useActualizarStock()

  const form = useForm({
    defaultValues: {
      stock: String(producto.stock),
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      try {
        await actualizar.mutateAsync({
          id: producto.id,
          datos: { stock: Number(value.stock), disponible: value.disponible },
        })
        onGuardado()
      } catch {
        return
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <p className="text-sm text-gray-600">
        <strong>{producto.nombre}</strong>: stock actual {producto.stock}
      </p>

      <form.Field
        name="stock"
        validators={{ onChange: ({ value }) => validarStock(value) }}
        children={(field) => (
          <Input
            label="Nuevo stock"
            name={field.name}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            autoFocus
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
          />
        )}
      />

      <form.Field
        name="disponible"
        children={(field) => (
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name={field.name}
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            Disponible para la venta
          </label>
        )}
      />

      {actualizar.isError && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(actualizar.error)}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variante="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(enviando) => (
            <Button type="submit" loading={enviando}>
              Guardar stock
            </Button>
          )}
        />
      </div>
    </form>
  )
}
