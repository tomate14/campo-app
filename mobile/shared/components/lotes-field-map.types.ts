import type { DeteccionPlaga, Lote } from '../types/agricola'
import type { AlertaPotrero } from '../types/ganaderia'

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

// Pin de alerta de potrero (feature 47): campanita agrupada por coordenada.
export type AlertaMapItem = {
  alerta: AlertaPotrero
  alertas: AlertaPotrero[]
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
  alertas?: AlertaMapItem[]
  initialRegion: MapRegion
  userCoords: MapPoint | null
  locationGranted: boolean
  command: MapCommand | null
  mapMode: MapMode
  // Feature 57: dibuja un circulo proporcional al area afectada de cada deteccion.
  showAffectedArea?: boolean
  onLotePress: (id: string) => void
  onDetectionPress: (detecciones: DeteccionPlaga[]) => void
  onAlertaPress?: (alertas: AlertaPotrero[]) => void
}
