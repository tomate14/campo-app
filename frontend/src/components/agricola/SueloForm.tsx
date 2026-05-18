'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { PropiedadSueloRequest } from '@/lib/types/agricola'

const schema = z.object({
  loteId: z.string(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  ph: z.number({ coerce: true }).min(0).max(14).optional().or(z.literal('')),
  nitrogenoKgHa: z.number({ coerce: true }).min(0).optional().or(z.literal('')),
  fosforoKgHa: z.number({ coerce: true }).min(0).optional().or(z.literal('')),
  potasioKgHa: z.number({ coerce: true }).min(0).optional().or(z.literal('')),
  materiaOrganicaPct: z.number({ coerce: true }).min(0).max(100).optional().or(z.literal('')),
  conductividadElectrica: z.number({ coerce: true }).min(0).optional().or(z.literal('')),
  observaciones: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  loteId: string
  onSubmit: (data: PropiedadSueloRequest) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function SueloForm({ loteId, onSubmit, onCancel, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { loteId, fecha: new Date().toISOString().split('T')[0] },
  })

  const onValid = (values: FormValues) => {
    const clean = (v: number | '' | undefined) => (v === '' || v === undefined ? undefined : Number(v))
    onSubmit({
      loteId: values.loteId,
      fecha: values.fecha,
      ph: clean(values.ph as number | ''),
      nitrogenoKgHa: clean(values.nitrogenoKgHa as number | ''),
      fosforoKgHa: clean(values.fosforoKgHa as number | ''),
      potasioKgHa: clean(values.potasioKgHa as number | ''),
      materiaOrganicaPct: clean(values.materiaOrganicaPct as number | ''),
      conductividadElectrica: clean(values.conductividadElectrica as number | ''),
      observaciones: values.observaciones || undefined,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="rounded-xl border border-border bg-white p-5 dark:bg-foreground/5 space-y-4"
    >
      <h3 className="font-semibold text-foreground">Nuevo análisis de suelo</h3>
      <input type="hidden" {...register('loteId')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fecha *" error={errors.fecha?.message}>
          <input type="date" {...register('fecha')} className="field-input" />
        </Field>
        <Field label="pH (0–14)" error={errors.ph?.message}>
          <input type="number" step="0.1" {...register('ph')} className="field-input" placeholder="Ej: 6.5" />
        </Field>
        <Field label="Nitrógeno (kg/ha)" error={errors.nitrogenoKgHa?.message}>
          <input type="number" step="0.1" {...register('nitrogenoKgHa')} className="field-input" />
        </Field>
        <Field label="Fósforo (kg/ha)" error={errors.fosforoKgHa?.message}>
          <input type="number" step="0.1" {...register('fosforoKgHa')} className="field-input" />
        </Field>
        <Field label="Potasio (kg/ha)" error={errors.potasioKgHa?.message}>
          <input type="number" step="0.1" {...register('potasioKgHa')} className="field-input" />
        </Field>
        <Field label="Materia orgánica (%)" error={errors.materiaOrganicaPct?.message}>
          <input type="number" step="0.01" {...register('materiaOrganicaPct')} className="field-input" />
        </Field>
        <Field label="Conductividad eléctrica (dS/m)" error={errors.conductividadElectrica?.message}>
          <input type="number" step="0.01" {...register('conductividadElectrica')} className="field-input" />
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
          {isLoading ? 'Guardando...' : 'Guardar análisis'}
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
