const formato = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
const TIENE_ZONA_HORARIA = /(Z|[+-]\d{2}:?\d{2})$/

export function formatearFecha(isoUtc: string): string {
  const texto = TIENE_ZONA_HORARIA.test(isoUtc) ? isoUtc : `${isoUtc}Z`
  return formato.format(new Date(texto))
}
