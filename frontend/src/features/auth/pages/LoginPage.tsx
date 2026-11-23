import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const recienRegistrado = (location.state as { registrado?: boolean } | null)?.registrado === true
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await login(value.username.trim(), value.password)
        navigate('/')
      } catch (error) {
        setErrorServidor(handleApiError(error))
      }
    },
  })

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <h1 className="mb-6 text-2xl font-bold">Ingresar</h1>
        {recienRegistrado && (
          <p role="status" className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
            Cuenta creada. Ya podés ingresar.
          </p>
        )}
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
            validators={{
              onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario'),
            }}
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
            name="password"
            validators={{
              onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña'),
            }}
            children={(field) => (
              <Input
                label="Contraseña"
                type="password"
                name={field.name}
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              />
            )}
          />
          {errorServidor && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorServidor}
            </p>
          )}
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(enviando) => (
              <Button type="submit" loading={enviando}>
                Ingresar
              </Button>
            )}
          />
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
