'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getLote } from '@/lib/api/agricola'
import { useSueloByLote, useCreateSuelo, useDeleteSuelo } from '@/lib/hooks/useSuelo'
import { useHistorialByLote, useRotacion, useCreateHistorico, useDeleteHistorico } from '@/lib/hooks/useHistorial'
import type { PropiedadSueloRequest, HistoricoCultivoRequest } from '@/lib/types/agricola'
import { LoteMapTab } from '@/components/agricola/LoteMapTab'
import { SueloForm } from '@/components/agricola/SueloForm'
import { HistorialForm } from '@/components/agricola/HistorialForm'

type Tab = 'info' | 'suelo' | 'historial' | 'mapa'

export default function LoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [showSueloForm, setShowSueloForm] = useState(false)
  const [showHistorialForm, setShowHistorialForm] = useState(false)

  const { data: lote, isLoading: loadingLote } = useQuery({
    queryKey: ['lote', id],
    queryFn: () => getLote(id),
    enabled: !!id,
  })

  const { data: suelo = [], isLoading: loadingSuelo } = useSueloByLote(id)
  const { data: historial = [], isLoading: loadingHistorial } = useHistorialByLote(id)
  const { data: rotacion } = useRotacion(id)

  const createSuelo = useCreateSuelo(id)
  const deleteSuelo = useDeleteSuelo(id)
  const createHistorico = useCreateHistorico(id)
  const deleteHistorico = useDeleteHistorico(id)

  if (loadingLote) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!lote) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-foreground/60">Lote no encontrado</p>
        <button onClick={() => router.push('/agricola/lotes')} className="btn-secondary">
          Volver a lotes
        </button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Información' },
    { id: 'suelo', label: 'Suelo' },
    { id: 'historial', label: 'Historial' },
    { id: 'mapa', label: 'Mapa' },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/agricola/lotes')}
            className="rounded-lg p-2 text-foreground/60 hover:bg-border/50 hover:text-foreground transition-colors"
            aria-label="Volver"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">{lote.nombre}</h1>
            <p className="text-sm text-foreground/60">{lote.cultivo} · {lote.temporada} · {lote.area} ha</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-border/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm dark:bg-foreground/10'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Cultivo" value={lote.cultivo} />
          <InfoCard label="Temporada" value={lote.temporada} />
          <InfoCard label="Superficie" value={`${lote.area} ha`} />
          {lote.latitud && <InfoCard label="Latitud" value={String(lote.latitud)} />}
          {lote.longitud && <InfoCard label="Longitud" value={String(lote.longitud)} />}
          <InfoCard label="Registrado" value={new Date(lote.createdAt).toLocaleDateString('es-AR')} />
        </div>
      )}

      {/* Suelo tab */}
      {activeTab === 'suelo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Análisis de Suelo</h2>
            <button
              onClick={() => setShowSueloForm(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              + Nuevo análisis
            </button>
          </div>

          {showSueloForm && (
            <SueloForm
              loteId={id}
              onSubmit={async (data: PropiedadSueloRequest) => {
                await createSuelo.mutateAsync(data)
                setShowSueloForm(false)
              }}
              onCancel={() => setShowSueloForm(false)}
              isLoading={createSuelo.isPending}
            />
          )}

          {loadingSuelo ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : suelo.length === 0 ? (
            <EmptyState message="No hay análisis de suelo registrados para este lote." />
          ) : (
            <div className="space-y-3">
              {suelo.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-white p-4 dark:bg-foreground/5">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-foreground">
                      {new Date(s.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <button
                      onClick={() => deleteSuelo.mutate(s.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
                    {s.ph !== undefined && <Metric label="pH" value={String(s.ph)} />}
                    {s.nitrogenoKgHa !== undefined && <Metric label="N (kg/ha)" value={String(s.nitrogenoKgHa)} />}
                    {s.fosforoKgHa !== undefined && <Metric label="P (kg/ha)" value={String(s.fosforoKgHa)} />}
                    {s.potasioKgHa !== undefined && <Metric label="K (kg/ha)" value={String(s.potasioKgHa)} />}
                    {s.materiaOrganicaPct !== undefined && <Metric label="M.O. (%)" value={String(s.materiaOrganicaPct)} />}
                    {s.conductividadElectrica !== undefined && <Metric label="CE (dS/m)" value={String(s.conductividadElectrica)} />}
                  </div>
                  {s.observaciones && (
                    <p className="mt-2 text-sm text-foreground/60">{s.observaciones}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Historial tab */}
      {activeTab === 'historial' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Historial de Cultivos</h2>
            <button
              onClick={() => setShowHistorialForm(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              + Registrar cultivo
            </button>
          </div>

          {/* Rotación recomendada */}
          {rotacion && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm font-semibold text-accent">Recomendación de rotación</p>
              {rotacion.ultimoCultivo && (
                <p className="mt-1 text-sm text-foreground/80">
                  Último cultivo: <span className="font-medium">{rotacion.ultimoCultivo}</span> ({rotacion.ultimaTemporada})
                </p>
              )}
              <p className="mt-1 text-sm text-foreground/70">{rotacion.razon}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {rotacion.cultivosRecomendados.map((c) => (
                  <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {showHistorialForm && (
            <HistorialForm
              loteId={id}
              onSubmit={async (data: HistoricoCultivoRequest) => {
                await createHistorico.mutateAsync(data)
                setShowHistorialForm(false)
              }}
              onCancel={() => setShowHistorialForm(false)}
              isLoading={createHistorico.isPending}
            />
          )}

          {loadingHistorial ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : historial.length === 0 ? (
            <EmptyState message="No hay historial de cultivos registrado para este lote." />
          ) : (
            <div className="space-y-3">
              {historial.map((h) => (
                <div key={h.id} className="rounded-xl border border-border bg-white p-4 dark:bg-foreground/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{h.cultivo}</p>
                      <p className="text-sm text-foreground/60">{h.temporada}</p>
                    </div>
                    <button
                      onClick={() => deleteHistorico.mutate(h.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    {h.fechaSiembra && (
                      <Metric label="Siembra" value={new Date(h.fechaSiembra).toLocaleDateString('es-AR')} />
                    )}
                    {h.fechaCosecha && (
                      <Metric label="Cosecha" value={new Date(h.fechaCosecha).toLocaleDateString('es-AR')} />
                    )}
                    {h.rendimientoKgHa !== undefined && (
                      <Metric label="Rend. (kg/ha)" value={String(h.rendimientoKgHa)} />
                    )}
                  </div>
                  {h.observaciones && (
                    <p className="mt-2 text-sm text-foreground/60">{h.observaciones}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mapa tab */}
      {activeTab === 'mapa' && (
        <LoteMapTab lote={lote} />
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 dark:bg-foreground/5">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background p-2">
      <p className="text-xs text-foreground/50">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
      <p className="text-sm text-foreground/50">{message}</p>
    </div>
  )
}
