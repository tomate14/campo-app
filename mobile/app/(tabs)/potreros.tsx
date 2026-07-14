import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import {
  ChevronDown,
  Fence,
  Heart,
  Layers,
  Leaf,
  LocateFixed,
  Map as MapIcon,
  MapPinned,
  Menu,
  Mountain,
  Pencil,
  SlidersHorizontal,
  Syringe,
  Tag,
  Trash2,
  Waves,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react-native'
import { Colors } from '../../constants/colors'
import LotesFieldMap from '../../shared/components/lotes-field-map'
import { useDeletePotrero, usePotrerosMapa } from '../../shared/hooks/usePotreros'
import type { Lote } from '../../shared/types/agricola'
import type { Potrero } from '../../shared/types/ganaderia'
import type { LoteMapItem, MapCommand, MapMode, MapPoint, MapRegion } from '../../shared/components/lotes-field-map.types'

const c = Colors.dark

const palette = ['#9FE870', '#6EA8FF', '#9A7DFF', '#FFB84D', '#39D0D8', '#75E4B3']
const defaultRegion: MapRegion = {
  latitude: -37.339402,
  longitude: -59.16125,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
}

const mapModes: Array<{ label: string; description: string; value: MapMode; Icon: LucideIcon }> = [
  { label: 'Satelite', description: 'Imagen satelital del campo.', value: 'satellite', Icon: MapIcon },
  { label: 'Mapa', description: 'Mapa vectorial limpio.', value: 'standard', Icon: MapPinned },
  { label: 'Hibrido', description: 'Satelite con etiquetas.', value: 'hybrid', Icon: Layers },
  { label: 'Terreno', description: 'Relieve y elevaciones.', value: 'terrain', Icon: Mountain },
]

type QuickAction = { label: string; Icon: LucideIcon; color: string; route: string }

const actions: QuickAction[] = [
  { label: 'Trazabilidad', Icon: Tag, color: '#9FE870', route: '/ganaderia/nueva-trazabilidad' },
  { label: 'Sanidad', Icon: Syringe, color: '#6EA8FF', route: '/ganaderia/nueva-sanidad' },
  { label: 'Alimentacion', Icon: Wheat, color: '#FFB84D', route: '/ganaderia/nueva-alimentacion' },
  { label: 'Reproduccion', Icon: Heart, color: '#9A7DFF', route: '/ganaderia/nueva-reproduccion' },
]

export default function PotrerosScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const { data: potreros = [], isLoading } = usePotrerosMapa()
  const deletePotrero = useDeletePotrero()
  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied'>('idle')
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null)
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null)
  const [layersOpen, setLayersOpen] = useState(false)
  const [mapMode, setMapMode] = useState<MapMode>('satellite')
  const [showPotreros, setShowPotreros] = useState(true)
  const [selectedPotrero, setSelectedPotrero] = useState<Potrero | null>(null)

  useEffect(() => {
    let mounted = true

    const requestLocation = async () => {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!mounted) return

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocationStatus('denied')
        return
      }

      setLocationStatus('granted')
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      if (mounted) setCoords(current.coords)
    }

    requestLocation().catch(() => setLocationStatus('denied'))

    return () => {
      mounted = false
    }
  }, [])

  const totalArea = useMemo(
    () => potreros.reduce((total, potrero) => total + Number(potrero.superficieHa ?? 0), 0),
    [potreros]
  )
  const allMapItems = useMemo(() => buildMapItems(potreros), [potreros])
  const mapItems = showPotreros ? allMapItems : []
  const userPoint = coords ? { latitude: coords.latitude, longitude: coords.longitude } : null
  const initialRegion = useMemo(() => calculateRegion(allMapItems, userPoint), [allMapItems, userPoint])

  const sendMapCommand = (type: MapCommand['type']) => {
    setMapCommand({ id: Date.now(), type })
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.mapShell}>
        <LotesFieldMap
          key={mapMode}
          mapItems={mapItems}
          detections={[]}
          initialRegion={initialRegion}
          userCoords={userPoint}
          locationGranted={locationStatus === 'granted'}
          command={mapCommand}
          mapMode={mapMode}
          onLotePress={(id) => {
            const potrero = potreros.find((item) => item.id === id)
            if (potrero) setSelectedPotrero(potrero)
          }}
          onDetectionPress={() => undefined}
        />

        <View style={styles.mapOverlay} pointerEvents="none" />

        <View style={styles.header}>
          <Pressable style={styles.menuButton} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Menu size={19} color="#DCE8F8" strokeWidth={2} />
          </Pressable>
          <View>
            <Text style={styles.title}>Potreros</Text>
            <View style={styles.farmRow}>
              <Text style={styles.subtitle}>Establecimiento Santa Clara</Text>
              <ChevronDown size={14} color="#9FE870" strokeWidth={2} />
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.circleButton}><SlidersHorizontal size={18} color="#FFFFFF" strokeWidth={2} /></Pressable>
          </View>
        </View>

        <View style={styles.quickCard}>
          <View style={styles.quickIcon}><Fence size={17} color="#9FE870" strokeWidth={2} /></View>
          <View>
            <Text style={styles.quickValue}>{potreros.length} potreros</Text>
            <Text style={styles.quickLabel}>{Math.round(totalArea).toLocaleString('es-AR')} ha</Text>
          </View>
        </View>

        <View style={styles.actionRail}>
          {actions.map((action) => {
            const ActionIcon = action.Icon
            return (
              <Pressable
                key={action.label}
                style={[styles.actionBubble, { borderColor: `${action.color}55`, shadowColor: action.color }]}
                onPress={() => router.push(action.route as never)}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: action.color }]}>
                  <ActionIcon size={20} color="#07101F" strokeWidth={2.4} />
                </View>
                <View style={styles.actionTextPill}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.mapControlsTop}>
          <Pressable
            style={({ pressed }) => [styles.layerButton, pressed && styles.layerButtonPressed]}
            onPress={() => setLayersOpen(true)}
          >
            <Layers size={24} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>

        <Pressable style={styles.locationPill} onPress={() => sendMapCommand('user')}>
          <LocateFixed size={17} color="#A6B0CF" strokeWidth={2} />
          <Text style={styles.locationText}>Mi ubicacion</Text>
        </Pressable>

        {locationStatus === 'denied' && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Ubicacion desactivada</Text>
            <Text style={styles.permissionText}>Habilitala para centrar el mapa en tu posicion de campo.</Text>
          </View>
        )}

        {selectedPotrero && (
          <PotreroPreview
            potrero={selectedPotrero}
            onClose={() => setSelectedPotrero(null)}
            onEdit={() => router.push({ pathname: '/ganaderia/potrero-form', params: { id: selectedPotrero.id } } as never)}
            onDelete={() => {
              Alert.alert('Eliminar potrero', `¿Seguro que querés eliminar "${selectedPotrero.nombre}"?`, [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deletePotrero.mutateAsync(selectedPotrero.id)
                      setSelectedPotrero(null)
                    } catch {
                      Alert.alert('Error', 'No se pudo eliminar el potrero.')
                    }
                  },
                },
              ])
            }}
          />
        )}

        <Modal visible={layersOpen} transparent animationType="slide" onRequestClose={() => setLayersOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setLayersOpen(false)} />
          <View style={styles.layersSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleBlock}>
                <Text style={styles.sheetTitle}>Capas del mapa</Text>
                <Text style={styles.sheetSubtitle}>Personaliza la visualizacion de potreros</Text>
              </View>
              <Pressable style={styles.sheetClose} onPress={() => setLayersOpen(false)}>
                <X size={16} color="#DCE8F8" strokeWidth={2.2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <Text style={styles.sheetSectionTitle}>Tipo de vista</Text>
              <View style={styles.modeList}>
                {mapModes.map((item) => {
                  const ModeIcon = item.Icon
                  const active = mapMode === item.value
                  return (
                    <Pressable key={item.value} style={[styles.modeRow, active && styles.modeRowActive]} onPress={() => setMapMode(item.value)}>
                      <View style={[styles.modeIcon, active && styles.modeIconActive]}>
                        <ModeIcon size={20} color={active ? '#9FE870' : '#A6B0CF'} strokeWidth={2} />
                      </View>
                      <View style={styles.modeCopy}>
                        <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{item.label}</Text>
                        <Text style={styles.modeDescription}>{item.description}</Text>
                      </View>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  )
                })}
              </View>

              <Text style={styles.sheetSectionTitle}>Capas operativas</Text>
              <View style={styles.layerRow}>
                <View style={styles.layerCopy}>
                  <Fence size={18} color="#9FE870" strokeWidth={2} />
                  <Text style={styles.layerLabel}>Limites de potreros</Text>
                </View>
                <Switch
                  value={showPotreros}
                  onValueChange={setShowPotreros}
                  trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(159,232,112,0.34)' }}
                  thumbColor={showPotreros ? '#9FE870' : '#A6B0CF'}
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

function PotreroPreview({ potrero, onClose, onEdit, onDelete }: { potrero: Potrero; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const cargaActual = Number(potrero.cargaAnimalActual ?? 0)
  const capacidad = Number(potrero.capacidadAnimales ?? 0)
  const ocupacion = capacidad > 0 ? Math.round((cargaActual / capacidad) * 100) : 0
  const color = occupancyColor(ocupacion)
  const history = buildPotreroHistory(potrero)

  return (
    <View style={styles.potreroPreview}>
      <View style={styles.previewHead}>
        <View style={[styles.estadoBadge, { borderColor: `${estadoColor(potrero.estado)}80`, backgroundColor: `${estadoColor(potrero.estado)}18` }]}>
          <Text style={[styles.estadoBadgeText, { color: estadoColor(potrero.estado) }]}>{potrero.estado || 'ACTIVO'}</Text>
        </View>
        <View style={styles.previewHeadActions}>
          <Pressable style={styles.previewActionButton} onPress={onEdit}>
            <Pencil size={14} color="#9FE870" strokeWidth={2.2} />
          </Pressable>
          <Pressable style={styles.previewActionButton} onPress={onDelete}>
            <Trash2 size={14} color="#FF6B6B" strokeWidth={2.2} />
          </Pressable>
          <Pressable style={styles.previewClose} onPress={onClose}>
            <X size={15} color="#DCE8F8" strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.previewScroll}
        contentContainerStyle={styles.previewScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.previewTitle}>{potrero.nombre}</Text>
        <Text style={styles.previewSubtitle}>{potrero.tipoUso || 'Pastoreo activo'}</Text>

        <View style={styles.metricGrid}>
          <Metric label="Superficie" value={formatHa(potrero.superficieHa)} />
          <Metric label="Carga animal" value={`${cargaActual} / ${capacidad || '-'}`} />
        </View>

        <View style={styles.occupancyBlock}>
          <View style={styles.occupancyTop}>
            <Text style={styles.previewLabel}>Ocupacion</Text>
            <Text style={[styles.occupancyValue, { color }]}>{ocupacion}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(ocupacion, 100)}%`, backgroundColor: color }]} />
          </View>
        </View>

        <View style={styles.forageBadge}>
          <Leaf size={16} color="#9FE870" strokeWidth={2} />
          <Text style={styles.forageText}>{potrero.recursoForrajero || 'Sin recurso forrajero'}</Text>
        </View>

        <View style={styles.resourceRow}>
          {potrero.disponibilidadAgua && (
            <View style={styles.resourcePill}>
              <Waves size={14} color="#9FE870" strokeWidth={2} />
              <Text style={styles.resourceText}>Agua</Text>
            </View>
          )}
          {potrero.tieneSombra && (
            <View style={styles.resourcePill}>
              <Leaf size={14} color="#9FE870" strokeWidth={2} />
              <Text style={styles.resourceText}>Sombra</Text>
            </View>
          )}
          {!potrero.disponibilidadAgua && !potrero.tieneSombra && (
            <Text style={styles.previewMuted}>Sin recursos adicionales cargados</Text>
          )}
        </View>

        <View style={styles.observationBox}>
          <Text style={styles.previewLabel}>Observaciones</Text>
          <Text style={styles.observationText}>{potrero.observaciones || 'Sin observaciones registradas.'}</Text>
        </View>

        <View style={styles.historyBlock}>
          <Text style={styles.historyTitle}>Historial</Text>
          {history.map((item) => (
            <View key={item.title} style={styles.historyItem}>
              <View style={[styles.historyDot, { backgroundColor: item.color }]} />
              <View style={styles.historyCopy}>
                <Text style={styles.historyItemTitle}>{item.title}</Text>
                <Text style={styles.historyItemDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  )
}

function buildMapItems(potreros: Potrero[]): LoteMapItem[] {
  return potreros
    .map((potrero, index) => {
      const polygon = parsePolygon(potrero.poligono)
      const fallback = fallbackCoordinate(potrero)
      const coordinates = polygon.length >= 3 ? polygon : fallback ? [fallback] : []
      if (!coordinates.length) return null

      return {
        lote: potreroToLote(potrero),
        color: potreroColor(potrero, index),
        polygon: polygon.length >= 3 ? polygon : fallbackSquare(fallback as MapPoint),
        center: polygon.length >= 3 ? centroid(polygon) : fallback as MapPoint,
      }
    })
    .filter((item): item is LoteMapItem => Boolean(item))
}

function potreroToLote(potrero: Potrero): Lote {
  return {
    id: potrero.id,
    nombre: potrero.nombre,
    area: Number(potrero.superficieHa ?? 0),
    cultivo: potrero.recursoForrajero || potrero.tipoUso || 'Potrero',
    temporada: potrero.estado || 'ACTIVO',
    latitud: Number(potrero.centroideLatitud),
    longitud: Number(potrero.centroideLongitud),
    poligono: potrero.poligono,
    createdAt: potrero.createdAt || '',
    updatedAt: potrero.updatedAt || '',
  }
}

function potreroColor(potrero: Potrero, index: number): string {
  const stateColor = estadoColor(potrero.estado)
  return stateColor || palette[index % palette.length]
}

function estadoColor(estado?: string): string {
  const normalized = estado?.toUpperCase()
  if (normalized === 'DESCANSO') return '#6EA8FF'
  if (normalized === 'MANTENIMIENTO') return '#FFB84D'
  if (normalized === 'INACTIVO') return '#A6B0CF'
  return '#9FE870'
}

function occupancyColor(value: number): string {
  if (value > 100) return '#FF6B6B'
  if (value >= 85) return '#FF8A4C'
  if (value >= 60) return '#FFB84D'
  return '#9FE870'
}

function buildPotreroHistory(potrero: Potrero) {
  const items = [
    {
      title: 'Potrero registrado',
      detail: potrero.createdAt ? formatDateTime(potrero.createdAt) : 'Fecha no disponible',
      color: '#9FE870',
    },
    {
      title: 'Estado actual',
      detail: `${potrero.estado || 'ACTIVO'} · ${potrero.tipoUso || 'PASTOREO'}`,
      color: estadoColor(potrero.estado),
    },
  ]

  if (potrero.updatedAt) {
    items.push({
      title: 'Ultima actualizacion',
      detail: formatDateTime(potrero.updatedAt),
      color: '#6EA8FF',
    })
  }

  if (potrero.observaciones) {
    items.push({
      title: 'Observacion registrada',
      detail: potrero.observaciones,
      color: '#FFB84D',
    })
  }

  return items
}

function parsePolygon(value?: string): MapPoint[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as { type?: string; coordinates?: unknown }
    if (parsed.type !== 'Polygon' || !Array.isArray(parsed.coordinates)) return []
    const ring = parsed.coordinates[0]
    if (!Array.isArray(ring)) return []

    return ring
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) return null
        const longitude = Number(point[0])
        const latitude = Number(point[1])
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
        return { latitude, longitude }
      })
      .filter((point): point is MapPoint => Boolean(point))
  } catch {
    return []
  }
}

function fallbackCoordinate(potrero: Potrero): MapPoint | null {
  const latitude = Number(potrero.centroideLatitud)
  const longitude = Number(potrero.centroideLongitud)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return { latitude, longitude }
}

function fallbackSquare(center: MapPoint): MapPoint[] {
  const delta = 0.003
  return [
    { latitude: center.latitude - delta, longitude: center.longitude - delta },
    { latitude: center.latitude - delta, longitude: center.longitude + delta },
    { latitude: center.latitude + delta, longitude: center.longitude + delta },
    { latitude: center.latitude + delta, longitude: center.longitude - delta },
  ]
}

function centroid(points: MapPoint[]): MapPoint {
  const totals = points.reduce((acc, point) => ({
    latitude: acc.latitude + point.latitude,
    longitude: acc.longitude + point.longitude,
  }), { latitude: 0, longitude: 0 })

  return {
    latitude: totals.latitude / points.length,
    longitude: totals.longitude / points.length,
  }
}

function calculateRegion(items: LoteMapItem[], coords: MapPoint | null): MapRegion {
  const points = items.flatMap((item) => item.polygon)
  if (!points.length && coords) {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }
  }
  if (!points.length) return defaultRegion

  const latitudes = points.map((point) => point.latitude)
  const longitudes = points.map((point) => point.longitude)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.7, 0.015),
    longitudeDelta: Math.max((maxLng - minLng) * 1.7, 0.015),
  }
}

function formatHa(value?: number): string {
  return `${Number(value ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })} ha`
}

function formatDateTime(value?: string): string {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#081225',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#081225',
  },
  mapShell: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#07101F',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 18, 37, 0.08)',
  },
  header: {
    position: 'absolute',
    top: 12,
    left: 18,
    right: 18,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(8, 18, 37, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  subtitle: {
    color: '#A6B0CF',
    fontSize: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 9,
    marginLeft: 'auto',
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 23, 48, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickCard: {
    position: 'absolute',
    top: 86,
    left: 20,
    minWidth: 138,
    minHeight: 58,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(8, 18, 37, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.16)',
  },
  quickIcon: {
    width: 35,
    height: 35,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,0.16)',
  },
  quickValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  quickLabel: {
    color: '#9FE870',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  actionRail: {
    position: 'absolute',
    left: 18,
    top: '38%',
    gap: 10,
    zIndex: 9000,
    elevation: 9000,
  },
  actionBubble: {
    minHeight: 44,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    zIndex: 9001,
    elevation: 9001,
    overflow: 'visible',
  },
  actionIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    zIndex: 3,
    elevation: 3,
  },
  actionTextPill: {
    minWidth: 68,
    maxWidth: 82,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: 'rgba(8, 18, 37, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginLeft: -12,
    paddingLeft: 17,
    zIndex: 1,
    elevation: 1,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '400',
  },
  mapControlsTop: {
    position: 'absolute',
    right: 20,
    top: 74,
  },
  layerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1730',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#9FE870',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  layerButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  locationPill: {
    position: 'absolute',
    left: 20,
    bottom: 24,
    height: 43,
    minWidth: 116,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 9,
    backgroundColor: 'rgba(8, 18, 37, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationText: {
    color: '#A6B0CF',
    fontSize: 11,
    fontWeight: '400',
  },
  permissionCard: {
    position: 'absolute',
    right: 18,
    bottom: 104,
    width: 210,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 18, 37, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,77,0.28)',
  },
  permissionTitle: {
    color: '#FFB84D',
    fontSize: 12,
    fontWeight: '900',
  },
  permissionText: {
    color: '#A6B0CF',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  potreroPreview: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    zIndex: 10000,
    elevation: 10000,
    maxHeight: '58%',
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(8, 18, 37, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.14)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  previewScroll: {
    flexShrink: 1,
  },
  previewScrollContent: {
    paddingBottom: 4,
  },
  previewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  estadoBadge: {
    height: 35,
    paddingHorizontal: 13,
    borderRadius: 18,
    justifyContent: 'center',
    borderWidth: 1,
  },
  estadoBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '900',
  },
  previewHeadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  previewClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  previewSubtitle: {
    color: '#A6B0CF',
    fontSize: 13,
    marginTop: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(11,23,48,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  previewLabel: {
    color: '#A6B0CF',
    fontSize: 10,
    lineHeight: 13,
  },
  previewValue: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  previewMuted: {
    color: '#A6B0CF',
    fontSize: 11,
  },
  occupancyBlock: {
    marginTop: 14,
  },
  occupancyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  occupancyValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  forageBadge: {
    height: 34,
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(159,232,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.25)',
  },
  forageText: {
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  resourceRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  resourcePill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(159,232,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.18)',
  },
  resourceText: {
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '700',
  },
  observationBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(11,23,48,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  observationText: {
    color: '#DCE8F8',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  historyBlock: {
    marginTop: 14,
    gap: 9,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  historyDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
  },
  historyCopy: {
    flex: 1,
  },
  historyItemTitle: {
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '800',
  },
  historyItemDetail: {
    color: '#A6B0CF',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  layersSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '60%',
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#081225',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sheetTitleBlock: {
    flex: 1,
    paddingRight: 14,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  sheetSubtitle: {
    color: '#A6B0CF',
    fontSize: 12,
    marginTop: 4,
  },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 30,
  },
  sheetSectionTitle: {
    color: '#6EA8FF',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 4,
  },
  modeList: {
    gap: 8,
    marginBottom: 18,
  },
  modeRow: {
    minHeight: 62,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(11,23,48,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modeRowActive: {
    borderColor: 'rgba(159,232,112,0.42)',
    backgroundColor: 'rgba(159,232,112,0.08)',
  },
  modeIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modeIconActive: {
    backgroundColor: 'rgba(159,232,112,0.12)',
  },
  modeCopy: {
    flex: 1,
  },
  modeLabel: {
    color: '#DCE8F8',
    fontSize: 13,
    fontWeight: '800',
  },
  modeLabelActive: {
    color: '#FFFFFF',
  },
  modeDescription: {
    color: '#A6B0CF',
    fontSize: 11,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  radioActive: {
    borderColor: '#9FE870',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9FE870',
  },
  layerRow: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(11,23,48,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  layerCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  layerLabel: {
    color: '#DCE8F8',
    fontSize: 13,
    fontWeight: '800',
  },
})
