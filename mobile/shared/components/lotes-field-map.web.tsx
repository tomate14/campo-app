import { useEffect, useMemo, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { GeoJSONSourceSpecification, LngLatBoundsLike, Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'
import type { FeatureCollection, Point, Polygon } from 'geojson'
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
  initialRegion,
  userCoords,
  command,
  mapMode,
  onLotePress,
  onDetectionPress,
}: LotesFieldMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const detectionsRef = useRef(detections)
  const sourceData = useMemo(() => toFeatureCollection(mapItems), [mapItems])
  const detectionData = useMemo(() => toDetectionFeatureCollection(detections), [detections])

  useEffect(() => {
    detectionsRef.current = detections
  }, [detections])

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
      map.addSource('detections', { type: 'geojson', data: detectionData } satisfies GeoJSONSourceSpecification)
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
      map.addLayer({
        id: 'detections-circle',
        type: 'circle',
        source: 'detections',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 9,
          'circle-opacity': 0.95,
          'circle-stroke-color': '#081225',
          'circle-stroke-width': 3,
        },
      })
      map.addLayer({
        id: 'detections-halo',
        type: 'circle',
        source: 'detections',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 17,
          'circle-opacity': 0.16,
        },
      }, 'detections-circle')

      map.on('click', 'lotes-fill', (event) => {
        const detectionsAtPoint = map.queryRenderedFeatures(event.point, { layers: ['detections-circle'] })
        if (detectionsAtPoint.length) return
        const feature = event.features?.[0]
        const id = feature?.properties?.id
        if (typeof id === 'string') onLotePress(id)
      })
      map.on('click', 'detections-circle', (event) => {
        event.preventDefault()
        const feature = event.features?.[0]
        const id = feature?.properties?.id
        const item = detectionsRef.current.find((detection) => detection.deteccion.id === id)
        if (item) onDetectionPress(item.deteccion)
      })
      map.on('mouseenter', 'lotes-fill', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'lotes-fill', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'detections-circle', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'detections-circle', () => { map.getCanvas().style.cursor = '' })
      fitToRegion(map, initialRegion)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const source = map.getSource('lotes') as maplibregl.GeoJSONSource | undefined
    source?.setData(sourceData)
    const detectionSource = map.getSource('detections') as maplibregl.GeoJSONSource | undefined
    detectionSource?.setData(detectionData)
    fitToRegion(map, initialRegion)
  }, [sourceData, detectionData, initialRegion])

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

function toDetectionFeatureCollection(detections: LotesFieldMapProps['detections']): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: detections.map((item) => ({
      type: 'Feature',
      properties: {
        id: item.deteccion.id,
        nombre: item.deteccion.plagaNombre,
        lote: item.deteccion.loteNombre,
        severidad: item.deteccion.severidad,
        estado: item.deteccion.estado,
        color: item.color,
      },
      geometry: {
        type: 'Point',
        coordinates: [item.coordinate.longitude, item.coordinate.latitude],
      },
    })),
  }
}

function closeRing(points: MapPoint[]): MapPoint[] {
  if (!points.length) return []
  const first = points[0]
  const last = points[points.length - 1]
  if (first.latitude === last.latitude && first.longitude === last.longitude) return points
  return [...points, first]
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
