'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLote, useUpdateLote } from '@/lib/hooks/useLotes'
import type { Lote } from '@/lib/types/agricola'

const schema = z.object({
  nombre:    z.string().min(1, 'El nombre es requerido').max(100),
  area:      z.number({ invalid_type_error: 'Ingrese el área' }).positive('El área debe ser mayor a 0'),
  cultivo:   z.string().min(1, 'El cultivo es requerido'),
  temporada: z.string().min(1, 'La temporada es requerida'),
  latitud:   z.number().optional(),
  longitud:  z.number().optional(),
})

type FormData = z.infer<typeof schema>

const CULTIVOS = ['SOJA', 'MAIZ', 'TRIGO', 'GIRASOL', 'SORGO', 'OTRO']

interface LoteFormProps {
  lote?: Lote
  onClose: () => void
}

export function LoteForm({ lote, onClose }: LoteFormProps) {
  const createLote = useCreateLote()
  const updateLote = useUpdateLote()
  const isPending = createLote.isPending || updateLote.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: lote ? {
      nombre:    lote.nombre,
      area:      lote.area,
      cultivo:   lote.cultivo,
      temporada: lote.temporada,
      latitud:   lote.latitud,
      longitud:  lote.longitud,
    } : undefined,
  })

  const onSubmit = async (data: FormData) => {
    if (lote) {
      await updateLote.mutateAsync({ id: lote.id, data })
    } else {
      await createLote.mutateAsync(data)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground">
        {lote ? 'Editar lote' : 'Nuevo lote'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
        <input
          {...register('nombre')}
          className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          placeholder="Ej: Lote Norte"
        />
        {errors.nombre && <p className="mt-1 text-xs text-destructive">{errors.nombre.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Área (ha)</label>
          <input
            {...register('area', { valueAsNumber: true })}
            type="number" step="0.01"
            className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="120.5"
          />
          {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Cultivo</label>
          <select
            {...register('cultivo')}
            className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          >
            <option value="">Seleccionar...</option>
            {CULTIVOS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.cultivo && <p className="mt-1 text-xs text-destructive">{errors.cultivo.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Temporada</label>
        <input
          {...register('temporada')}
          className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          placeholder="2024/2025"
        />
        {errors.temporada && <p className="mt-1 text-xs text-destructive">{errors.temporada.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Latitud (opcional)</label>
          <input
            {...register('latitud', { valueAsNumber: true })}
            type="number" step="0.0000001"
            className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="-34.6037"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Longitud (opcional)</label>
          <input
            {...register('longitud', { valueAsNumber: true })}
            type="number" step="0.0000001"
            className="w-full h-12 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="-58.3816"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button" onClick={onClose}
          className="flex-1 h-11 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted/20 transition-colors duration-150"
        >
          Cancelar
        </button>
        <button
          type="submit" disabled={isPending}
          className="flex-1 h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity duration-200"
        >
          {isPending ? 'Guardando...' : lote ? 'Guardar cambios' : 'Crear lote'}
        </button>
      </div>
    </form>
  )
}
