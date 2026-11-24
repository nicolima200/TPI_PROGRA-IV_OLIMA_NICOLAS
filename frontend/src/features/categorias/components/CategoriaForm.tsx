import { useForm } from '@tanstack/react-form'
import { useCrearCategoria } from '../hooks/useCrearCategoria'
import { useActualizarCategoria } from '../hooks/useActualizarCategoria'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import type { Categoria } from '../types/categoria'

interface CategoriaFormProps {
  categoria: Categoria | null
  onGuardado: () => void
  onCancelar: () => void
}

function validarNombre(value: string): string | undefined {
  const largo = value.trim().length
  if (largo < 2) return 'El nombre debe tener al menos 2 caracteres'
  if (largo > 100) return 'El nombre puede tener hasta 100 caracteres'
  return undefined
}

export function CategoriaForm({ categoria, onGuardado, onCancelar }: CategoriaFormProps) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const mutacion = categoria ? actualizar : crear

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      const descripcion = value.descripcion.trim()
      const datos = { nombre: value.nombre.trim(), descripcion: descripcion ? descripcion : null }
      try {
        if (categoria) {
          await actualizar.mutateAsync({ id: categoria.id, datos })
        } else {
          await crear.mutateAsync(datos)
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
        validators={{ onChange: ({ value }) => validarNombre(value) }}
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
              {categoria ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        />
      </div>
    </form>
  )
}
