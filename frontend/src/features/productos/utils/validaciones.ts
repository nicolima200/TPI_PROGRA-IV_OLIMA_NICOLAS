export function validarNombreProducto(value: string): string | undefined {
  const largo = value.trim().length
  if (largo < 1) return 'Ingresá un nombre'
  if (largo > 150) return 'El nombre puede tener hasta 150 caracteres'
  return undefined
}

export function validarPrecio(value: string): string | undefined {
  if (value.trim() === '') return 'Ingresá un precio'
  const numero = Number(value)
  if (!Number.isFinite(numero)) return 'El precio debe ser un número'
  if (numero < 0) return 'El precio no puede ser negativo'
  return undefined
}

export function validarStock(value: string): string | undefined {
  if (value.trim() === '') return 'Ingresá el stock'
  const numero = Number(value)
  if (!Number.isInteger(numero)) return 'El stock debe ser un número entero'
  if (numero < 0) return 'El stock no puede ser negativo'
  return undefined
}

export function validarImagenUrl(value: string): string | undefined {
  const url = value.trim()
  if (url === '') return undefined
  if (!/^https?:\/\//.test(url)) return 'La URL debe empezar con http:// o https://'
  return undefined
}
