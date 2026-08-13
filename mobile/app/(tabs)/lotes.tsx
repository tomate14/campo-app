import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { Image } from 'expo-image'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  ClipboardCheck,
  ClipboardPlus,
  CloudSun,
  Crosshair,
  History,
  Layers,
  Leaf,
  LocateFixed,
  Map as MapIcon,
  MapPinned,
  Menu,
  Mountain,
  Satellite,
  Search,
  SlidersHorizontal,
  SprayCan,
  Sprout,
  X,
  type LucideIcon,
} from 'lucide-react-native'
import { Colors } from '../../constants/colors'
import LotesFieldMap from '../../shared/components/lotes-field-map'
import { getCosechasByLote, getEventosByLote, getHistorialByLote, getOrdenesAplicacionByLote } from '../../shared/api/agricola'
import { resolveAssetUrl } from '../../shared/api/client'
import { useLotes } from '../../shared/hooks/useLotes'
import { useAplicacionesFitosanitarias, useDeteccionesPlaga, useSeguimientosPlaga } from '../../shared/hooks/usePlagas'
import type {
  AplicacionFitosanitaria,
  DeteccionPlaga,
  EventoSiembra,
  HistoricoCultivo,
  Lote,
  OrdenAplicacion,
  RegistroCosecha,
  SeguimientoPlaga,
  SeveridadPlaga,
} from '../../shared/types/agricola'
import type { DeteccionMapItem, LoteMapItem, MapCommand, MapMode, MapPoint, MapRegion } from '../../shared/components/lotes-field-map.types'

const c = Colors.dark

const defaultRegion: MapRegion = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

const actions = [
  { label: 'Registrar evento', layer: 'Eventos', Icon: ClipboardPlus, color: '#9FE870', route: '/agricola/nueva-siembra' },
  { label: 'Registrar aplicación', layer: 'Aplicaciones', Icon: SprayCan, color: '#6EA8FF', route: '/agricola/plagas', mode: 'aplicacion' },
  { label: 'Registrar seguimiento', layer: 'Seguimientos', Icon: Sprout, color: '#39D0D8', route: '/agricola/plagas', mode: 'seguimiento' },
  { label: 'Orden de aplicación', layer: 'Aplicaciones', Icon: ClipboardCheck, color: '#FFB84D', route: '/agricola/ordenes-aplicacion' },
  { label: 'Ver histórico', layer: 'Eventos', Icon: History, color: '#FFB84D', route: '/agricola/plagas', mode: 'historico' },
  { label: 'Nueva detección', layer: 'Detecciones', Icon: Crosshair, color: '#9A7DFF', route: '/agricola/plagas', mode: 'deteccion', primary: true },
]
type LayerState = Record<string, boolean>
type LoteHistoryCampo = { label: string; value: string }
type LoteHistoryEvent = {
  id: string
  tipo: string
  titulo: string
  fecha: string
  color: string
  // Todos los campos cargados del evento (solo los que tienen valor). Se listan al expandir la card.
  campos: LoteHistoryCampo[]
}

const mapModes: Array<{ label: string; description: string; value: MapMode; Icon: LucideIcon }> = [
  { label: 'Satélite', description: 'Imágenes satelitales.', value: 'satellite', Icon: Satellite },
  { label: 'Mapa', description: 'Mapa vectorial.', value: 'standard', Icon: MapIcon },
  { label: 'Híbrido', description: 'Satélite + etiquetas.', value: 'hybrid', Icon: MapPinned },
  { label: 'Terreno', description: 'Relieve y elevaciones.', value: 'terrain', Icon: Mountain },
]

const operationalLayers: Array<{ label: string; Icon: LucideIcon }> = [
  { label: 'Límites de lotes', Icon: MapPinned },
  { label: 'Eventos', Icon: ClipboardList },
  { label: 'Aplicaciones', Icon: SprayCan },
  { label: 'Seguimientos', Icon: Leaf },
  { label: 'Detecciones', Icon: Crosshair },
]

export default function LotesScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { data: lotes = [], isLoading } = useLotes()
  const { data: detecciones = [] } = useDeteccionesPlaga()
  const { data: aplicaciones = [] } = useAplicacionesFitosanitarias()
  const { data: seguimientos = [] } = useSeguimientosPlaga()
  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied'>('idle')
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null)
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null)
  const [layersOpen, setLayersOpen] = useState(false)
  const [mapMode, setMapMode] = useState<MapMode>('satellite')
  const [selectedDetections, setSelectedDetections] = useState<DeteccionPlaga[]>([])
  const [selectedDetectionIndex, setSelectedDetectionIndex] = useState(0)
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null)
  const [operational, setOperational] = useState<LayerState>({
    'Límites de lotes': true,
    Eventos: true,
    Aplicaciones: true,
    Seguimientos: true,
    Detecciones: true,
  })
  // Feature 57: circulo de area afectada visible por defecto; resueltos ocultos por defecto.
  const [showAffectedArea, setShowAffectedArea] = useState(true)
  const [showResolved, setShowResolved] = useState(false)

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
      if (mounted) {
        setCoords(current.coords)
      }
    }

    requestLocation().catch(() => setLocationStatus('denied'))

    return () => {
      mounted = false
    }
  }, [])

  const totalArea = useMemo(() => lotes.reduce((total, lote) => total + Number(lote.area ?? 0), 0), [lotes])
  const allMapItems = useMemo(() => buildMapItems(lotes, detecciones), [lotes, detecciones])
  const mapItems = useMemo(
    () => (operational['Límites de lotes'] ? allMapItems : []),
    [allMapItems, operational]
  )
  const detectionItems = useMemo(
    () => {
      if (!operational.Detecciones) return []
      // Feature 57: los pines resueltos (CONTROLADA/CERRADA) quedan fuera del mapa salvo toggle.
      const visibles = showResolved
        ? detecciones
        : detecciones.filter((deteccion) => !['CONTROLADA', 'CERRADA'].includes(deteccion.estado))
      return buildDetectionItems(visibles, allMapItems)
    },
    [detecciones, allMapItems, operational.Detecciones, showResolved]
  )
  const visibleActions = useMemo(
    () => actions.filter((action) => operational[action.layer] !== false),
    [operational]
  )
  // Estable por referencia (feature 57): asi initialRegion no cambia en cada render y no se
  // dispara el re-encuadre continuo del mapa (que arrastraba los pines al hacer zoom).
  const userPoint = useMemo(() => (coords ? { latitude: coords.latitude, longitude: coords.longitude } : null), [coords])
  const initialRegion = useMemo(() => calculateRegion(allMapItems, userPoint), [allMapItems, userPoint])
  const selectedLoteId = selectedLote?.id ?? ''
  const { data: siembraEventos = [], isFetching: loadingSiembra } = useQuery({
    queryKey: ['lote-historial-siembra', selectedLoteId],
    queryFn: () => getEventosByLote(selectedLoteId),
    enabled: Boolean(selectedLoteId),
  })
  const { data: cosechas = [], isFetching: loadingCosechas } = useQuery({
    queryKey: ['lote-historial-cosecha', selectedLoteId],
    queryFn: () => getCosechasByLote(selectedLoteId),
    enabled: Boolean(selectedLoteId),
  })
  const { data: historicoCultivos = [], isFetching: loadingHistoricoCultivos } = useQuery({
    queryKey: ['lote-historial-cultivos', selectedLoteId],
    queryFn: () => getHistorialByLote(selectedLoteId),
    enabled: Boolean(selectedLoteId),
  })
  const { data: ordenesAplicacion = [] } = useQuery({
    queryKey: ['lote-historial-ordenes', selectedLoteId],
    queryFn: () => getOrdenesAplicacionByLote(selectedLoteId),
    enabled: Boolean(selectedLoteId),
  })
  const loteHistory = useMemo(
    () => buildLoteHistory(selectedLote, {
      detecciones,
      aplicaciones,
      seguimientos,
      siembraEventos,
      cosechas,
      historicoCultivos,
      ordenesAplicacion,
    }),
    [selectedLote, detecciones, aplicaciones, seguimientos, siembraEventos, cosechas, historicoCultivos, ordenesAplicacion]
  )
  const historyLoading = loadingSiembra || loadingCosechas || loadingHistoricoCultivos

  const goTo = (action: { route: string; mode?: string }, extraParams?: Record<string, string>) => {
    if (action.route === '/agricola/plagas') {
      router.push({
        pathname: '/agricola/plagas',
        params: {
          ...(action.mode ? { mode: action.mode } : {}),
          ...(selectedLote?.id ? { loteId: selectedLote.id } : {}),
          ...extraParams,
        },
      } as never)
      return
    }
    // Feature 58: la orden de aplicacion se carga en su pantalla, abriendo el alta.
    if (action.route === '/agricola/ordenes-aplicacion') {
      router.push({
        pathname: '/agricola/ordenes-aplicacion',
        params: { nueva: '1', ...(selectedLote?.id ? { loteId: selectedLote.id } : {}) },
      } as never)
      return
    }
    router.push(action.route as never)
  }

  const sendMapCommand = (type: MapCommand['type']) => {
    setMapCommand({ id: Date.now(), type })
  }

  const toggleLayer = (label: string) => {
    setOperational((current) => ({ ...current, [label]: !current[label] }))
  }

  useEffect(() => {
    if (!operational.Detecciones) {
      setSelectedDetections([])
      setSelectedDetectionIndex(0)
    }
    if (!operational['Límites de lotes']) {
      setSelectedLote(null)
    }
  }, [operational])

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
          detections={detectionItems}
          initialRegion={initialRegion}
          userCoords={userPoint}
          locationGranted={locationStatus === 'granted'}
          command={mapCommand}
          mapMode={mapMode}
          showAffectedArea={showAffectedArea}
          onLotePress={(id) => {
            const lote = lotes.find((item) => item.id === id)
            if (lote) {
              setSelectedDetections([])
              setSelectedDetectionIndex(0)
              setSelectedLote(lote)
            }
          }}
          onDetectionPress={(detectionGroup) => {
            setSelectedLote(null)
            setSelectedDetections(detectionGroup)
            setSelectedDetectionIndex(0)
          }}
        />

        <View style={styles.mapOverlay} pointerEvents="none" />

        <View style={styles.header}>
          <Pressable style={styles.menuButton} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Menu size={19} color="#DCE8F8" strokeWidth={2} />
          </Pressable>
          <View>
            <Text style={styles.title}>Lotes</Text>
            <View style={styles.farmRow}>
              <Text style={styles.subtitle}>Establecimiento Santa Clara</Text>
              <ChevronDown size={14} color="#9FE870" strokeWidth={2} />
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.circleButton}><Search size={19} color="#FFFFFF" strokeWidth={2} /></Pressable>
            <Pressable style={styles.circleButton}><SlidersHorizontal size={18} color="#FFFFFF" strokeWidth={2} /></Pressable>
          </View>
        </View>

        <View style={styles.quickCard}>
          <View style={styles.quickIcon}><MapIcon size={17} color="#9FE870" strokeWidth={2} /></View>
          <View>
            <Text style={styles.quickValue}>{lotes.length} lotes</Text>
            <Text style={styles.quickLabel}>{Math.round(totalArea).toLocaleString('es-AR')} ha</Text>
          </View>
        </View>

        <View style={styles.actionRail}>
          {visibleActions.map((action) => {
            const ActionIcon = action.Icon

            return (
              <Pressable
                key={action.label}
                style={[
                  styles.actionBubble,
                  action.primary && styles.actionBubblePrimary,
                  { borderColor: `${action.color}55`, shadowColor: action.color },
                ]}
                onPress={() => goTo(action)}
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
          <Text style={styles.locationText}>Mi ubicación</Text>
        </Pressable>

        {locationStatus === 'denied' && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Ubicación desactivada</Text>
            <Text style={styles.permissionText}>Habilitala para centrar el mapa en tu posición de campo.</Text>
          </View>
        )}

        {selectedDetections[selectedDetectionIndex] && (
          <DetectionPreview
            detection={selectedDetections[selectedDetectionIndex]}
            total={selectedDetections.length}
            currentIndex={selectedDetectionIndex}
            onPrevious={() => setSelectedDetectionIndex((current) => Math.max(current - 1, 0))}
            onNext={() => setSelectedDetectionIndex((current) => Math.min(current + 1, selectedDetections.length - 1))}
            onClose={() => {
              setSelectedDetections([])
              setSelectedDetectionIndex(0)
            }}
            onAction={(mode) => {
              const selectedDetection = selectedDetections[selectedDetectionIndex]
              if (selectedDetection) {
                goTo({ route: '/agricola/plagas', mode }, { deteccionId: selectedDetection.id, loteId: selectedDetection.loteId })
              }
            }}
          />
        )}

        {selectedLote && (
          <LoteHistoryPanel
            lote={selectedLote}
            events={loteHistory}
            loading={historyLoading}
            onWeather={() => router.push({ pathname: '/clima/[loteId]', params: { loteId: selectedLote.id, loteNombre: selectedLote.nombre } })}
            onClose={() => setSelectedLote(null)}
          />
        )}

        <Modal visible={layersOpen} transparent animationType="slide" onRequestClose={() => setLayersOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setLayersOpen(false)} />
          <View style={styles.layersSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleBlock}>
                <Text style={styles.sheetTitle}>Capas del mapa</Text>
                <Text style={styles.sheetSubtitle}>Personalizá la visualización del establecimiento</Text>
              </View>
              <Pressable style={styles.sheetClose} onPress={() => setLayersOpen(false)}>
                <Text style={styles.sheetCloseText}>×</Text>
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
              {operationalLayers.map(({ label, Icon }) => (
                <View key={label} style={styles.layerRow}>
                  <View style={styles.layerCopy}>
                    <Icon size={18} color="#9FE870" strokeWidth={2} />
                    <Text style={styles.layerLabel}>{label}</Text>
                  </View>
                  <Switch
                    value={Boolean(operational[label])}
                    onValueChange={() => toggleLayer(label)}
                    trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(159,232,112,0.34)' }}
                    thumbColor={operational[label] ? '#9FE870' : '#A6B0CF'}
                  />
                </View>
              ))}

              {/* Feature 57: filtros de detecciones de plagas. */}
              <Text style={styles.sheetSectionTitle}>Detecciones de plagas</Text>
              <View style={styles.layerRow}>
                <View style={styles.layerCopy}>
                  <CircleDot size={18} color="#9FE870" strokeWidth={2} />
                  <Text style={styles.layerLabel}>Área afectada</Text>
                </View>
                <Switch
                  value={showAffectedArea}
                  onValueChange={setShowAffectedArea}
                  trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(159,232,112,0.34)' }}
                  thumbColor={showAffectedArea ? '#9FE870' : '#A6B0CF'}
                />
              </View>
              <View style={styles.layerRow}>
                <View style={styles.layerCopy}>
                  <History size={18} color="#9FE870" strokeWidth={2} />
                  <Text style={styles.layerLabel}>Mostrar resueltos</Text>
                </View>
                <Switch
                  value={showResolved}
                  onValueChange={setShowResolved}
                  trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(159,232,112,0.34)' }}
                  thumbColor={showResolved ? '#9FE870' : '#A6B0CF'}
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

function DetectionPreview({
  detection,
  total,
  currentIndex,
  onPrevious,
  onNext,
  onClose,
  onAction,
}: {
  detection: DeteccionPlaga
  total: number
  currentIndex: number
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
  onAction: (mode: string) => void
}) {
  const severityColor = severityColorFor(detection.severidad)
  const area = detection.areaAfectadaHa !== undefined && detection.areaAfectadaHa !== null
    ? `${Number(detection.areaAfectadaHa).toLocaleString('es-AR')} ha`
    : 'Sin dato'
  const fotoUrl = resolveAssetUrl(detection.fotoUrl)

  return (
    <View style={styles.detectionPreview}>
      {/* Foto protagonista de la deteccion (feature 79) o placeholder si no hay. */}
      {fotoUrl ? (
        <Image source={{ uri: fotoUrl }} style={styles.previewHero} contentFit="cover" transition={200} />
      ) : (
        <View style={styles.previewHeroPlaceholder}>
          <Crosshair size={30} color="#3A4A6B" strokeWidth={2} />
        </View>
      )}
      <View style={styles.detectionPreviewHead}>
        <View style={[styles.severityBadge, { borderColor: `${severityColor}80`, backgroundColor: `${severityColor}18` }]}>
          <Text style={[styles.severityBadgeText, { color: severityColor }]}>{detection.severidad}</Text>
        </View>
        <View style={styles.previewHeadActions}>
          {total > 1 && (
            <View style={styles.previewNavigation}>
              <Pressable
                style={[styles.previewNavButton, currentIndex === 0 && styles.previewNavButtonDisabled]}
                disabled={currentIndex === 0}
                onPress={onPrevious}
              >
                <ChevronLeft size={16} color={currentIndex === 0 ? '#5C6A88' : '#FFFFFF'} strokeWidth={2.2} />
              </Pressable>
              <Text style={styles.previewNavText}>{currentIndex + 1} / {total}</Text>
              <Pressable
                style={[styles.previewNavButton, currentIndex >= total - 1 && styles.previewNavButtonDisabled]}
                disabled={currentIndex >= total - 1}
                onPress={onNext}
              >
                <ChevronRight size={16} color={currentIndex >= total - 1 ? '#5C6A88' : '#FFFFFF'} strokeWidth={2.2} />
              </Pressable>
            </View>
          )}
          <Pressable style={styles.previewClose} onPress={onClose}>
            <X size={15} color="#DCE8F8" strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.previewTitle}>{detection.plagaNombre}</Text>
      <Text style={styles.previewSubtitle}>{detection.loteNombre} · {detection.estado}</Text>

      <View style={styles.previewMetrics}>
        <View>
          <Text style={styles.previewLabel}>Fecha</Text>
          <Text style={styles.previewValue}>{formatDateTime(detection.fechaDeteccion)}</Text>
        </View>
        <View>
          <Text style={styles.previewLabel}>Responsable</Text>
          <Text style={styles.previewValue}>{detection.responsable || 'Sin asignar'}</Text>
        </View>
        <View>
          <Text style={styles.previewLabel}>Área</Text>
          <Text style={styles.previewValue}>{area}</Text>
        </View>
      </View>

      <View style={styles.previewActions}>
        <Pressable style={styles.previewAction} onPress={() => onAction('aplicacion')}>
          <Text style={styles.previewActionText}>Aplicación</Text>
        </Pressable>
        <Pressable style={styles.previewAction} onPress={() => onAction('seguimiento')}>
          <Text style={styles.previewActionText}>Seguimiento</Text>
        </Pressable>
        <Pressable style={styles.previewAction} onPress={() => onAction('historico')}>
          <Text style={styles.previewActionText}>Histórico</Text>
        </Pressable>
      </View>
    </View>
  )
}

function LoteHistoryPanel({
  lote,
  events,
  loading,
  onWeather,
  onClose,
}: {
  lote: Lote
  events: LoteHistoryEvent[]
  loading: boolean
  onWeather: () => void
  onClose: () => void
}) {
  // Card colapsable: key del evento expandido (null = todos colapsados). Replica del historico web.
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  return (
    <View style={styles.historyPanel}>
      <View style={styles.historyHead}>
        <View>
          <Text style={styles.historyEyebrow}>Historial del lote</Text>
          <Text style={styles.historyTitle}>{lote.nombre}</Text>
          <Text style={styles.historySubtitle}>{lote.cultivoNombre ?? lote.cultivo} · {lote.area} ha</Text>
        </View>
        <View style={styles.historyActions}>
          <Pressable style={[styles.previewClose, styles.weatherButton]} onPress={onWeather}>
            <CloudSun size={16} color="#9FE870" strokeWidth={2.2} />
          </Pressable>
          <Pressable style={styles.previewClose} onPress={onClose}>
            <X size={15} color="#DCE8F8" strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      {loading && <Text style={styles.historyLoading}>Cargando eventos del lote...</Text>}

      {!loading && !events.length && (
        <View style={styles.historyEmpty}>
          <Text style={styles.historyEmptyTitle}>Sin eventos registrados</Text>
          <Text style={styles.historyEmptyText}>Todavía no hay actividad asociada a este lote.</Text>
        </View>
      )}

      {!loading && Boolean(events.length) && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyList}>
          {events.map((event) => {
            const key = `${event.tipo}-${event.id}`
            const open = expandedKey === key
            return (
              <Pressable
                key={key}
                style={[styles.historyItem, open && styles.historyItemOpen, open && { borderColor: `${event.color}66` }]}
                onPress={() => setExpandedKey(open ? null : key)}
              >
                <View style={[styles.historyDot, { backgroundColor: event.color, shadowColor: event.color }]} />
                <View style={styles.historyCopy}>
                  <View style={styles.historyItemTop}>
                    <Text style={[styles.historyKind, { color: event.color }]}>{event.tipo}</Text>
                    <Text style={styles.historyDate}>{formatDateTime(event.fecha)}</Text>
                  </View>
                  <Text style={styles.historyItemTitle}>{event.titulo}</Text>
                  {open && (
                    <View style={styles.historyDetailBlock}>
                      {event.campos.map((campo) => (
                        <View key={campo.label} style={styles.historyDetailRow}>
                          <Text style={styles.historyDetailLabel}>{campo.label}</Text>
                          <Text style={styles.historyDetailValue}>{campo.value}</Text>
                        </View>
                      ))}
                      {!event.campos.length && (
                        <Text style={styles.historyDetailEmpty}>Sin datos adicionales.</Text>
                      )}
                    </View>
                  )}
                </View>
                <ChevronDown
                  size={16}
                  color={open ? event.color : '#7E8BAA'}
                  strokeWidth={2.4}
                  style={{ marginTop: 3, transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                />
              </Pressable>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

function buildMapItems(lotes: Lote[], detecciones: DeteccionPlaga[]): LoteMapItem[] {
  return lotes
    .map((lote) => {
      const polygon = parsePolygon(lote.poligono)
      const fallback = fallbackCoordinate(lote)
      const coordinates = polygon.length >= 3 ? polygon : fallback ? [fallback] : []
      if (!coordinates.length) return null

      return {
        lote,
        color: loteHealthColor(lote.id, detecciones),
        polygon: polygon.length >= 3 ? polygon : fallbackSquare(fallback as MapPoint),
        center: polygon.length >= 3 ? centroid(polygon) : fallback as MapPoint,
      }
    })
    .filter((item): item is LoteMapItem => Boolean(item))
}

function buildDetectionItems(detecciones: DeteccionPlaga[], mapItems: LoteMapItem[]): DeteccionMapItem[] {
  const loteCenters = new Map(mapItems.map((item) => [item.lote.id, item.center]))
  const groups = new Map<string, { coordinate: MapPoint; detecciones: DeteccionPlaga[] }>()

  detecciones.forEach((deteccion) => {
    const coordinate = detectionCoordinate(deteccion) ?? loteCenters.get(deteccion.loteId)
    if (!coordinate) return
    const key = `${coordinate.latitude.toFixed(7)},${coordinate.longitude.toFixed(7)}`
    const current = groups.get(key)

    if (current) {
      current.detecciones.push(deteccion)
      return
    }

    groups.set(key, { coordinate, detecciones: [deteccion] })
  })

  return Array.from(groups.values()).map((group) => {
    const deteccion = group.detecciones[0]
    return {
      deteccion,
      detecciones: group.detecciones,
      color: severityColorFor(deteccion.severidad),
      coordinate: group.coordinate,
    }
  })
}

function detectionCoordinate(deteccion: DeteccionPlaga): MapPoint | null {
  const raw = deteccion as DeteccionPlaga & {
    latitude?: number | string
    longitude?: number | string
    lat?: number | string
    lng?: number | string
  }
  const latitude = Number(deteccion.latitud ?? raw.latitude ?? raw.lat)
  const longitude = Number(deteccion.longitud ?? raw.longitude ?? raw.lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return { latitude, longitude }
}

function loteHealthColor(loteId: string, detecciones: DeteccionPlaga[]): string {
  const severities = detecciones
    .filter((deteccion) => deteccion.loteId === loteId && ['ABIERTA', 'EN_TRATAMIENTO'].includes(deteccion.estado))
    .map((deteccion) => deteccion.severidad)

  if (severities.includes('CRITICA')) return '#FF6B6B'
  if (severities.includes('ALTA')) return '#FF8A4C'
  if (severities.includes('MEDIA')) return '#FFB84D'
  if (severities.includes('BAJA')) return '#A3E635'
  // Lote sano (sin detecciones abiertas): verde, identico a la web
  return '#9FE870'
}

function severityColorFor(value?: SeveridadPlaga): string {
  if (value === 'CRITICA') return '#FF6B6B'
  if (value === 'ALTA') return '#FF8A4C'
  if (value === 'MEDIA') return '#FFB84D'
  return '#9FE870'
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

// Arma la lista de campos del evento descartando los que no tienen valor.
function buildHistCampos(entries: Array<[string, string | number | null | undefined]>): LoteHistoryCampo[] {
  return entries
    .filter(([, value]) => value !== null && value !== undefined && `${value}`.trim() !== '')
    .map(([label, value]) => ({ label, value: `${value}` }))
}

function numAr(value?: number | null): string {
  return value === null || value === undefined ? '' : Number(value).toLocaleString('es-AR')
}

function fmtFecha(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function buildLoteHistory(
  lote: Lote | null,
  data: {
    detecciones: DeteccionPlaga[]
    aplicaciones: AplicacionFitosanitaria[]
    seguimientos: SeguimientoPlaga[]
    siembraEventos: EventoSiembra[]
    cosechas: RegistroCosecha[]
    historicoCultivos: HistoricoCultivo[]
    ordenesAplicacion?: OrdenAplicacion[]
  }
): LoteHistoryEvent[] {
  if (!lote) return []
  const deteccionesLote = data.detecciones.filter((item) => item.loteId === lote.id)
  const detectionIds = new Set(deteccionesLote.map((item) => item.id))

  const ordenEvents = (data.ordenesAplicacion ?? []).map((item): LoteHistoryEvent => ({
    id: `orden-${item.id}`,
    tipo: 'Orden de aplicación',
    titulo: `#${item.numero ?? '—'} · ${item.producto}`,
    fecha: item.fechaAplicacion,
    color: item.estado === 'ACEPTADA' ? '#6EA8FF' : item.estado === 'RECHAZADA' ? '#FF6B6B' : '#FFB84D',
    campos: buildHistCampos([
      ['N° de orden', item.numero != null ? `${item.numero}` : ''],
      ['Estado', item.estado === 'ACEPTADA' ? 'Aceptada' : item.estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente'],
      ['Plaga', item.plagaNombre],
      ['Principio activo', item.principioActivo],
      ['Dosis', `${numAr(item.dosis)} ${item.unidadDosis}`],
      ['Superficie', item.superficieTratadaHa != null ? `${numAr(item.superficieTratadaHa)} ha` : ''],
      ['Responsable', item.responsableNombre || item.responsableId],
      ['Operario', item.operarioNombre || item.operarioId],
      ['Motivo rechazo', item.motivoRechazo],
      ['Registrada', fmtFecha(item.createdAt)],
    ]),
  }))

  const deteccionEvents = deteccionesLote.map((item): LoteHistoryEvent => ({
    id: item.id,
    tipo: 'Detección',
    titulo: item.plagaNombre,
    fecha: item.fechaDeteccion,
    color: severityColorFor(item.severidad),
    campos: buildHistCampos([
      ['Tipo', item.tipoNombre || item.tipo],
      ['Cultivo', item.cultivoNombre || item.cultivo],
      ['Severidad', item.severidad],
      ['Estado', item.estado],
      ['Área afectada', item.areaAfectadaHa ? `${numAr(item.areaAfectadaHa)} ha` : ''],
      ['% afectado', item.porcentajeAfectado ? `${item.porcentajeAfectado} %` : ''],
      ['Responsable', item.responsable],
      ['Descripción', item.descripcion],
      ['Ubicación', item.latitud != null && item.longitud != null ? `${item.latitud}, ${item.longitud}` : ''],
      ['Precisión', item.precisionMetros ? `${item.precisionMetros} m` : ''],
      ['Origen', item.origenGeolocalizacion],
      ['Foto', item.fotoNombre],
      ['Registrado', fmtFecha(item.createdAt)],
    ]),
  }))

  const aplicacionEvents = data.aplicaciones
    .filter((item) => item.loteId === lote.id)
    .map((item): LoteHistoryEvent => ({
      id: item.id,
      tipo: 'Aplicación',
      titulo: item.producto,
      fecha: item.fechaAplicacion,
      color: '#6EA8FF',
      campos: buildHistCampos([
        ['Principio activo', item.principioActivo],
        ['Dosis', `${numAr(item.dosis)} ${item.unidadDosis}`],
        ['Volumen caldo', item.volumenCaldoLHa ? `${numAr(item.volumenCaldoLHa)} L/ha` : ''],
        ['Superficie tratada', item.superficieTratadaHa ? `${numAr(item.superficieTratadaHa)} ha` : ''],
        ['Período carencia', item.periodoCarenciaDias ? `${item.periodoCarenciaDias} días` : ''],
        ['Período reingreso', item.periodoReingresoHoras ? `${item.periodoReingresoHoras} h` : ''],
        ['Reingreso seguro', fmtFecha(item.fechaReingresoSeguro)],
        ['Cosecha segura', fmtFecha(item.fechaCosechaSegura)],
        ['Condiciones', item.condicionesClimaticas],
        ['Responsable', item.operarioResponsable],
        ['Observaciones', item.observaciones],
        ['Registrado', fmtFecha(item.createdAt)],
      ]),
    }))

  const seguimientoEvents = data.seguimientos
    .filter((item) => detectionIds.has(item.deteccionId))
    .map((item): LoteHistoryEvent => ({
      id: item.id,
      tipo: 'Seguimiento',
      titulo: item.plagaNombre,
      fecha: item.fecha,
      color: '#39D0D8',
      campos: buildHistCampos([
        ['Resultado', item.resultado],
        ['Severidad', item.severidad],
        ['Responsable', item.responsable],
        ['Observaciones', item.observaciones],
        ['Registrado', fmtFecha(item.createdAt)],
      ]),
    }))

  const siembraEvents = data.siembraEventos.map((item): LoteHistoryEvent => ({
    id: item.id,
    tipo: item.tipoEvento === 'SIEMBRA' ? 'Siembra' : 'Evento',
    titulo: item.estadoFenologico || item.tipoEvento,
    fecha: item.fecha,
    color: '#9FE870',
    campos: buildHistCampos([
      ['Tipo de evento', item.tipoEvento],
      ['Estado fenológico', item.estadoFenologico],
      ['Descripción', item.descripcion],
      ['Registrado', fmtFecha(item.createdAt)],
    ]),
  }))

  const cosechaEvents = data.cosechas.map((item): LoteHistoryEvent => ({
    id: item.id,
    tipo: 'Cosecha',
    titulo: `${numAr(item.rendimientoKgHa ?? 0)} kg/ha`,
    fecha: item.fecha,
    color: '#FFB84D',
    campos: buildHistCampos([
      ['Toneladas', item.toneladasTotal != null ? `${numAr(item.toneladasTotal)} tn` : ''],
      ['Calidad de grano', item.calidadGrano],
      ['Humedad', item.humedad != null ? `${item.humedad} %` : ''],
      ['Área real cosechada', item.areaRealCosechadaPct != null ? `${item.areaRealCosechadaPct} %` : ''],
      ['Ha cosechadas', item.hectareasCosechadas != null ? `${numAr(item.hectareasCosechadas)} ha` : ''],
      ['Pérdida', item.perdidaKgHa != null ? `${numAr(item.perdidaKgHa)} kg/ha` : ''],
      ['Granos perdidos', item.granosPerdidosKg != null ? `${numAr(item.granosPerdidosKg)} kg` : ''],
      ['Tipo de pérdida', item.tipoPerdidaNombre || item.tipoPerdida],
      ['Destino', item.destinoNombre || item.destino],
      ['Destino (cantidad)', item.destinoCantidadTn != null ? `${numAr(item.destinoCantidadTn)} tn` : ''],
      ['Observaciones', item.observaciones],
      ['Registrado', fmtFecha(item.createdAt)],
    ]),
  }))

  const cultivoEvents = data.historicoCultivos.flatMap((item): LoteHistoryEvent[] => {
    const events: LoteHistoryEvent[] = []
    if (item.fechaSiembra) {
      events.push({
        id: `${item.id}-siembra`,
        tipo: 'Historial',
        titulo: `Siembra ${item.cultivo}`,
        fecha: item.fechaSiembra,
        color: '#9FE870',
        campos: buildHistCampos([
          ['Cultivo', item.cultivo],
          ['Temporada', item.temporada],
          ['Observaciones', item.observaciones],
        ]),
      })
    }
    if (item.fechaCosecha) {
      events.push({
        id: `${item.id}-cosecha`,
        tipo: 'Historial',
        titulo: `Cosecha ${item.cultivo}`,
        fecha: item.fechaCosecha,
        color: '#FFB84D',
        campos: buildHistCampos([
          ['Cultivo', item.cultivo],
          ['Temporada', item.temporada],
          ['Rendimiento', item.rendimientoKgHa != null ? `${numAr(item.rendimientoKgHa)} kg/ha` : ''],
          ['Observaciones', item.observaciones],
        ]),
      })
    }
    return events
  })

  return [
    ...deteccionEvents,
    ...ordenEvents,
    ...aplicacionEvents,
    ...seguimientoEvents,
    ...siembraEvents,
    ...cosechaEvents,
    ...cultivoEvents,
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
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

function fallbackCoordinate(lote: Lote): MapPoint | null {
  const latitude = Number(lote.latitud)
  const longitude = Number(lote.longitud)
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
  weatherButton: {
    borderColor: 'rgba(159,232,112,0.32)',
    backgroundColor: 'rgba(159,232,112,0.10)',
  },
  quickCard: {
    position: 'absolute',
    top: 86,
    left: 20,
    minWidth: 122,
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
  actionBubblePrimary: {
    shadowOpacity: 0.38,
    shadowRadius: 26,
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
  detectionPreview: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    zIndex: 10000,
    elevation: 10000,
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
  previewHero: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#081225',
  },
  previewHeroPlaceholder: {
    width: '100%',
    height: 96,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#081225',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  detectionPreviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewHeadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewNavigation: {
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(11, 23, 48, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  previewNavButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,0.12)',
  },
  previewNavButtonDisabled: {
    opacity: 0.35,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  previewNavText: {
    minWidth: 32,
    color: '#DCE8F8',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  severityBadge: {
    height: 35,
    paddingHorizontal: 13,
    borderRadius: 18,
    justifyContent: 'center',
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  previewClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(166,176,207,0.12)',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  previewSubtitle: {
    color: '#A6B0CF',
    fontSize: 17,
    lineHeight: 23,
    marginTop: 4,
  },
  previewMetrics: {
    gap: 9,
    marginTop: 16,
  },
  previewLabel: {
    color: '#7E8BAA',
    fontSize: 12,
    lineHeight: 15,
  },
  previewValue: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 17,
  },
  previewAction: {
    flex: 1,
    minHeight: 41,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.28)',
  },
  previewActionText: {
    color: '#9FE870',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '900',
  },
  historyPanel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    zIndex: 10000,
    elevation: 10000,
    maxHeight: '72%',
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(8, 18, 37, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.14)',
    shadowColor: '#000000',
    shadowOpacity: 0.36,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
  },
  historyHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyEyebrow: {
    color: '#9FE870',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
    marginTop: 3,
  },
  historySubtitle: {
    color: '#A6B0CF',
    fontSize: 13,
    marginTop: 3,
  },
  historyLoading: {
    color: '#A6B0CF',
    fontSize: 13,
    paddingVertical: 18,
  },
  historyEmpty: {
    minHeight: 92,
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(11, 23, 48, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  historyEmptyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  historyEmptyText: {
    color: '#A6B0CF',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  historyList: {
    paddingBottom: 4,
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(11, 23, 48, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  historyItemOpen: {
    backgroundColor: 'rgba(9, 19, 38, 0.9)',
  },
  historyDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginTop: 5,
    shadowOpacity: 0.42,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  historyCopy: {
    flex: 1,
  },
  historyItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  historyKind: {
    color: '#9FE870',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  historyDate: {
    color: '#7E8BAA',
    fontSize: 10,
  },
  historyItemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 5,
  },
  historyDetailBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.14)',
    gap: 7,
  },
  historyDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  historyDetailLabel: {
    width: 84,
    color: '#7E8BAA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  historyDetailValue: {
    flex: 1,
    color: '#DCE8F8',
    fontSize: 12,
    lineHeight: 17,
  },
  historyDetailEmpty: {
    color: '#7E8BAA',
    fontSize: 12,
    fontStyle: 'italic',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  layersSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#081225',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.12)',
    shadowColor: '#9FE870',
    shadowOpacity: 0.12,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: -14 },
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(166,176,207,0.35)',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sheetTitleBlock: {
    flex: 1,
    paddingRight: 14,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#A6B0CF',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sheetCloseText: {
    color: '#A6B0CF',
    fontSize: 20,
    lineHeight: 22,
  },
  sheetContent: {
    paddingBottom: 18,
  },
  sheetSectionTitle: {
    color: '#9FE870',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 10,
  },
  modeList: {
    gap: 10,
  },
  modeRow: {
    minHeight: 66,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(11,23,48,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modeRowActive: {
    borderColor: 'rgba(159,232,112,0.38)',
    backgroundColor: 'rgba(159,232,112,0.1)',
  },
  modeIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    fontWeight: '700',
  },
  modeLabelActive: {
    color: '#FFFFFF',
  },
  modeDescription: {
    color: '#A6B0CF',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(166,176,207,0.45)',
  },
  radioActive: {
    borderColor: '#9FE870',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#9FE870',
  },
  layerRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  layerCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  layerLabel: {
    color: '#DCE8F8',
    fontSize: 13,
    fontWeight: '400',
  },
})
