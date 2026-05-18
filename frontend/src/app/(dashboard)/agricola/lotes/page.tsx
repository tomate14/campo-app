'use client'

import { useState } from 'react'
import { useLotes, useDeleteLote } from '@/lib/hooks/useLotes'
import { LoteCard } from '@/components/agricola/LoteCard'
import { LoteForm } from '@/components/agricola/LoteForm'
import type { Lote } from '@/lib/types/agricola'

export default function LotesPage() {
  const { data: lotes, isLoading } = useLotes()
  const deleteLote = useDeleteLote()
  const [editando, setEditando] = useState<Lote | null>(null)
  const [creando, setCreando] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Lotes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de lotes agrícolas</p>
        </div>
        <button
          onClick={() => setCreando(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
        >
          + Nuevo lote
        </button>
      </div>

      {(creando || editando) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-lg p-8 w-full max-w-lg">
            <LoteForm
              lote={editando ?? undefined}
              onClose={() => { setCreando(false); setEditando(null) }}
            />
          </div>
        </div>
      )}

      {lotes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-lg">No hay lotes registrados</p>
          <p className="text-muted text-sm mt-1">Creá el primer lote para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lotes?.map((lote) => (
            <LoteCard
              key={lote.id}
              lote={lote}
              onEdit={() => setEditando(lote)}
              onDelete={() => deleteLote.mutate(lote.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
