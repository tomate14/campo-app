import type { DeteccionPlaga, Lote } from '../types/agricola'

export type MapPoint = {
  latitude: number
  longitude: number
}

export type MapRegion = MapPoint & {
  latitudeDelta: number
  longitudeDelta: number
}

export type LoteMapItem = {
  lote: Lote
  color: string
  polygon: MapPoint[]
  center: MapPoint
}

export type DeteccionMapItem = {
  deteccion: DeteccionPlaga
  detecciones: DeteccionPlaga[]
  color: string
  coordinate: MapPoint
}

export type MapCommand = {
  id: number
  type: 'fit' | 'user' | 'zoom-in' | 'zoom-out'
}

export type MapMode = 'satellite' | 'standard' | 'hybrid' | 'terrain'

export type LotesFieldMapProps = {
  mapItems: LoteMapItem[]
  detections: DeteccionMapItem[]
  initialRegion: MapRegion
  userCoords: MapPoint | null
  locationGranted: boolean
  command: MapCommand | null
  mapMode: MapMode
  onLotePress: (id: string) => void
  onDetectionPress: (detecciones: DeteccionPlaga[]) => void
}
