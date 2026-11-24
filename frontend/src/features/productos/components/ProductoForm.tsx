import { useForm } from '@tanstack/react-form'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useCrearProducto } from '../hooks/useCrearProducto'
import { useActualizarProducto } from '../hooks/useActualizarProducto'
import { validarImagenUrl, validarNombreProducto, validarPrecio, validarStock } from '../utils/validaciones'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import type { Producto } from '../types/producto'

interface ProductoFormProps {
  producto: Producto | null
  onGuardado: () => void
  onCancelar: () => void
}

interface ValoresProducto {
  nombre: string
  descripcion: string
  precio_base: string
  imagen_url: string
  categoria_id: string
  stock: string
  disponible: boolean
}

function valoresIniciales(producto: Producto | null): ValoresProducto {
  return {
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio_base: producto ? String(producto.precio_base) : '',
    imagen_url: producto?.imagen_url ?? '',
    categoria_id: producto ? String(producto.categoria_id) : '',
    stock: '0',
    disponible: true,
  }
}

export function ProductoForm({ producto, onGuardado, onCancelar }: ProductoFormProps) {
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const mutacion = producto ? actualizar : crear

  const opcionesCategoria = categorias.data ?? []
  const categoriaActualEliminada =
    producto !== null && !opcionesCategoria.some((c) => c.id === producto.categoria_id)

  const form = useForm({
    defaultValues: valoresIniciales(producto),
    onSubmit: async ({ value }) => {
      const descripcion = value.descripcion.trim()
      const imagen = value.imagen_url.trim()
      const datos = {
        nombre: value.nombre.trim(),
        descripcion: descripcion ? descripcion : null,
        precio_base: Number(value.precio_base),
        imagen_url: imagen ? imagen : null,
        categoria_id: Number(value.categoria_id),
      }
      try {
        if (producto) {
          await actualizar.mutateAsync({ id: producto.id, datos })
        } else {
          await crear.mutateAsync({ ...datos, stock: Number(value.stock), disponible: value.disponible })
        }
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
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => validarNombreProducto(value) }}
        children={(field) => (
          <Input
            label="Nombre"
            name={field.name}
            autoFocus
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
          />
        )}
      />

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value === '' ? 'Elegí una categoría' : undefined) }}
        children={(field) => {
          const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined
          return (
            <div className="flex flex-col gap-1">
              <label htmlFor="categoria_id" className="text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                id="categoria_id"
                name={field.name}
                value={field.state.value}
                disabled={categorias.isPending}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={error ? true : undefined}
                className={`rounded border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">{categorias.isPending ? 'Cargando categorías...' : 'Elegí una categoría'}</option>
                {opcionesCategoria.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
                {categoriaActualEliminada && (
                  <option value={producto.categoria_id}>{producto.categoria.nombre} (eliminada)</option>
                )}
              </select>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {categorias.isError && (
                <p className="text-sm text-red-600">{handleApiError(categorias.error)}</p>
              )}
            </div>
          )
        }}
      />

      <form.Field
        name="precio_base"
        validators={{ onChange: ({ value }) => validarPrecio(value) }}
        children={(field) => (
          <Input
            label="Precio"
            name={field.name}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
          />
        )}
      />

      {!producto && (
        <div className="grid grid-cols-2 items-end gap-4">
          <form.Field
            name="stock"
            validators={{ onChange: ({ value }) => validarStock(value) }}
            children={(field) => (
              <Input
                label="Stock inicial"
                name={field.name}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
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
              <label className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700">
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
        </div>
      )}

      <form.Field
        name="imagen_url"
        validators={{ onChange: ({ value }) => validarImagenUrl(value) }}
        children={(field) => (
          <Input
            label="URL de la imagen (opcional)"
            name={field.name}
            type="url"
            placeholder="https://..."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
          />
        )}
      />

      <form.Field
        name="descripcion"
        children={(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              name={field.name}
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}
      />

      {mutacion.isError && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(mutacion.error)}
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
              {producto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        />
      </div>
    </form>
  )
}
