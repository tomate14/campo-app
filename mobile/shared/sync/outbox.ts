import AsyncStorage from '@react-native-async-storage/async-storage'

export type OutboxStatus = 'PENDIENTE' | 'ERROR'

export interface OutboxItem {
  opId: string
  method: 'post' | 'put'
  url: string
  payload: unknown
  entityLabel: string
  tempId?: string
  status: OutboxStatus
  errorMessage?: string
  createdAt: string
  attempts: number
}

const STORAGE_KEY = 'sync_outbox_v1'

let cache: OutboxItem[] | null = null
const listeners = new Set<() => void>()

async function load(): Promise<OutboxItem[]> {
  if (cache) return cache
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    cache = raw ? (JSON.parse(raw) as OutboxItem[]) : []
  } catch {
    cache = []
  }
  return cache
}

async function persist(items: OutboxItem[]) {
  cache = items
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  listeners.forEach((listener) => listener())
}

export async function listOutbox(): Promise<OutboxItem[]> {
  return [...(await load())]
}

export async function enqueueOutbox(item: Omit<OutboxItem, 'status' | 'createdAt' | 'attempts'>) {
  const items = await load()
  await persist([
    ...items,
    { ...item, status: 'PENDIENTE', createdAt: new Date().toISOString(), attempts: 0 },
  ])
}

export async function removeOutboxItem(opId: string) {
  const items = await load()
  await persist(items.filter((item) => item.opId !== opId))
}

export async function patchOutboxItem(opId: string, patch: Partial<Pick<OutboxItem, 'status' | 'errorMessage' | 'attempts'>>) {
  const items = await load()
  await persist(items.map((item) => (item.opId === opId ? { ...item, ...patch } : item)))
}

// Reescribe las referencias a un ID temporal en los items pendientes (payload y URL)
// cuando el create original sincronizo y el servidor devolvio el ID real.
export async function replaceTempIdInOutbox(tempId: string, realId: string) {
  const items = await load()
  await persist(items.map((item) => ({
    ...item,
    url: item.url.split(tempId).join(realId),
    payload: JSON.parse(JSON.stringify(item.payload ?? null).split(tempId).join(realId)),
  })))
}

export async function outboxCounts(): Promise<{ pending: number; errors: number }> {
  const items = await load()
  return {
    pending: items.filter((item) => item.status === 'PENDIENTE').length,
    errors: items.filter((item) => item.status === 'ERROR').length,
  }
}

export function subscribeOutbox(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
