export type NdviManifestItem = {
  loteId: string
  loteNombre: string
  disponible: boolean
  generadoAt: string | null
  version: string | null
  imagenUrl: string | null
}

export type NdviCachedItem = {
  loteId: string
  loteNombre: string
  generadoAt: string
  version: string
  localUri: string
}

export type NdviCacheManifest = Record<string, NdviCachedItem>

export type NdviOverlay = NdviCachedItem

