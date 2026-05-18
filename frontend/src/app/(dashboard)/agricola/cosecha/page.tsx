'use client'

import { useState } from 'react'
import { useLotes } from '@/lib/hooks/useLotes'
import { useCosechasByLote, useCreateCosecha, useRendimientoPromedio } from '@/lib/hooks/useCosecha'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CalidadGrano } from '@/lib/types/agricola'

const CALIDADES: { value: CalidadGrano; label: string }[] = [
  { value: 'PREMIUM',   label: 'Premium' },
  { value: 'ESTANDAR',  label: 'Estándar' },
  { value: 'DESCUENTO', label: 'Descuento' },
]

const schema = z.object({
  loteId:          z.string().min(1, 'Seleccioná un lote'),
  fecha:           z.string().min(1, 'La fecha es requerida'),
  rendimientoKgHa: z.number({ invalid_type_error: 'Ingrese el rendimiento' }).nonnegative(),
  toneladasTotal:  z.number({ invalid_type_error: 'Ingrese las toneladas' }).nonnegative(),
  calidadGrano:    z.enum(['PREMIUM','ESTANDAR','DESCUENTO']).optional(),
  humedad:         z.number().min(0).max(100).optional(),
  observaciones:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CALIDAD_STYLES: Record<CalidadGrano, string> = {
  PREMIUM:   'bg-green-100 text-green-700',
  ESTANDAR:  'bg-blue-100 text-blue-700',
  DESCUENTO: 'bg-orange-100 text-orange-700',
}

export default function CosechaPage() {
  const [loteSeleccionado, setLoteSeleccionado] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  const { data: lotes } = useLotes()
  const { data: cosechas, isLoading } = useCosechasByLote(loteSeleccionado)
  const { data: promedio } = useRendimientoPromedio(loteSeleccionado)
  const createCosecha = useCreateCosecha()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { loteId: loteSeleccionado },
  })

  const onSubmit = async (data: FormData) => {
    await createCosecha.mutateAsync(data)
    reset()
    setMostrarForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cosecha</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro y análisis de rendimiento</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
        >
          + Registrar cosecha
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Lote</label>
          <select
            value={loteSeleccionado}
            onChange={e => setLoteSeleccionado(e.target.value)}
            className="h-11 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background min-w-48"
          >
            <option value="">Seleccionar lote...</option>
            {lotes?.map(l => <option key={l.id} value={l.id}>{l.nombre} — {l.cultivo}</option>)}
          </select>
        </div>

        {loteSeleccionado && promedio && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3">
            <p className="text-xs text-muted-foreground">Rendimiento promedio</p>
            <p className="text-xl font-bold text-primary">{promedio.rendimientoPromedioKgHa.toFixed(0)} <span className="text-sm font-normal">kg/ha</span></p>
          </div>
        )}
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-foreground mb-5">Registrar cosecha</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Lote</label>
                <select {...register('loteId')} className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                  <option value="">Seleccionar lote...</option>
                  {lotes?.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
                {errors.loteId && <p className="mt-1 text-xs text-destructive">{errors.loteId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de cosecha</label>
                <input {...register('fecha')} type="date" className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background" />
                {errors.fecha && <p className="mt-1 text-xs text-destructive">{errors.fecha.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Rendimiento (kg/ha)</label>
                  <input {...register('rendimientoKgHa', { valueAsNumber: true })} type="number" step="0.01" className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="8500" />
                  {errors.rendimientoKgHa && <p className="mt-1 text-xs text-destructive">{errors.rendimientoKgHa.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Toneladas totales</label>
                  <input {...register('toneladasTotal', { valueAsNumber: true })} type="number" step="0.01" className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="1700" />
                  {errors.toneladasTotal && <p className="mt-1 text-xs text-destructive">{errors.toneladasTotal.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Calidad del grano</label>
                  <select {...register('calidadGrano')} className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                    <option value="">Sin clasificar</option>
                    {CALIDADES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Humedad (%)</label>
                  <input {...register('humedad', { valueAsNumber: true })} type="number" step="0.1" min="0" max="100" className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background" placeholder="14.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Observaciones</label>
                <textarea {...register('observaciones')} rows={2} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarForm(false); reset() }} className="flex-1 h-11 border border-border rounded-lg text-sm font-semibold hover:bg-muted/20 transition-colors duration-150">Cancelar</button>
                <button type="submit" disabled={createCosecha.isPending} className="flex-1 h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity duration-200">
                  {createCosecha.isPending ? 'Guardando...' : 'Registrar cosecha'}
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
        ) : cosechas?.map(cosecha => (
          <div key={cosecha.id} className="bg-background border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{cosecha.loteNombre}</p>
                <p className="text-sm text-muted-foreground">{cosecha.fecha}</p>
              </div>
              {cosecha.calidadGrano && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CALIDAD_STYLES[cosecha.calidadGrano]}`}>
                  {cosecha.calidadGrano}
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Rendimiento</p>
                <p className="text-lg font-bold text-foreground">{cosecha.rendimientoKgHa} <span className="text-xs font-normal text-muted-foreground">kg/ha</span></p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Toneladas</p>
                <p className="text-lg font-bold text-foreground">{cosecha.toneladasTotal} <span className="text-xs font-normal text-muted-foreground">tn</span></p>
              </div>
              {cosecha.humedad && (
                <div>
                  <p className="text-xs text-muted-foreground">Humedad</p>
                  <p className="text-lg font-bold text-foreground">{cosecha.humedad}<span className="text-xs font-normal text-muted-foreground">%</span></p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
