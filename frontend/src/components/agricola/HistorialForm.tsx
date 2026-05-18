'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { HistoricoCultivoRequest } from '@/lib/types/agricola'

const schema = z.object({
  loteId: z.string(),
  cultivo: z.string().min(1, 'El cultivo es obligatorio').max(50),
  temporada: z.string().min(1, 'La temporada es obligatoria').max(20),
  fechaSiembra: z.string().optional(),
  fechaCosecha: z.string().optional(),
  rendimientoKgHa: z.number({ coerce: true }).min(0).optional().or(z.literal('')),
  observaciones: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const CULTIVOS = ['SOJA', 'MAIZ', 'TRIGO', 'GIRASOL', 'SORGO', 'OTRO']

interface Props {
  loteId: string
  onSubmit: (data: HistoricoCultivoRequest) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function HistorialForm({ loteId, onSubmit, onCancel, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { loteId },
  })

  const onValid = (values: FormValues) => {
    onSubmit({
      loteId: values.loteId,
      cultivo: values.cultivo,
      temporada: values.temporada,
      fechaSiembra: values.fechaSiembra || undefined,
      fechaCosecha: values.fechaCosecha || undefined,
      rendimientoKgHa: values.rendimientoKgHa === '' ? undefined : Number(values.rendimientoKgHa),
      observaciones: values.observaciones || undefined,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="rounded-xl border border-border bg-white p-5 dark:bg-foreground/5 space-y-4"
    >
      <h3 className="font-semibold text-foreground">Registrar cultivo histórico</h3>
      <input type="hidden" {...register('loteId')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cultivo *" error={errors.cultivo?.message}>
          <select {...register('cultivo')} className="field-input">
            <option value="">Seleccioná un cultivo</option>
            {CULTIVOS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Temporada *" error={errors.temporada?.message}>
          <input
            type="text"
            {...register('temporada')}
            className="field-input"
            placeholder="Ej: 2023/24"
          />
        </Field>
        <Field label="Fecha de siembra">
          <input type="date" {...register('fechaSiembra')} className="field-input" />
        </Field>
        <Field label="Fecha de cosecha">
          <input type="date" {...register('fechaCosecha')} className="field-input" />
        </Field>
        <Field label="Rendimiento (kg/ha)" error={errors.rendimientoKgHa?.message}>
          <input type="number" step="0.1" {...register('rendimientoKgHa')} className="field-input" />
        </Field>
      </div>

      <Field label="Observaciones">
        <textarea {...register('observaciones')} rows={2} className="field-input resize-none" />
      </Field>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Guardando...' : 'Registrar cultivo'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
