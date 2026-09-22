import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Leaf, Map as MapIcon, MapPinned, Mountain, Satellite, type LucideIcon } from 'lucide-react-native'
import LotesFieldMap from '../../shared/components/lotes-field-map'
import type { LoteMapItem, MapMode, MapRegion } from '../../shared/components/lotes-field-map.types'
import { getNdviOverlays } from '../../shared/ndvi/ndviCache'
import type { Lote } from '../../shared/types/agricola'
import { useLotes } from '../../shared/hooks/useLotes'
import { findLoteForNdvi } from '../../shared/ndvi/ndviGeometry'

const modes: Array<{ value: MapMode; label: string; Icon: LucideIcon }> = [
  { value: 'satellite', label: 'Satelite', Icon: Satellite },
  { value: 'standard', label: 'Mapa', Icon: MapIcon },
  { value: 'hybrid', label: 'Hibrido', Icon: MapPinned },
  { value: 'terrain', label: 'Terreno', Icon: Mountain },
  { value: 'ndvi', label: 'NDVI', Icon: Leaf },
]

export default function NdviLoteScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ loteId: string; loteNombre?: string }>()
  const [mapMode, setMapMode] = useState<MapMode>('ndvi')
  const { data: lotes = [], isLoading } = useLotes()
  const lote = findLoteForNdvi(lotes, params.loteId)
  const { data: overlays = [] } = useQuery({ queryKey: ['ndvi-cache'], queryFn: getNdviOverlays })
  const mapItem = useMemo(() => lote ? buildMapItem(lote) : null, [lote])
  const overlay = overlays.find((item) => item.loteId === params.loteId)

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#9FE870" /></View>
  }

  if (!lote || !mapItem) {
    return (
      <SafeAreaView style={styles.screen}>
        <Header title={params.loteNombre ?? 'NDVI'} onBack={() => router.back()} />
        <View style={styles.center}><Text style={styles.emptyTitle}>Lote sin poligono disponible</Text></View>
      </SafeAreaView>
    )
  }

  const region = regionFor(mapItem)
  return (
    <SafeAreaView style={styles.screen}>
      <Header title={lote.nombre} onBack={() => router.back()} />
      <View style={styles.mapWrap}>
        <LotesFieldMap
          key={mapMode}
          mapItems={[mapItem]}
          detections={[]}
          initialRegion={region}
          userCoords={null}
          locationGranted={false}
          command={null}
          mapMode={mapMode}
          ndviOverlays={overlays}
          onLotePress={() => undefined}
          onDetectionPress={() => undefined}
        />

        <View style={styles.modeBar}>
          {modes.map(({ value, label, Icon }) => (
            <Pressable key={value} style={[styles.mode, mapMode === value && styles.modeActive]} onPress={() => setMapMode(value)}>
              <Icon size={17} color={mapMode === value ? '#081225' : '#A6B0CF'} strokeWidth={2} />
              <Text style={[styles.modeLabel, mapMode === value && styles.modeLabelActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendHead}><Leaf size={18} color="#9FE870" /><Text style={styles.legendTitle}>Mapa de verdes NDVI</Text></View>
          {overlay ? (
            <>
              <View style={styles.gradient} />
              <View style={styles.scale}><Text style={styles.scaleText}>Suelo / bajo vigor</Text><Text style={styles.scaleText}>Alto vigor</Text></View>
              <Text style={styles.meta}>Sentinel-2 / Copernicus CDSE</Text>
              <Text style={styles.meta}>Actualizado {formatDate(overlay.generadoAt)}</Text>
            </>
          ) : (
            <Text style={styles.unavailable}>No hay una imagen NDVI descargada para este lote.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.back} onPress={onBack}><ChevronLeft size={22} color="#FFFFFF" /></Pressable>
      <View><Text style={styles.eyebrow}>Vigor vegetal</Text><Text style={styles.title}>{title}</Text></View>
    </View>
  )
}

function buildMapItem(lote: Lote): LoteMapItem | null {
  try {
    const parsed = JSON.parse(lote.poligono ?? '') as { coordinates?: number[][][] }
    const polygon = (parsed.coordinates?.[0] ?? []).map(([longitude, latitude]) => ({ latitude, longitude }))
    if (polygon.length < 3) return null
    const center = polygon.reduce((acc, point) => ({ latitude: acc.latitude + point.latitude / polygon.length, longitude: acc.longitude + point.longitude / polygon.length }), { latitude: 0, longitude: 0 })
    return { lote, polygon, center, color: '#9FE870' }
  } catch {
    return null
  }
}

function regionFor(item: LoteMapItem): MapRegion {
  const latitudes = item.polygon.map((point) => point.latitude)
  const longitudes = item.polygon.map((point) => point.longitude)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)
  return { latitude: (minLat + maxLat) / 2, longitude: (minLng + maxLng) / 2, latitudeDelta: Math.max((maxLat - minLat) * 1.35, 0.004), longitudeDelta: Math.max((maxLng - minLng) * 1.35, 0.004) }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#081225' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#081225' },
  header: { height: 76, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.08)' },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0B1730', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: '#9FE870', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  mapWrap: { flex: 1, position: 'relative' },
  modeBar: { position: 'absolute', top: 16, left: 14, right: 14, flexDirection: 'row', gap: 6, padding: 6, borderRadius: 20, backgroundColor: 'rgba(8,18,37,.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)' },
  mode: { flex: 1, minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 3 },
  modeActive: { backgroundColor: '#9FE870' },
  modeLabel: { color: '#A6B0CF', fontSize: 9, fontWeight: '600' },
  modeLabelActive: { color: '#081225', fontWeight: '800' },
  legend: { position: 'absolute', left: 16, right: 16, bottom: 18, padding: 18, borderRadius: 22, backgroundColor: 'rgba(8,18,37,.94)', borderWidth: 1, borderColor: 'rgba(159,232,112,.22)', shadowColor: '#9FE870', shadowOpacity: .14, shadowRadius: 18 },
  legendHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  legendTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  gradient: { height: 10, borderRadius: 99, backgroundColor: '#58A83D' },
  scale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 10 },
  scaleText: { color: '#A6B0CF', fontSize: 10 },
  meta: { color: '#A6B0CF', fontSize: 11, marginTop: 2 },
  unavailable: { color: '#A6B0CF', fontSize: 12, lineHeight: 18 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})
