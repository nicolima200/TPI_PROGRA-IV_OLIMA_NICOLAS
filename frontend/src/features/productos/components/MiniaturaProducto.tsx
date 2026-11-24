import { useState } from 'react'

interface MiniaturaProductoProps {
  url: string | null
  nombre: string
}

export function MiniaturaProducto({ url, nombre }: MiniaturaProductoProps) {
  const [imagenRota, setImagenRota] = useState(false)

  if (!url || imagenRota) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400">
        Sin imagen
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={nombre}
      loading="lazy"
      onError={() => setImagenRota(true)}
      className="h-12 w-12 rounded object-cover"
    />
  )
}
