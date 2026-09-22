import type { NdviCacheManifest, NdviCachedItem, NdviManifestItem } from './ndvi.types'

export type NdviCachePlan = {
  downloads: NdviManifestItem[]
  retained: NdviCachedItem[]
  removals: NdviCachedItem[]
}

export function buildNdviCachePlan(server: NdviManifestItem[], local: NdviCacheManifest): NdviCachePlan {
  const activeIds = new Set(server.map((item) => item.loteId))
  const downloads = server.filter((item) => {
    if (!item.disponible || !item.version || !item.imagenUrl || !item.generadoAt) return false
    return local[item.loteId]?.version !== item.version
  })
  const retained = server
    .filter((item) => item.disponible && item.version && local[item.loteId]?.version === item.version)
    .map((item) => local[item.loteId])
  const removals = Object.values(local).filter((item) => !activeIds.has(item.loteId))

  return { downloads, retained, removals }
}

