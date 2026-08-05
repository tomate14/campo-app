import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  CloudLightning,
  Droplets,
  Gauge,
  RefreshCw,
  Sprout,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react-native'
import {
  useClimaActual,
  usePronostico,
  useRecomendaciones,
  useSincronizarClima,
} from '../../shared/hooks/useClima'
import { useLotes } from '../../shared/hooks/useLotes'
import type { Lote } from '../../shared/types/agricola'
import type { Pronostico } from '../../shared/types/clima'

const COLORS = {
  bg: '#081225',
  card: '#0B1730',
  green: '#9FE870',
  blue: '#6EA8FF',
  orange: '#FFB84D',
  white: '#FFFFFF',
  muted: '#A6B0CF',
  border: 'rgba(255,255,255,.08)',
}

export default function ClimaLoteScreen() {
  const { loteId, loteNombre } = useLocalSearchParams<{ loteId: string; loteNombre?: string }>()
  return <ClimaContent initialLoteId={loteId} initialLoteNombre={loteNombre} />
}

export function ClimaContent({
  initialLoteId,
  initialLoteNombre,
  showLotePicker = false,
}: {
  initialLoteId?: string
  initialLoteNombre?: string
  showLotePicker?: boolean
}) {
  const router = useRouter()
  const { data: lotes = [], isLoading: loadingLotes } = useLotes()
  const [selectedLoteId, setSelectedLoteId] = useState(initialLoteId ?? '')

  useEffect(() => {
    if (initialLoteId) {
      setSelectedLoteId(initialLoteId)
      return
    }
    if (!selectedLoteId && lotes[0]) {
      setSelectedLoteId(lotes[0].id)
    }
  }, [initialLoteId, lotes, selectedLoteId])

  const selectedLote = lotes.find(lote => lote.id === selectedLoteId)
  const selectedLoteName = selectedLote?.nombre ?? initialLoteNombre
  const { data: actual, isLoading, refetch: refetchActual } = useClimaActual(selectedLoteId)
  const { data: pronostico = [], refetch: refetchPronostico } = usePronostico(selectedLoteId)
  const { data: recomendaciones, refetch: refetchRecomendaciones } = useRecomendaciones(selectedLoteId)
  const sincronizar = useSincronizarClima(selectedLoteId)

  const forecast = useMemo(() => pronostico.slice(0, 7), [pronostico])
  const today = forecast[0]
  const WeatherMainIcon = weatherIconFor(actual?.condicionCodigo ?? today?.condicionCodigo, actual?.descripcion ?? today?.descripcion)
  const recommendation = recomendaciones?.recomendaciones?.[0]

  const onRefresh = async () => {
    await Promise.all([refetchActual(), refetchPronostico(), refetchRecomendaciones()])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.green} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Clima</Text>
          <View style={styles.farmRow}>
            <Text style={styles.headerSubtitle}>Establecimiento Santa Clara</Text>
            <ChevronDown size={14} color={COLORS.green} strokeWidth={2} />
          </View>
          {selectedLoteName ? <Text style={styles.loteLabel}>{selectedLoteName}</Text> : null}
        </View>
        <Pressable
          style={[styles.refreshButton, sincronizar.isPending && styles.refreshButtonLoading]}
          onPress={() => sincronizar.mutate()}
          disabled={sincronizar.isPending}
        >
          <RefreshCw size={20} color={COLORS.white} strokeWidth={2.2} />
        </Pressable>
      </View>

      {showLotePicker && (
        <LotePicker lotes={lotes} selectedLoteId={selectedLoteId} onSelect={setSelectedLoteId} />
      )}

      {isLoading || loadingLotes ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.green} />
          <Text style={styles.loadingText}>Cargando clima del lote...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={COLORS.green} />}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <View style={styles.weatherIconShell}>
                <WeatherMainIcon size={58} color={COLORS.green} strokeWidth={1.9} />
              </View>
              <Text style={styles.currentTemp}>{formatTemp(actual?.temperatura)}</Text>
              <Text style={styles.description}>{actual?.descripcion ?? today?.descripcion ?? 'Sin datos actuales'}</Text>
              <View style={styles.tempRange}>
                <Text style={styles.maxTemp}>Max {formatTemp(actual?.tempMax ?? today?.tempMax)}</Text>
                <Text style={styles.minTemp}>Min {formatTemp(actual?.tempMin ?? today?.tempMin)}</Text>
              </View>
            </View>

            <View style={styles.heroRight}>
              <Metric icon={Droplets} label="Humedad" value={formatPercent(actual?.humedadPct ?? today?.humedadPct)} color={COLORS.blue} />
              <Metric icon={Wind} label="Viento" value={`${formatWind(actual?.velocidadViento ?? today?.velocidadViento)} ${windDir(actual?.direccionViento ?? today?.direccionVientoDominante)}`} color={COLORS.green} />
              <Metric icon={CloudRain} label="Prob. lluvia" value={formatPercent(today?.probabilidadLluvia)} color={COLORS.blue} />
              <Metric icon={Gauge} label="Presión" value={actual?.presionHpa != null ? `${Math.round(Number(actual.presionHpa))} hPa` : '-'} color={COLORS.orange} />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos 7 días</Text>
          </View>

          <View style={styles.forecastCard}>
            {forecast.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Sin pronóstico disponible</Text>
                <Text style={styles.emptyText}>Actualizá el clima para consultar el pronóstico del lote.</Text>
              </View>
            ) : (
              forecast.map((item, index) => (
                <ForecastRow key={item.id ?? item.fecha} item={item} index={index} />
              ))
            )}
          </View>

          <Pressable style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <Sprout size={22} color={COLORS.green} strokeWidth={2.2} />
            </View>
            <View style={styles.recommendationCopy}>
              <Text style={styles.recommendationTitle}>{recomendaciones?.condicionGeneral ?? 'Condiciones operativas'}</Text>
              <Text style={styles.recommendationText}>
                {recommendation?.mensaje ?? 'Sin recomendaciones climáticas activas para este lote.'}
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.green} strokeWidth={2.2} />
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function Metric({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricIcon, { borderColor: `${color}33`, backgroundColor: `${color}12` }]}>
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  )
}

function LotePicker({ lotes, selectedLoteId, onSelect }: { lotes: Lote[]; selectedLoteId: string; onSelect: (id: string) => void }) {
  if (!lotes.length) return null

  return (
    <View style={styles.lotePickerWrap}>
      <Text style={styles.pickerLabel}>Lote</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lotePicker}>
        {lotes.map(lote => {
          const active = lote.id === selectedLoteId
          return (
            <Pressable key={lote.id} style={[styles.loteChip, active && styles.loteChipActive]} onPress={() => onSelect(lote.id)}>
              <Text style={[styles.loteChipText, active && styles.loteChipTextActive]}>{lote.nombre}</Text>
              {lote.cultivo ? <Text style={styles.loteChipSub}>{lote.cultivoNombre ?? lote.cultivo}</Text> : null}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

function ForecastRow({ item, index }: { item: Pronostico; index: number }) {
  const Icon = weatherIconFor(item.condicionCodigo, item.descripcion)
  const date = parseDate(item.fecha)

  return (
    <View style={[styles.forecastRow, index === 0 && styles.forecastRowFirst]}>
      <View style={styles.dayCell}>
        <Text style={styles.dayName}>{index === 0 ? 'Hoy' : formatWeekday(date)}</Text>
        <Text style={styles.dayDate}>{formatShortDate(date)}</Text>
      </View>
      <View style={styles.forecastIcon}>
        <Icon size={26} color={COLORS.green} strokeWidth={1.9} />
      </View>
      <View style={styles.tempCell}>
        <Text>
          <Text style={styles.rowMax}>{formatTemp(item.tempMax)}</Text>
          <Text style={styles.tempSlash}> / </Text>
          <Text style={styles.rowMin}>{formatTemp(item.tempMin)}</Text>
        </Text>
      </View>
      <View style={styles.rainCell}>
        <Droplets size={14} color={COLORS.blue} strokeWidth={2} />
        <Text style={styles.rainText}>{formatPercent(item.probabilidadLluvia)}</Text>
      </View>
      <View style={styles.windCell}>
        <Wind size={14} color={COLORS.muted} strokeWidth={2} />
        <Text style={styles.windText}>{formatWind(item.velocidadViento)}</Text>
        <Text style={styles.windDir}>{windDir(item.direccionVientoDominante)}</Text>
      </View>
      <ChevronDown size={18} color={COLORS.muted} strokeWidth={2} />
    </View>
  )
}

function weatherIconFor(code?: number | null, description?: string | null): LucideIcon {
  const normalized = `${description ?? ''}`.toLowerCase()
  if (code != null) {
    if ([0, 1].includes(code)) return Sun
    if ([2, 3, 45, 48].includes(code)) return CloudSun
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return CloudRain
    if (code >= 95) return CloudLightning
  }
  if (normalized.includes('torment')) return CloudLightning
  if (normalized.includes('lluv') || normalized.includes('rain')) return CloudRain
  if (normalized.includes('nube') || normalized.includes('cloud')) return Cloud
  return CloudSun
}

function formatTemp(value?: number | null) {
  if (value == null) return '-'
  return `${Math.round(Number(value))}°`
}

function formatPercent(value?: number | null) {
  if (value == null) return '-'
  return `${Math.round(Number(value))}%`
}

function formatWind(value?: number | null) {
  if (value == null) return '-'
  return `${Math.round(Number(value) * 3.6)} km/h`
}

function windDir(deg?: number | null) {
  if (deg == null) return ''
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(Number(deg) / 45) % 8]
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    minHeight: 74,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,23,48,.78)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCopy: { flex: 1 },
  headerTitle: { color: COLORS.white, fontSize: 24, lineHeight: 28, fontWeight: '900', letterSpacing: -0.4 },
  farmRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  headerSubtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 17 },
  loteLabel: { color: COLORS.green, fontSize: 11, lineHeight: 15, marginTop: 2, fontWeight: '700' },
  refreshButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,23,48,.82)',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.green,
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  refreshButtonLoading: { opacity: 0.55 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: COLORS.muted, fontSize: 13 },
  lotePickerWrap: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  pickerLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  lotePicker: { gap: 8, paddingRight: 16 },
  loteChip: {
    minHeight: 48,
    minWidth: 118,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 15,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loteChipActive: {
    backgroundColor: 'rgba(159,232,112,.12)',
    borderColor: COLORS.green,
  },
  loteChipText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  loteChipTextActive: { color: COLORS.green },
  loteChipSub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  content: { padding: 16, paddingBottom: 28, gap: 18 },
  heroCard: {
    minHeight: 260,
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.green,
    shadowOpacity: 0.08,
    shadowRadius: 28,
  },
  heroLeft: { flex: 0.95, justifyContent: 'center' },
  weatherIconShell: {
    width: 90,
    height: 90,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,.09)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,.20)',
    marginBottom: 12,
  },
  currentTemp: { color: COLORS.white, fontSize: 58, lineHeight: 64, fontWeight: '900', letterSpacing: -2.2 },
  description: { color: COLORS.muted, fontSize: 15, lineHeight: 20, textTransform: 'capitalize', marginTop: 2 },
  tempRange: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  maxTemp: { color: COLORS.orange, fontSize: 13, fontWeight: '800' },
  minTemp: { color: COLORS.blue, fontSize: 13, fontWeight: '800' },
  heroRight: {
    flex: 1.05,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    paddingLeft: 14,
    justifyContent: 'center',
  },
  metricRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,.06)',
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  metricCopy: { flex: 1 },
  metricLabel: { color: COLORS.muted, fontSize: 11, lineHeight: 14 },
  metricValue: { color: COLORS.white, fontSize: 13, lineHeight: 17, fontWeight: '800', marginTop: 1 },
  sectionHeader: { marginTop: 2 },
  sectionTitle: { color: COLORS.white, fontSize: 20, lineHeight: 26, fontWeight: '900', letterSpacing: -0.25 },
  forecastCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forecastRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,.06)',
  },
  forecastRowFirst: { borderTopWidth: 0 },
  dayCell: { width: 48 },
  dayName: { color: COLORS.white, fontSize: 14, lineHeight: 18, fontWeight: '900' },
  dayDate: { color: COLORS.muted, fontSize: 11, lineHeight: 15, marginTop: 2 },
  forecastIcon: { width: 34, alignItems: 'center' },
  tempCell: { flex: 1.05 },
  rowMax: { color: COLORS.orange, fontSize: 14, fontWeight: '900' },
  tempSlash: { color: COLORS.muted, fontSize: 13 },
  rowMin: { color: COLORS.blue, fontSize: 14, fontWeight: '900' },
  rainCell: { width: 44, flexDirection: 'row', alignItems: 'center', gap: 4 },
  rainText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  windCell: { width: 74, gap: 2 },
  windText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  windDir: { color: COLORS.muted, fontSize: 10, lineHeight: 12 },
  emptyBox: { padding: 20, gap: 4 },
  emptyTitle: { color: COLORS.white, fontSize: 15, fontWeight: '900' },
  emptyText: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  recommendationCard: {
    minHeight: 104,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,.38)',
    shadowColor: COLORS.green,
    shadowOpacity: 0.14,
    shadowRadius: 26,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,.10)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,.30)',
  },
  recommendationCopy: { flex: 1 },
  recommendationTitle: { color: COLORS.white, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  recommendationText: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
})
