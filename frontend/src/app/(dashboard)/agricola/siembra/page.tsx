'use client'

import { useState } from 'react'
import { useLotes } from '@/lib/hooks/useLotes'
import { useEventosByLote, useCreateEvento } from '@/lib/hooks/useSiembra'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { TipoEvento } from '@/lib/types/agricola'

const TIPOS_EVENTO: { value: TipoEvento; label: string }[] = [
  { value: 'SIEMBRA',              label: 'Siembra' },
  { value: 'MONITOREO_FENOLOGICO', label: 'Monitoreo Fenológico' },
  { value: 'ALERTA',               label: 'Alerta' },
  { value: 'TRATAMIENTO',          label: 'Tratamiento' },
]

const ESTADOS_FENOLOGICOS = ['VE','V1','V2','V3','V4','V5','V6','V8','V10','VT','R1','R2','R3','R4','R5','R6']

const schema = z.object({
  loteId:            z.string().min(1, 'Seleccioná un lote'),
  tipoEvento:        z.enum(['SIEMBRA','MONITOREO_FENOLOGICO','ALERTA','TRATAMIENTO']),
  estadoFenologico:  z.string().optional(),
  descripcion:       z.string().optional(),
  fecha:             z.string().min(1, 'La fecha es requerida'),
})

type FormData = z.infer<typeof schema>

export default function SiembraPage() {
  const [loteSeleccionado, setLoteSeleccionado] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  const { data: lotes } = useLotes()
  const { data: eventos, isLoading } = useEventosByLote(loteSeleccionado)
  const createEvento = useCreateEvento()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { loteId: loteSeleccionado, tipoEvento: 'SIEMBRA' },
  })

  const onSubmit = async (data: FormData) => {
    await createEvento.mutateAsync(data)
    reset()
    setMostrarForm(false)
  }

  const TIPO_COLORS: Record<TipoEvento, string> = {
    SIEMBRA:              'bg-green-100 text-green-700',
    MONITOREO_FENOLOGICO: 'bg-blue-100 text-blue-700',
    ALERTA:               'bg-red-100 text-red-700',
    TRATAMIENTO:          'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Siembra y Monitoreo</h1>
          <p className="text-sm text-muted-foreground mt-1">Seguimiento fenológico del cultivo</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
        >
          + Registrar evento
        </button>
      </div>

      <div className="bg-background border border-border rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-medium text-foreground mb-2">Filtrar por lote</label>
        <select
          value={loteSeleccionado}
          onChange={e => setLoteSeleccionado(e.target.value)}
          className="w-full md:w-72 h-11 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
        >
          <option value="">Todos los lotes</option>
          {lotes?.map(l => <option key={l.id} value={l.id}>{l.nombre} — {l.cultivo}</option>)}
        </select>
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-foreground mb-5">Registrar evento</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Lote</label>
                <select {...register('loteId')} className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                  <option value="">Seleccionar lote...</option>
                  {lotes?.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
                {errors.loteId && <p className="mt-1 text-xs text-destructive">{errors.loteId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de evento</label>
                  <select {...register('tipoEvento')} className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                    {TIPOS_EVENTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Estado fenológico</label>
                  <select {...register('estadoFenologico')} className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                    <option value="">N/A</option>
                    {ESTADOS_FENOLOGICOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Fecha</label>
                <input {...register('fecha')} type="date" className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background" />
                {errors.fecha && <p className="mt-1 text-xs text-destructive">{errors.fecha.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
                <textarea {...register('descripcion')} rows={3} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none" placeholder="Observaciones del evento..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarForm(false); reset() }} className="flex-1 h-11 border border-border rounded-lg text-sm font-semibold hover:bg-muted/20 transition-colors duration-150">Cancelar</button>
                <button type="submit" disabled={createEvento.isPending} className="flex-1 h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity duration-200">
                  {createEvento.isPending ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isLoading && loteSeleccionado ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : eventos?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No hay eventos registrados para este lote</p>
          </div>
        ) : (
          eventos?.map(evento => (
            <div key={evento.id} className="bg-background border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${TIPO_COLORS[evento.tipoEvento]}`}>
                {evento.tipoEvento.replace('_', ' ')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{evento.loteNombre}</span>
                  {evento.estadoFenologico && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded font-mono">{evento.estadoFenologico}</span>
                  )}
                </div>
                {evento.descripcion && <p className="text-sm text-muted-foreground mt-1 truncate">{evento.descripcion}</p>}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{evento.fecha}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
