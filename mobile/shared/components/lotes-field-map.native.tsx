import { useEffect, useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, Polygon } from 'react-native-maps'
import type { LatLng, Region } from 'react-native-maps'
import { Crosshair } from 'lucide-react-native'
import type { LotesFieldMapProps, MapMode, MapPoint, MapRegion } from './lotes-field-map.types'

export default function LotesFieldMap({
  mapItems,
  detections,
  initialRegion,
  userCoords,
  locationGranted,
  command,
  mapMode,
  onLotePress,
  onDetectionPress,
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
          <Marker coordinate={toNativePoint(item.center)} title={item.lote.nombre} description={`${item.lote.area} ha`}>
            <View style={styles.marker}>
              <Text style={styles.markerTitle}>{item.lote.nombre}</Text>
              <Text style={styles.markerArea}>{item.lote.area} ha</Text>
            </View>
          </Marker>
        </View>
      ))}

      {detections.map((item) => (
        <Marker
          key={item.deteccion.id}
          coordinate={toNativePoint(item.coordinate)}
          onPress={(event) => {
            event.stopPropagation()
            onDetectionPress(item.deteccion)
          }}
        >
          <View style={[styles.detectionMarker, { borderColor: item.color, shadowColor: item.color }]}>
            <View style={[styles.detectionMarkerInner, { backgroundColor: item.color }]}>
              <Crosshair size={15} color="#07101F" strokeWidth={2.4} />
            </View>
          </View>
        </Marker>
      ))}
    </MapView>
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
  detectionMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 18, 37, 0.9)',
    borderWidth: 2,
    shadowOpacity: 0.38,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  detectionMarkerInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
