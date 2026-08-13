import { useEffect, useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeoJSONSourceSpecification, LngLatBoundsLike, Map as MapLibreMap, Marker, StyleSpecification } from 'maplibre-gl'
import type { FeatureCollection, Polygon } from 'geojson'
import type { LotesFieldMapProps, MapMode, MapPoint, MapRegion } from './lotes-field-map.types'

function buildStyle(mode: MapMode): StyleSpecification {
  const satellite = mode === 'satellite' || mode === 'hybrid'
  const terrain = mode === 'terrain'
  const tiles = satellite
    ? ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']
    : ['https://tile.openstreetmap.org/{z}/{x}/{y}.png']
  const attribution = satellite ? 'Esri World Imagery' : 'OpenStreetMap'

  return {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    base: {
      type: 'raster',
      tiles,
      tileSize: 256,
      attribution,
    },
  },
  layers: [
    { id: 'base', type: 'raster', source: 'base', paint: { 'raster-saturation': terrain ? -0.25 : 0 } },
  ],
}
}

export default function LotesFieldMap({
  mapItems,
  detections,
  alertas = [],
  initialRegion,
  userCoords,
  command,
  mapMode,
  showAffectedArea = true,
  onLotePress,
  onDetectionPress,
  onAlertaPress,
}: LotesFieldMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const detectionMarkersRef = useRef<Marker[]>([])
  const detectionsRef = useRef(detections)
  const alertMarkersRef = useRef<Marker[]>([])
  const alertasRef = useRef(alertas)
  // Fix (feature 57): encuadrar el mapa UNA sola vez al cargar. Antes se llamaba fitToRegion en
  // cada cambio de initialRegion (referencia inestable), re-centrando el mapa continuamente y
  // "arrastrando" los pines al hacer zoom.
  const hasFittedRef = useRef(false)
  const sourceData = useMemo(() => toFeatureCollection(mapItems), [mapItems])
  // Feature 57: circulos de area afectada como poligonos GeoJSON (radio en metros).
  const affectedData = useMemo(
    () => toAffectedAreas(showAffectedArea ? detections : []),
    [detections, showAffectedArea]
  )

  useEffect(() => {
    detectionsRef.current = detections
  }, [detections])

  useEffect(() => {
    alertasRef.current = alertas
  }, [alertas])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(mapMode),
      center: [initialRegion.longitude, initialRegion.latitude],
      zoom: regionToZoom(initialRegion),
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    mapRef.current = map

    map.on('load', () => {
      map.addSource('lotes', { type: 'geojson', data: sourceData } satisfies GeoJSONSourceSpecification)
      map.addSource('affected-areas', { type: 'geojson', data: affectedData } satisfies GeoJSONSourceSpecification)
      map.addLayer({
        id: 'lotes-fill',
        type: 'fill',
        source: 'lotes',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.24,
        },
      })
      map.addLayer({
        id: 'lotes-line',
        type: 'line',
        source: 'lotes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.4,
          'line-opacity': 0.92,
        },
      })
      map.addLayer({
        id: 'affected-fill',
        type: 'fill',
        source: 'affected-areas',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.14,
        },
      })
      map.addLayer({
        id: 'affected-line',
        type: 'line',
        source: 'affected-areas',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.6,
          'line-opacity': 0.85,
        },
      })
      map.addLayer({
        id: 'lotes-label',
        type: 'symbol',
        source: 'lotes',
        layout: {
          'text-field': ['concat', ['get', 'nombre'], '\n', ['get', 'area'], ' ha'],
          'text-size': 12,
          'text-font': ['Open Sans Semibold'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#081225',
          'text-halo-width': 1.5,
        },
      })
      map.on('click', 'lotes-fill', (event) => {
        const feature = event.features?.[0]
        const id = feature?.properties?.id
        if (typeof id === 'string') onLotePress(id)
      })
      map.on('mouseenter', 'lotes-fill', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'lotes-fill', () => { map.getCanvas().style.cursor = '' })
      syncDetectionMarkers(map, detectionsRef.current, onDetectionPress, detectionMarkersRef)
      syncAlertMarkers(map, alertasRef.current, onAlertaPress, alertMarkersRef)
      fitToRegion(map, initialRegion)
    })

    return () => {
      detectionMarkersRef.current.forEach((marker) => marker.remove())
      detectionMarkersRef.current = []
      alertMarkersRef.current.forEach((marker) => marker.remove())
      alertMarkersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const source = map.getSource('lotes') as maplibregl.GeoJSONSource | undefined
    source?.setData(sourceData)
    const affectedSource = map.getSource('affected-areas') as maplibregl.GeoJSONSource | undefined
    affectedSource?.setData(affectedData)
    syncDetectionMarkers(map, detections, onDetectionPress, detectionMarkersRef)
    syncAlertMarkers(map, alertas, onAlertaPress, alertMarkersRef)
    // Encuadre automatico SOLO la primera vez que hay datos; despues no re-centrar (respeta el
    // zoom/pan del usuario). El encuadre manual sigue disponible via command.type === 'fit'.
    if (!hasFittedRef.current && mapItems.length) {
      fitToRegion(map, initialRegion)
      hasFittedRef.current = true
    }
  }, [sourceData, affectedData, detections, alertas, mapItems.length])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !command) return

    if (command.type === 'fit') {
      fitToRegion(map, initialRegion)
      return
    }

    if (command.type === 'user' && userCoords) {
      map.flyTo({ center: [userCoords.longitude, userCoords.latitude], zoom: 16, essential: true })
      return
    }

    if (command.type === 'zoom-in') {
      map.zoomIn()
      return
    }

    if (command.type === 'zoom-out') {
      map.zoomOut()
    }
  }, [command, initialRegion, userCoords])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !userCoords) return

    const existing = document.getElementById('campo-user-location-marker')
    existing?.remove()

    const marker = document.createElement('div')
    marker.id = 'campo-user-location-marker'
    marker.style.width = '16px'
    marker.style.height = '16px'
    marker.style.borderRadius = '999px'
    marker.style.background = '#6EA8FF'
    marker.style.border = '3px solid #FFFFFF'
    marker.style.boxShadow = '0 0 24px rgba(110,168,255,0.55)'

    new maplibregl.Marker({ element: marker })
      .setLngLat([userCoords.longitude, userCoords.latitude])
      .addTo(map)
  }, [userCoords])

  return <div ref={containerRef} style={containerStyle} />
}

function toFeatureCollection(mapItems: LotesFieldMapProps['mapItems']): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: mapItems.map((item) => ({
      type: 'Feature',
      properties: {
        id: item.lote.id,
        nombre: item.lote.nombre,
        area: item.lote.area,
        color: item.color,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [closeRing(item.polygon).map((point) => [point.longitude, point.latitude])],
      },
    })),
  }
}

// Feature 57: convierte cada deteccion con area afectada en un poligono circular
// (aprox. de 48 lados) cuyo radio en metros representa la superficie afectada.
function toAffectedAreas(detections: LotesFieldMapProps['detections']): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: detections
      .map((item) => {
        const areaHa = Number(item.deteccion.areaAfectadaHa)
        if (!Number.isFinite(areaHa) || areaHa <= 0) return null
        const radius = Math.sqrt((areaHa * 10000) / Math.PI)
        return {
          type: 'Feature' as const,
          properties: { color: item.color },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [circleRing(item.coordinate, radius)],
          },
        }
      })
      .filter((feature): feature is NonNullable<typeof feature> => Boolean(feature)),
  }
}

// Anillo de coordenadas [lng, lat] que aproxima un circulo geografico de radio en metros.
function circleRing(center: MapPoint, radiusMeters: number, steps = 48): number[][] {
  const earth = 6378137
  const latRad = (center.latitude * Math.PI) / 180
  const ring: number[][] = []
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * 2 * Math.PI
    const dx = radiusMeters * Math.cos(angle)
    const dy = radiusMeters * Math.sin(angle)
    const dLng = (dx / (earth * Math.cos(latRad))) * (180 / Math.PI)
    const dLat = (dy / earth) * (180 / Math.PI)
    ring.push([center.longitude + dLng, center.latitude + dLat])
  }
  return ring
}

function closeRing(points: MapPoint[]): MapPoint[] {
  if (!points.length) return []
  const first = points[0]
  const last = points[points.length - 1]
  if (first.latitude === last.latitude && first.longitude === last.longitude) return points
  return [...points, first]
}

function syncDetectionMarkers(
  map: MapLibreMap,
  detections: LotesFieldMapProps['detections'],
  onDetectionPress: LotesFieldMapProps['onDetectionPress'],
  markersRef: MutableRefObject<Marker[]>
) {
  markersRef.current.forEach((marker) => marker.remove())
  markersRef.current = detections.map((item) => {
    const element = createPinElement(item.color, iconSvgForType(item.deteccion.tipoNombre ?? item.deteccion.tipo), item.detecciones.length)
    element.addEventListener('click', (event) => {
      event.stopPropagation()
      onDetectionPress(item.detecciones)
    })
    return new maplibregl.Marker({ element, anchor: 'bottom' })
      .setLngLat([item.coordinate.longitude, item.coordinate.latitude])
      .addTo(map)
  })
}

// Pins de alertas de potrero (feature 47): campanita coloreada por gravedad.
function syncAlertMarkers(
  map: MapLibreMap,
  alertas: NonNullable<LotesFieldMapProps['alertas']>,
  onAlertaPress: LotesFieldMapProps['onAlertaPress'],
  markersRef: MutableRefObject<Marker[]>
) {
  markersRef.current.forEach((marker) => marker.remove())
  markersRef.current = alertas.map((item) => {
    const element = createPinElement(item.color, bellIconSvg(), item.alertas.length)
    element.addEventListener('click', (event) => {
      event.stopPropagation()
      onAlertaPress?.(item.alertas)
    })
    return new maplibregl.Marker({ element, anchor: 'bottom' })
      .setLngLat([item.coordinate.longitude, item.coordinate.latitude])
      .addTo(map)
  })
}

function createPinElement(color: string, iconSvg: string, count = 1) {
  const wrap = document.createElement('div')
  wrap.style.width = '52px'
  wrap.style.height = '64px'
  // MapLibre posiciona el elemento del marker con transform y su CSS lo pone en position:absolute.
  // Fix (feature 57): antes se forzaba position:relative, lo que pisaba ese absolute -> el marker
  // quedaba en flujo normal y se desplazaba distinto por pin, "flotando" al hacer zoom. Debe ser
  // absolute (ademas sirve de contexto de posicionamiento para los hijos glow/badge/tip).
  wrap.style.position = 'absolute'
  wrap.style.zIndex = '1200'
  wrap.style.display = 'flex'
  wrap.style.flexDirection = 'column'
  wrap.style.alignItems = 'center'
  wrap.style.cursor = 'pointer'
  wrap.style.pointerEvents = 'auto'
  wrap.style.filter = `drop-shadow(0 12px 24px ${toRgba(color, 0.36)})`

  const glow = document.createElement('div')
  glow.style.position = 'absolute'
  glow.style.top = '2px'
  glow.style.width = '52px'
  glow.style.height = '52px'
  glow.style.borderRadius = '999px'
  glow.style.background = color
  glow.style.opacity = '0.18'
  glow.style.transform = 'scale(1.18)'
  glow.style.filter = 'blur(2px)'

  const head = document.createElement('div')
  head.style.width = '52px'
  head.style.height = '52px'
  head.style.borderRadius = '999px'
  head.style.display = 'flex'
  head.style.alignItems = 'center'
  head.style.justifyContent = 'center'
  head.style.position = 'relative'
  head.style.background = 'rgba(11, 23, 48, 0.94)'
  head.style.border = `2px solid ${color}`
  head.style.boxShadow = `0 0 28px ${toRgba(color, 0.32)}, inset 0 1px 0 rgba(255,255,255,0.12)`
  head.innerHTML = iconSvg
  if (count > 1) {
    const badge = document.createElement('div')
    badge.textContent = String(count)
    badge.style.position = 'absolute'
    badge.style.top = '-6px'
    badge.style.right = '-6px'
    badge.style.minWidth = '21px'
    badge.style.height = '21px'
    badge.style.padding = '0 5px'
    badge.style.borderRadius = '999px'
    badge.style.display = 'flex'
    badge.style.alignItems = 'center'
    badge.style.justifyContent = 'center'
    badge.style.background = '#0B1730'
    badge.style.border = `1px solid ${color}`
    badge.style.color = '#FFFFFF'
    badge.style.fontSize = '10px'
    badge.style.fontWeight = '900'
    badge.style.boxSizing = 'border-box'
    head.appendChild(badge)
  }

  const tip = document.createElement('div')
  tip.style.width = '0'
  tip.style.height = '0'
  tip.style.marginTop = '-7px'
  tip.style.borderLeft = '10px solid transparent'
  tip.style.borderRight = '10px solid transparent'
  tip.style.borderTop = `16px solid ${color}`

  const tipInner = document.createElement('div')
  tipInner.style.position = 'absolute'
  tipInner.style.bottom = '4px'
  tipInner.style.width = '0'
  tipInner.style.height = '0'
  tipInner.style.borderLeft = '7px solid transparent'
  tipInner.style.borderRight = '7px solid transparent'
  tipInner.style.borderTop = '11px solid rgba(11, 23, 48, 0.96)'

  wrap.append(glow, head, tip, tipInner)
  return wrap
}

const SVG_COMMON = 'width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"'

// Campanita lucide (Bell) para los pins de alertas de potrero.
function bellIconSvg() {
  return `<svg ${SVG_COMMON}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`
}

function iconSvgForType(tipo?: string) {
  const common = SVG_COMMON
  const normalized = tipo?.toUpperCase()
  if (normalized === 'PLAGA') {
    return `<svg ${common}><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.8 3.8-4"/><path d="M17.47 9C19.4 8.8 21 7.1 21 5"/><path d="M18 13h4"/><path d="M21 21c0-2.1-1.7-3.8-3.8-4"/></svg>`
  }
  if (normalized === 'MALEZA') {
    return `<svg ${common}><path d="M17 14v6"/><path d="M7 14v6"/><path d="M12 20V8"/><path d="M12 8C8 8 6 6 6 3c3 0 6 2 6 5Z"/><path d="M12 8c4 0 6-2 6-5-3 0-6 2-6 5Z"/><path d="M7 14c-3 0-5-2-5-5 3 0 5 2 5 5Z"/><path d="M17 14c3 0 5-2 5-5-3 0-5 2-5 5Z"/></svg>`
  }
  if (normalized === 'ENFERMEDAD') {
    return `<svg ${common}><path d="M20 13c0 5-3.5 7.5-8 8.7C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`
  }
  return `<svg ${common}><circle cx="12" cy="12" r="8"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`
}

function toRgba(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function fitToRegion(map: MapLibreMap, region: MapRegion) {
  const west = region.longitude - region.longitudeDelta / 2
  const east = region.longitude + region.longitudeDelta / 2
  const south = region.latitude - region.latitudeDelta / 2
  const north = region.latitude + region.latitudeDelta / 2
  map.fitBounds([[west, south], [east, north]] as LngLatBoundsLike, { padding: 54, duration: 450 })
}

function regionToZoom(region: MapRegion) {
  const maxDelta = Math.max(region.latitudeDelta, region.longitudeDelta)
  if (maxDelta <= 0.01) return 16
  if (maxDelta <= 0.03) return 14
  if (maxDelta <= 0.08) return 12
  return 10
}

const containerStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
} as const
