import { handleApiError } from '../api/handleApiError'
import { Button } from '../ui/Button'

interface EstadoErrorProps {
  error: unknown
  onReintentar?: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-10 text-center text-red-700">
      <p>{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="secondary" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
