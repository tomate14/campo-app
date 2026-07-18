import AsyncStorage from '@react-native-async-storage/async-storage'
import type { QueryClient } from '@tanstack/react-query'
import { getDeteccionesPlaga, getLotes } from '../api/agricola'
import {
  getAlertasPotreros,
  getAnimales,
  getAplicaciones,
  getDiagnosticos,
  getDietas,
  getHistorialMedico,
  getMovimientos,
  getPesajes,
  getPotreros,
  getPotrerosMapa,
  getRazasBovinas,
  getTratamientos,
  getVacunas,
} from '../api/ganaderia'
import { getOperarios } from '../api/operarios'

const LAST_SYNC_KEY = 'sync_last_down_v1'

// Replica local de datos de referencia (feature 24). Cada dataset usa exactamente
// la misma query key que su hook para que pantallas y selectores lean la replica
// sin cambios. Orden = prioridad de descarga (primero lo operativo).
const DATASETS: Array<{ queryKey: unknown[]; fetch: () => Promise<unknown> }> = [
  { queryKey: ['lotes', undefined], fetch: () => getLotes() },
  { queryKey: ['potreros', 'mapa'], fetch: () => getPotrerosMapa() },
  { queryKey: ['potreros', 'lista'], fetch: () => getPotreros() },
  { queryKey: ['animales', undefined], fetch: () => getAnimales() },
  { queryKey: ['operarios', { estado: 'ACTIVO' }], fetch: () => getOperarios({ estado: 'ACTIVO' }) },
  { queryKey: ['operarios', { estado: 'ACTIVO', rol: 'VETERINARIO' }], fetch: () => getOperarios({ estado: 'ACTIVO', rol: 'VETERINARIO' }) },
  { queryKey: ['vacunas-catalogo'], fetch: () => getVacunas() },
  { queryKey: ['razas-bovinas'], fetch: () => getRazasBovinas() },
  { queryKey: ['dietas'], fetch: () => getDietas() },
  { queryKey: ['plagas-detecciones'], fetch: () => getDeteccionesPlaga() },
  { queryKey: ['potreros-alertas', { estado: 'ABIERTA' }], fetch: () => getAlertasPotreros({ estado: 'ABIERTA' }) },
  // Historiales del animal replicados para lectura offline (feature 50); candidato a delta sync si el volumen crece.
  { queryKey: ['animal-historial', 'CLINICO'], fetch: () => getHistorialMedico() },
  { queryKey: ['animal-historial', 'PESOS'], fetch: () => getPesajes() },
  { queryKey: ['animal-historial', 'MOVIMIENTOS'], fetch: () => getMovimientos() },
  { queryKey: ['animal-historial', 'VACUNAS'], fetch: () => getAplicaciones() },
  { queryKey: ['animal-historial', 'TRATAMIENTOS'], fetch: () => getTratamientos() },
  { queryKey: ['animal-historial', 'DIAGNOSTICOS'], fetch: () => getDiagnosticos() },
]

let lastSyncAt: string | null | undefined
let syncing = false
const listeners = new Set<() => void>()

export async function runSyncDown(queryClient: QueryClient): Promise<boolean> {
  if (syncing) return false
  syncing = true
  notify()

  try {
    for (const dataset of DATASETS) {
      await queryClient.fetchQuery({
        queryKey: dataset.queryKey,
        queryFn: dataset.fetch,
        staleTime: 0,
      })
    }
    lastSyncAt = new Date().toISOString()
    await AsyncStorage.setItem(LAST_SYNC_KEY, lastSyncAt)
    return true
  } catch {
    // Sin red o backend caido: se corta y se reintenta en el proximo disparador.
    return false
  } finally {
    syncing = false
    notify()
  }
}

export async function getLastSyncAt(): Promise<string | null> {
  if (lastSyncAt === undefined) {
    lastSyncAt = await AsyncStorage.getItem(LAST_SYNC_KEY)
  }
  return lastSyncAt
}

export function isSyncingDown(): boolean {
  return syncing
}

export function subscribeSyncDown(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach((listener) => listener())
}
