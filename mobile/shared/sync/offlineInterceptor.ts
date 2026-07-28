import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { apiClient } from '../api/client'
import { enqueueOutbox } from './outbox'
import { uuid } from './uuid'

// Extiende la config de axios con el flag que usa el drenado del outbox
// para que sus propios requests no se re-encolen ante un fallo de red.
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipOutbox?: boolean
  }
}

type OfflineRule = { pattern: RegExp; label: string }

// Allowlist de mutaciones que pueden operar offline (feature 24):
// agricultura, ganaderia y operarios. DELETE queda excluido a proposito.
export const RULES: OfflineRule[] = [
  { pattern: /^\/agricola\/lotes(\/[^/]+)?$/, label: 'Lote' },
  { pattern: /^\/agricola\/siembra(\/[^/]+)?$/, label: 'Evento de siembra' },
  { pattern: /^\/agricola\/cosecha(\/[^/]+)?$/, label: 'Registro de cosecha' },
  { pattern: /^\/agricola\/suelo(\/[^/]+)?$/, label: 'Propiedad de suelo' },
  { pattern: /^\/agricola\/historial(\/[^/]+)?$/, label: 'Historial de cultivo' },
  { pattern: /^\/agricola\/plagas\/catalogo$/, label: 'Catalogo de plaga' },
  { pattern: /^\/agricola\/plagas\/detecciones$/, label: 'Deteccion de plaga' },
  { pattern: /^\/agricola\/plagas\/detecciones\/[^/]+\/aplicaciones$/, label: 'Aplicacion fitosanitaria' },
  { pattern: /^\/agricola\/plagas\/detecciones\/[^/]+\/seguimientos$/, label: 'Seguimiento de plaga' },
  // La regla de alertas va ANTES que la de potrero: la regex de potrero tambien matchea /alertas y find devuelve la primera.
  { pattern: /^\/ganaderia\/potreros\/alertas$/, label: 'Alerta de potrero' },
  { pattern: /^\/ganaderia\/potreros(\/[^/]+)?$/, label: 'Potrero' },
  { pattern: /^\/ganaderia\/trazabilidad\/animales$/, label: 'Animal' },
  { pattern: /^\/ganaderia\/reproduccion\/montas$/, label: 'Monta' },
  { pattern: /^\/ganaderia\/reproduccion\/inseminaciones$/, label: 'Inseminacion' },
  { pattern: /^\/ganaderia\/reproduccion\/prenez$/, label: 'Control de preñez' },
  { pattern: /^\/ganaderia\/reproduccion\/partos$/, label: 'Parto' },
  { pattern: /^\/ganaderia\/reproduccion\/indices$/, label: 'Indice genetico' },
  { pattern: /^\/ganaderia\/sanidad\/vacunas$/, label: 'Vacuna' },
  { pattern: /^\/ganaderia\/sanidad\/aplicaciones$/, label: 'Aplicacion de vacuna' },
  { pattern: /^\/ganaderia\/sanidad\/tratamientos$/, label: 'Tratamiento' },
  { pattern: /^\/ganaderia\/sanidad\/diagnosticos$/, label: 'Diagnostico' },
  { pattern: /^\/ganaderia\/alimentacion\/dietas$/, label: 'Dieta' },
  { pattern: /^\/ganaderia\/alimentacion\/registros$/, label: 'Suministro' },
  { pattern: /^\/ganaderia\/alimentacion\/pesajes$/, label: 'Pesaje' },
]

let onEnqueued: (() => void) | null = null

export function setOnOfflineEnqueued(callback: (() => void) | null) {
  onEnqueued = callback
}

// Interceptor de respuesta: si un POST/PUT allowlisted falla a nivel de red
// (nunca llego al servidor), se encola en el outbox y se devuelve una respuesta
// sintetica con ID temporal para que el formulario resuelva igual que online.
export function setupOfflineOutbox() {
  apiClient.interceptors.response.use(undefined, async (error: { config?: InternalAxiosRequestConfig; response?: unknown }) => {
    const config = error?.config
    if (!config || config.skipOutbox || error.response) throw error

    const method = config.method?.toLowerCase()
    if (method !== 'post' && method !== 'put') throw error

    const url = config.url ?? ''
    const rule = RULES.find((candidate) => candidate.pattern.test(url))
    if (!rule) throw error

    const payload = parsePayload(config.data)
    const isCreate = method === 'post'
    const tempId = isCreate ? `temp-${uuid()}` : undefined

    await enqueueOutbox({
      opId: uuid(),
      method,
      url,
      payload,
      entityLabel: rule.label,
      tempId,
    })
    onEnqueued?.()

    const entity = {
      ...(typeof payload === 'object' && payload !== null ? payload : {}),
      id: tempId ?? idFromUrl(url),
      __offlinePending: true,
    }

    return {
      data: { data: entity },
      status: 202,
      statusText: 'Encolado offline',
      headers: {},
      config,
    } satisfies AxiosResponse
  })
}

function parsePayload(data: unknown): unknown {
  if (typeof data !== 'string') return data ?? null
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

function idFromUrl(url: string): string {
  const segments = url.split('/').filter(Boolean)
  return segments[segments.length - 1] ?? ''
}
