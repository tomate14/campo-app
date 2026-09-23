import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import { getNdviManifest } from '../api/agricola'
import { resolveAssetUrl } from '../api/client'
import { readAccessToken } from '../auth/session'
import { buildNdviCachePlan } from './ndviCachePlan'
import type { NdviCacheManifest, NdviCachedItem, NdviOverlay } from './ndvi.types'

const MANIFEST_KEY = 'ndvi_cache_manifest_v1'
const CACHE_DIR = `${FileSystem.documentDirectory ?? ''}ndvi/`

export async function syncNdviCache(): Promise<NdviOverlay[]> {
  const serverManifest = await getNdviManifest()
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return []

  await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
  const localManifest = await readManifest()
  const plan = buildNdviCachePlan(serverManifest, localManifest)
  const nextManifest: NdviCacheManifest = { ...localManifest }
  const token = await readAccessToken()

  for (const item of plan.downloads) {
    if (!item.imagenUrl || !item.version || !item.generadoAt) continue
    const finalUri = `${CACHE_DIR}${item.loteId}-${sanitizeVersion(item.version)}.png`
    const temporaryUri = `${finalUri}.tmp`
    try {
      await deleteIfExists(temporaryUri)
      const result = await FileSystem.downloadAsync(resolveAssetUrl(item.imagenUrl)!, temporaryUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (result.status < 200 || result.status >= 300) {
        throw new Error(`Descarga NDVI rechazada con HTTP ${result.status}`)
      }
      await deleteIfExists(finalUri)
      await FileSystem.moveAsync({ from: temporaryUri, to: finalUri })

      const previous = nextManifest[item.loteId]
      nextManifest[item.loteId] = {
        loteId: item.loteId,
        loteNombre: item.loteNombre,
        generadoAt: item.generadoAt,
        version: item.version,
        localUri: finalUri,
      }
      if (previous?.localUri && previous.localUri !== finalUri) await deleteIfExists(previous.localUri)
    } catch {
      await deleteIfExists(temporaryUri)
      // Una descarga incompleta nunca invalida la imagen previamente instalada.
    }
  }

  for (const stale of plan.removals) {
    await deleteIfExists(stale.localUri)
    delete nextManifest[stale.loteId]
  }

  await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(nextManifest))
  return Object.values(nextManifest)
}

export async function getNdviOverlays(): Promise<NdviOverlay[]> {
  return Object.values(await readManifest())
}

export async function getNdviOverlay(loteId: string): Promise<NdviOverlay | null> {
  return (await readManifest())[loteId] ?? null
}

async function readManifest(): Promise<NdviCacheManifest> {
  const raw = await AsyncStorage.getItem(MANIFEST_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as NdviCacheManifest
  } catch {
    return {}
  }
}

async function deleteIfExists(uri: string) {
  const info = await FileSystem.getInfoAsync(uri)
  if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true })
}

function sanitizeVersion(version: string) {
  return version.replace(/[^a-zA-Z0-9_-]/g, '_')
}
