import { useEffect, useRef, useState, type ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView, { Circle, Marker, Polygon } from 'react-native-maps'
import type { LatLng, MapMarkerProps, Region } from 'react-native-maps'
import type { LotesFieldMapProps, MapMode, MapPoint, MapRegion } from './lotes-field-map.types'

export default function LotesFieldMap({
  mapItems,
  detections,
  alertas = [],
  initialRegion,
  userCoords,
  locationGranted,
  command,
  mapMode,
  showAffectedArea = true,
  onLotePress,
  onDetectionPress,
  onAlertaPress,
}: LotesFieldMapProps) {
  const mapRef = useRef<MapView | null>(null)

  useEffect(() => {
    if (!mapItems.length || !mapRef.current) return
    mapRef.current.animateToRegion(toNativeRegion(initialRegion), 450)
  }, [initialRegion, mapItems.length])

  useEffect(() => {
    if (!command || !mapRef.current) return

    if (command.type === 'fit') {
      mapRef.current.animateToRegion(toNativeRegion(initialRegion), 350)
      return
    }

    if (command.type === 'user' && userCoords) {
      mapRef.current.animateToRegion({ ...toNativePoint(userCoords), latitudeDelta: 0.015, longitudeDelta: 0.015 }, 350)
      return
    }

    if (command.type === 'zoom-in') {
      void zoomMap(0.55, mapRef.current)
      return
    }

    if (command.type === 'zoom-out') {
      void zoomMap(1.6, mapRef.current)
    }
  }, [command, initialRegion, userCoords])

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType={toNativeMapType(mapMode)}
      initialRegion={toNativeRegion(initialRegion)}
      showsUserLocation={locationGranted}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
    >
      {mapItems.map((item) => (
        <View key={item.lote.id}>
          <Polygon
            coordinates={item.polygon.map(toNativePoint)}
            strokeColor={item.color}
            fillColor={`${item.color}3D`}
            strokeWidth={2.4}
            tappable
            onPress={() => onLotePress(item.lote.id)}
          />
          <TrackedMarker
            coordinate={item.center}
            title={item.lote.nombre}
            description={`${item.lote.area} ha`}
            contentKey={`${item.lote.id}|${item.lote.nombre}|${item.lote.area}`}
          >
            <View style={styles.marker}>
              <Text style={styles.markerTitle}>{item.lote.nombre}</Text>
              <Text style={styles.markerArea}>{item.lote.area} ha</Text>
            </View>
          </TrackedMarker>
        </View>
      ))}

      {/* Feature 57: circulo proporcional al area afectada (radio en metros). */}
      {showAffectedArea &&
        detections.map((item) => {
          const areaHa = Number(item.deteccion.areaAfectadaHa)
          if (!Number.isFinite(areaHa) || areaHa <= 0) return null
          return (
            <Circle
              key={`area-${item.deteccion.id}`}
              center={item.coordinate}
              radius={Math.sqrt((areaHa * 10000) / Math.PI)}
              strokeColor={item.color}
              fillColor={`${item.color}22`}
              strokeWidth={1.6}
              zIndex={10}
            />
          )
        })}

      {/* Pines nativos (pinColor): react-native-maps los ancla a la coordenada de forma nativa,
          sin rasterizar una vista React con react-native-svg (que en Android/Google Maps "flota"
          al hacer zoom). El color codifica la severidad; el tap abre el preview con el grupo. */}
      {detections.map((item) => (
        <Marker
          key={item.deteccion.id}
          identifier={item.deteccion.id}
          coordinate={item.coordinate}
          pinColor={item.color}
          zIndex={20}
          onPress={(event) => {
            event.stopPropagation()
            onDetectionPress(item.detecciones)
          }}
        />
      ))}

      {alertas.map((item) => (
        <Marker
          key={item.alerta.id}
          identifier={item.alerta.id}
          coordinate={item.coordinate}
          pinColor={item.color}
          zIndex={22}
          onPress={(event) => {
            event.stopPropagation()
            onAlertaPress?.(item.alertas)
          }}
        />
      ))}
    </MapView>
  )
}

// Marker que queda FIJO en su coordenada al hacer zoom. En react-native-maps, un marker con vista
// custom y tracksViewChanges=true se re-renderiza cada frame y su bitmap se desplaza respecto de la
// proyeccion ("flota"); ademas, en Android, sin `collapsable={false}` la vista del marker se colapsa
// y se posiciona mal. Aca: (a) envolvemos el contenido en un View `collapsable={false}`, y (b)
// congelamos `tracksViewChanges` por-marker (true al montar/cambiar contenido, false tras 400ms).
function TrackedMarker({
  children,
  contentKey,
  ...markerProps
}: MapMarkerProps & { children: ReactNode; contentKey?: string | number }) {
  const [tracks, setTracks] = useState(true)

  useEffect(() => {
    setTracks(true)
    const timer = setTimeout(() => setTracks(false), 400)
    return () => clearTimeout(timer)
  }, [contentKey])

  return (
    <Marker {...markerProps} tracksViewChanges={tracks}>
      <View collapsable={false}>{children}</View>
    </Marker>
  )
}

function toNativeMapType(mode: MapMode) {
  if (mode === 'standard') return 'standard'
  if (mode === 'hybrid') return 'hybrid'
  if (mode === 'terrain') return 'terrain'
  return 'satellite'
}

function toNativePoint(point: MapPoint): LatLng {
  return { latitude: point.latitude, longitude: point.longitude }
}

function toNativeRegion(region: MapRegion): Region {
  return {
    latitude: region.latitude,
    longitude: region.longitude,
    latitudeDelta: region.latitudeDelta,
    longitudeDelta: region.longitudeDelta,
  }
}

async function zoomMap(multiplier: number, map: MapView | null) {
  if (!map) return
  const camera = await map.getCamera()
  const center = camera.center
  if (!center) return
  const currentRegion = await map.getMapBoundaries()
  const latitudeDelta = Math.abs(currentRegion.northEast.latitude - currentRegion.southWest.latitude) * multiplier
  const longitudeDelta = Math.abs(currentRegion.northEast.longitude - currentRegion.southWest.longitude) * multiplier
  map.animateToRegion({
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: Math.max(latitudeDelta, 0.002),
    longitudeDelta: Math.max(longitudeDelta, 0.002),
  }, 250)
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    minWidth: 78,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(8, 18, 37, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  markerTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  markerArea: {
    color: '#DCE8F8',
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
  },
  pinWrap: {
    width: 52,
    height: 64,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pinGlow: {
    position: 'absolute',
    top: 2,
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.22,
    transform: [{ scale: 1.15 }],
  },
  pinHead: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 23, 48, 0.94)',
    borderWidth: 2,
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  pinCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 21,
    height: 21,
    paddingHorizontal: 5,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1730',
    borderWidth: 1,
  },
  pinCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  pinTip: {
    width: 0,
    height: 0,
    marginTop: -7,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pinTipInner: {
    position: 'absolute',
    bottom: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
})
