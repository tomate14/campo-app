import type { MapPoint } from '../components/lotes-field-map.types'
import type { Lote } from '../types/agricola'

export type NdviBounds = {
  northWest: MapPoint
  northEast: MapPoint
  southEast: MapPoint
  southWest: MapPoint
}

export function polygonToNdviBounds(polygon: MapPoint[]): NdviBounds {
  if (!polygon.length) throw new Error('El lote no tiene un poligono valido')

  const latitudes = polygon.map((point) => point.latitude)
  const longitudes = polygon.map((point) => point.longitude)
  const north = Math.max(...latitudes)
  const south = Math.min(...latitudes)
  const east = Math.max(...longitudes)
  const west = Math.min(...longitudes)

  return {
    northWest: { latitude: north, longitude: west },
    northEast: { latitude: north, longitude: east },
    southEast: { latitude: south, longitude: east },
    southWest: { latitude: south, longitude: west },
  }
}

export function findLoteForNdvi(lotes: Lote[], loteId: string): Lote | null {
  return lotes.find((lote) => lote.id === loteId) ?? null
}
