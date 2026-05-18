import type { Lote } from '@/lib/types/agricola'
import Link from 'next/link'

interface LoteCardProps {
  lote: Lote
  onEdit: () => void
  onDelete: () => void
}

const CULTIVO_COLORS: Record<string, string> = {
  SOJA:      'bg-green-100 text-green-700',
  MAIZ:      'bg-yellow-100 text-yellow-700',
  TRIGO:     'bg-amber-100 text-amber-700',
  GIRASOL:   'bg-orange-100 text-orange-700',
}

export function LoteCard({ lote, onEdit, onDelete }: LoteCardProps) {
  const cultivoColor = CULTIVO_COLORS[lote.cultivo] ?? 'bg-blue-100 text-blue-700'

  return (
    <article className="bg-background border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{lote.nombre}</h3>
          <p className="text-sm text-muted-foreground">{lote.temporada}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cultivoColor}`}>
          {lote.cultivo}
        </span>
      </div>

      <dl className="space-y-1.5 mb-5">
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">Superficie</dt>
          <dd className="font-medium text-foreground">{lote.area} ha</dd>
        </div>
        {lote.latitud && lote.longitud && (
          <div className="flex justify-between text-sm">
            <dt className="text-muted-foreground">Coordenadas</dt>
            <dd className="font-medium text-foreground text-xs">
              {lote.latitud.toFixed(4)}, {lote.longitud.toFixed(4)}
            </dd>
          </div>
        )}
      </dl>

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Link
          href={`/agricola/lotes/${lote.id}`}
          className="flex-1 text-center py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors duration-150"
        >
          Ver detalle
        </Link>
        <button
          onClick={onEdit}
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/20 rounded-md transition-colors duration-150"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-md transition-colors duration-150"
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}
