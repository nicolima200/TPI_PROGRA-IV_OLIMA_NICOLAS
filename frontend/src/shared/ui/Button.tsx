import type { ComponentProps } from 'react'

type Variante = 'primary' | 'secondary' | 'danger'

const estilos: Record<Variante, string> = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

interface ButtonProps extends ComponentProps<'button'> {
  variante?: Variante
  loading?: boolean
}

export function Button({
  variante = 'primary',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`rounded px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    >
      {loading ? 'Procesando...' : children}
    </button>
  )
}
