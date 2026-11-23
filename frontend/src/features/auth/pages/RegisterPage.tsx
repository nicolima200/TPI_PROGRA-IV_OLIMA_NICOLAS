import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useRegistrar } from '../hooks/useRegistrar'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarUsername(value: string): string | undefined {
  const largo = value.trim().length
  if (largo < 3) return 'El usuario debe tener al menos 3 caracteres'
  if (largo > 50) return 'El usuario puede tener hasta 50 caracteres'
  return undefined
}

function validarNombre(value: string): string | undefined {
  const largo = value.trim().length
  if (largo < 1) return 'Ingresá tu nombre completo'
  if (largo > 100) return 'El nombre puede tener hasta 100 caracteres'
  return undefined
}

function validarEmail(value: string): string | undefined {
  return FORMATO_EMAIL.test(value.trim()) ? undefined : 'Ingresá un email válido'
}

function validarPassword(value: string): string | undefined {
  return value.length >= 8 ? undefined : 'La contraseña debe tener al menos 8 caracteres'
}

export function RegisterPage() {
  const navigate = useNavigate()
  const registrar = useRegistrar()

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        await registrar.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { state: { registrado: true } })
      } catch {
        return
      }
    },
  })

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <h1 className="mb-6 text-2xl font-bold">Crear cuenta</h1>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => validarUsername(value) }}
            children={(field) => (
              <Input
                label="Usuario"
                name={field.name}
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          />
          <form.Field
            name="full_name"
            validators={{ onChange: ({ value }) => validarNombre(value) }}
            children={(field) => (
              <Input
                label="Nombre completo"
                name={field.name}
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          />
          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => validarEmail(value) }}
            children={(field) => (
              <Input
                label="Email"
                type="email"
                name={field.name}
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          />
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => validarPassword(value) }}
            children={(field) => (
              <Input
                label="Contraseña"
                type="password"
                name={field.name}
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          />
          {registrar.isError && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {handleApiError(registrar.error)}
            </p>
          )}
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(enviando) => (
              <Button type="submit" loading={enviando}>
                Registrarme
              </Button>
            )}
          />
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
