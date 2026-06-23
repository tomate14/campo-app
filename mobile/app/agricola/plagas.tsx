import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import * as Location from 'expo-location'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardList,
  Crosshair,
  History,
  Leaf,
  MapPinned,
  Plus,
  Search,
  SprayCan,
  User,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import {
  createAplicacionFitosanitaria,
  createDeteccionPlaga,
  createSeguimientoPlaga,
  getAplicacionesFitosanitarias,
  getCatalogoPlagas,
  getCosechasByLote,
  getDeteccionesPlaga,
  getEventosByLote,
  getHistorialByLote,
  getLotes,
  getSeguimientosPlaga,
} from '../../shared/api/agricola'
import { getOperarios } from '../../shared/api/operarios'
import type {
  AplicacionFitosanitaria,
  AplicacionFitosanitariaRequest,
  CatalogoPlaga,
  DeteccionPlaga,
  DeteccionPlagaRequest,
  EstadoDeteccionPlaga,
  EventoSiembra,
  HistoricoCultivo,
  Lote,
  RegistroCosecha,
  ResultadoSeguimientoPlaga,
  SeguimientoPlaga,
  SeguimientoPlagaRequest,
  SeveridadPlaga,
} from '../../shared/types/agricola'
import type { Operario } from '../../shared/types/operarios'

type Mode = 'deteccion' | 'aplicacion' | 'seguimiento' | 'historico'
type HistoryScope = 'deteccion' | 'lote'
type HistoryItem = {
  id: string
  type: string
  title: string
  subtitle?: string
  date?: string
  tone: string
}

const severityOptions: SeveridadPlaga[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']
const stateOptions: EstadoDeteccionPlaga[] = ['ABIERTA', 'EN_TRATAMIENTO', 'CONTROLADA', 'CERRADA']
const resultOptions: ResultadoSeguimientoPlaga[] = ['SIN_CAMBIOS', 'MEJORA', 'EMPEORA', 'CONTROLADA']
const tabs: Array<{ mode: Mode; label: string; Icon: LucideIcon }> = [
  { mode: 'deteccion', label: 'Detección', Icon: Crosshair },
  { mode: 'aplicacion', label: 'Aplicación', Icon: SprayCan },
  { mode: 'seguimiento', label: 'Seguimiento', Icon: Leaf },
  { mode: 'historico', label: 'Histórico', Icon: History },
]

function nowLocalDateTime() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function formatDate(value?: string) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function cleanNumber(value: string) {
  const normalized = value.replace(',', '.').trim()
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function selectedLoteName(lotes: Lote[], id: string) {
  return lotes.find(lote => lote.id === id)?.nombre ?? 'Lote'
}

function normalizeMode(value?: string | string[]): Mode {
  const mode = Array.isArray(value) ? value[0] : value
  if (mode === 'aplicacion' || mode === 'seguimiento' || mode === 'historico') return mode
  return 'deteccion'
}

export default function PlagasMobilePage() {
  const router = useRouter()
  const params = useLocalSearchParams<{ mode?: string; loteId?: string; deteccionId?: string }>()
  const [mode, setMode] = useState<Mode>(normalizeMode(params.mode))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [lotes, setLotes] = useState<Lote[]>([])
  const [catalogo, setCatalogo] = useState<CatalogoPlaga[]>([])
  const [detecciones, setDetecciones] = useState<DeteccionPlaga[]>([])
  const [aplicaciones, setAplicaciones] = useState<AplicacionFitosanitaria[]>([])
  const [seguimientos, setSeguimientos] = useState<SeguimientoPlaga[]>([])
  const [operarios, setOperarios] = useState<Operario[]>([])
  const [selectedDetectionId, setSelectedDetectionId] = useState('')
  const [selectedHistoryLoteId, setSelectedHistoryLoteId] = useState('')
  const [historyScope, setHistoryScope] = useState<HistoryScope>(params.deteccionId ? 'deteccion' : 'lote')
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])

  const [deteccionForm, setDeteccionForm] = useState<DeteccionPlagaRequest>({
    loteId: '',
    catalogoPlagaId: '',
    severidad: 'MEDIA',
    estado: 'ABIERTA',
    origenGeolocalizacion: 'MOBILE_GPS',
    fechaDeteccion: nowLocalDateTime(),
  })
  const [aplicacionForm, setAplicacionForm] = useState<AplicacionFitosanitariaRequest>({
    fechaAplicacion: nowLocalDateTime(),
    producto: '',
    dosis: 0,
    unidadDosis: 'l/ha',
    operarioResponsableId: '',
    operarioResponsable: '',
  })
  const [seguimientoForm, setSeguimientoForm] = useState<SeguimientoPlagaRequest>({
    fecha: nowLocalDateTime(),
    resultado: 'SIN_CAMBIOS',
    severidad: 'MEDIA',
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    setMode(normalizeMode(params.mode))
    setSelectedDetectionId(params.deteccionId ?? '')
    if (params.loteId) {
      setSelectedHistoryLoteId(params.loteId)
      setDeteccionForm(current => ({ ...current, loteId: params.loteId ?? current.loteId }))
    }
    if (normalizeMode(params.mode) === 'historico') {
      setHistoryScope(params.deteccionId ? 'deteccion' : 'lote')
    }
  }, [params.mode, params.deteccionId, params.loteId])

  useEffect(() => {
    if (mode !== 'historico') return
    if (historyScope === 'deteccion' && selectedDetectionId) {
      loadDetectionHistory(selectedDetectionId)
      return
    }
    if (selectedHistoryLoteId) {
      loadHistory(selectedHistoryLoteId)
    }
  }, [mode, historyScope, selectedDetectionId, selectedHistoryLoteId])

  async function loadInitialData() {
    try {
      const [lotesData, catalogoData, deteccionesData, aplicacionesData, seguimientosData, operariosData] = await Promise.all([
        getLotes(),
        getCatalogoPlagas(),
        getDeteccionesPlaga(),
        getAplicacionesFitosanitarias(),
        getSeguimientosPlaga(),
        getOperarios({ estado: 'ACTIVO' }),
      ])
      const firstLote = lotesData[0]
      const firstPlaga = catalogoData[0]
      setLotes(lotesData)
      setCatalogo(catalogoData)
      setDetecciones(deteccionesData)
      setAplicaciones(aplicacionesData)
      setSeguimientos(seguimientosData)
      setOperarios(operariosData)
      setSelectedDetectionId(params.deteccionId ?? '')
      setSelectedHistoryLoteId(params.loteId ?? firstLote?.id ?? '')
      setDeteccionForm(current => ({
        ...current,
        loteId: params.loteId ?? firstLote?.id ?? '',
        catalogoPlagaId: firstPlaga?.id ?? '',
        cultivo: lotesData.find(lote => lote.id === params.loteId)?.cultivo ?? firstLote?.cultivo,
      }))
    } catch {
      Alert.alert('Control de plagas', 'No se pudieron cargar los datos iniciales.')
    } finally {
      setLoading(false)
    }
  }

  async function refreshOperationalData() {
    const [deteccionesData, aplicacionesData, seguimientosData] = await Promise.all([
      getDeteccionesPlaga(),
      getAplicacionesFitosanitarias(),
      getSeguimientosPlaga(),
    ])
    setDetecciones(deteccionesData)
    setAplicaciones(aplicacionesData)
    setSeguimientos(seguimientosData)
  }

  async function captureLocation() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert('Ubicación', 'No se otorgó permiso para usar la ubicación del dispositivo.')
        return
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setDeteccionForm(form => ({
        ...form,
        latitud: Number(current.coords.latitude.toFixed(7)),
        longitud: Number(current.coords.longitude.toFixed(7)),
        precisionMetros: Math.round(current.coords.accuracy ?? 0),
        origenGeolocalizacion: 'MOBILE_GPS',
      }))
    } catch {
      Alert.alert('Ubicación', 'No se pudo obtener la ubicación del dispositivo.')
    }
  }

  async function saveDeteccion() {
    if (!deteccionForm.loteId || !deteccionForm.catalogoPlagaId || !deteccionForm.responsableId) {
      Alert.alert('Nueva detección', 'Seleccioná lote, plaga y responsable antes de guardar.')
      return
    }
    setSaving(true)
    try {
      const saved = await createDeteccionPlaga(deteccionForm)
      await refreshOperationalData()
      setSelectedDetectionId(saved.id)
      Alert.alert('Nueva detección', 'Detección registrada correctamente.', [{ text: 'OK', onPress: () => router.replace('/(tabs)/lotes') }])
    } catch {
      Alert.alert('Nueva detección', 'No se pudo guardar la detección.')
    } finally {
      setSaving(false)
    }
  }

  async function saveAplicacion() {
    if (!selectedDetectionId || !aplicacionForm.producto || !aplicacionForm.operarioResponsableId) {
      Alert.alert('Registrar aplicación', 'Seleccioná detección, producto y responsable antes de guardar.')
      return
    }
    setSaving(true)
    try {
      await createAplicacionFitosanitaria(selectedDetectionId, aplicacionForm)
      await refreshOperationalData()
      Alert.alert('Registrar aplicación', 'Aplicación registrada correctamente.', [{ text: 'OK', onPress: () => router.replace('/(tabs)/lotes') }])
    } catch {
      Alert.alert('Registrar aplicación', 'No se pudo guardar la aplicación.')
    } finally {
      setSaving(false)
    }
  }

  async function saveSeguimiento() {
    if (!selectedDetectionId || !seguimientoForm.responsableId) {
      Alert.alert('Registrar seguimiento', 'Seleccioná detección y responsable antes de guardar.')
      return
    }
    setSaving(true)
    try {
      await createSeguimientoPlaga(selectedDetectionId, seguimientoForm)
      await refreshOperationalData()
      Alert.alert('Registrar seguimiento', 'Seguimiento registrado correctamente.', [{ text: 'OK', onPress: () => router.replace('/(tabs)/lotes') }])
    } catch {
      Alert.alert('Registrar seguimiento', 'No se pudo guardar el seguimiento.')
    } finally {
      setSaving(false)
    }
  }

  async function loadHistory(loteId: string) {
    setHistoryLoading(true)
    try {
      const [eventos, cosechas, cultivos] = await Promise.all([
        getEventosByLote(loteId),
        getCosechasByLote(loteId),
        getHistorialByLote(loteId),
      ])
      const deteccionesLoteActual = detecciones.filter(item => item.loteId === loteId)
      const deteccionIds = new Set(deteccionesLoteActual.map(item => item.id))
      const items: HistoryItem[] = [
        ...eventos.map(toEventHistory),
        ...cosechas.map(toCosechaHistory),
        ...cultivos.map(toCultivoHistory),
        ...deteccionesLoteActual.map(toDeteccionHistory),
        ...aplicaciones.filter(item => deteccionIds.has(item.deteccionId)).map(toAplicacionHistory),
        ...seguimientos.filter(item => deteccionIds.has(item.deteccionId)).map(toSeguimientoHistory),
      ].sort((a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime())
      setHistoryItems(items)
    } catch {
      Alert.alert('Histórico', 'No se pudo cargar el histórico del lote.')
    } finally {
      setHistoryLoading(false)
    }
  }

  async function loadDetectionHistory(deteccionId: string) {
    setHistoryLoading(true)
    try {
      const deteccion = detecciones.find(item => item.id === deteccionId)
      if (!deteccion) {
        setHistoryItems([])
        return
      }
      const items: HistoryItem[] = [
        toDeteccionHistory(deteccion),
        ...aplicaciones.filter(item => item.deteccionId === deteccionId).map(toAplicacionHistory),
        ...seguimientos.filter(item => item.deteccionId === deteccionId).map(toSeguimientoHistory),
      ].sort((a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime())
      setHistoryItems(items)
    } catch {
      Alert.alert('Historico', 'No se pudo cargar el historico de la deteccion.')
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#9FE870" />
          <Text style={styles.loadingText}>Cargando datos operativos...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#9FE870" size={22} strokeWidth={2} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Control de plagas</Text>
            <Text style={styles.subtitle}>Registrar detecciones, aplicaciones, seguimientos e histórico.</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {tabs.map(({ mode: itemMode, label, Icon }) => (
            <Pressable key={itemMode} style={[styles.tab, mode === itemMode && styles.tabActive]} onPress={() => {
              if (itemMode === 'historico' && !params.deteccionId) {
                setHistoryScope('lote')
              }
              setMode(itemMode)
            }}>
              <Icon color={mode === itemMode ? '#9FE870' : '#A6B0CF'} size={18} strokeWidth={2} />
              <Text style={[styles.tabText, mode === itemMode && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          {mode === 'deteccion' && (
            <DetectionForm
              catalogo={catalogo}
              form={deteccionForm}
              lotes={lotes}
              operarios={operarios}
              saving={saving}
              onCaptureLocation={captureLocation}
              onSave={saveDeteccion}
              setForm={setDeteccionForm}
            />
          )}

          {mode === 'aplicacion' && (
            <ApplicationForm
              detecciones={detecciones}
              form={aplicacionForm}
              lockedDetectionId={params.deteccionId}
              operarios={operarios}
              saving={saving}
              selectedDetectionId={selectedDetectionId}
              onSave={saveAplicacion}
              setForm={setAplicacionForm}
              setSelectedDetectionId={setSelectedDetectionId}
            />
          )}

          {mode === 'seguimiento' && (
            <FollowUpForm
              detecciones={detecciones}
              form={seguimientoForm}
              lockedDetectionId={params.deteccionId}
              operarios={operarios}
              saving={saving}
              selectedDetectionId={selectedDetectionId}
              onSave={saveSeguimiento}
              setForm={setSeguimientoForm}
              setSelectedDetectionId={setSelectedDetectionId}
            />
          )}

          {mode === 'historico' && (
            <HistoryView
              historyItems={historyItems}
              historyLoading={historyLoading}
              historyScope={historyScope}
              lotes={lotes}
              detecciones={detecciones}
              selectedDetectionId={selectedDetectionId}
              selectedHistoryLoteId={selectedHistoryLoteId}
              setHistoryScope={setHistoryScope}
              setSelectedDetectionId={setSelectedDetectionId}
              setSelectedHistoryLoteId={setSelectedHistoryLoteId}
              onRefresh={() => historyScope === 'deteccion' ? selectedDetectionId && loadDetectionHistory(selectedDetectionId) : selectedHistoryLoteId && loadHistory(selectedHistoryLoteId)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function DetectionForm({
  catalogo,
  form,
  lotes,
  operarios,
  saving,
  onCaptureLocation,
  onSave,
  setForm,
}: {
  catalogo: CatalogoPlaga[]
  form: DeteccionPlagaRequest
  lotes: Lote[]
  operarios: Operario[]
  saving: boolean
  onCaptureLocation: () => void
  onSave: () => void
  setForm: React.Dispatch<React.SetStateAction<DeteccionPlagaRequest>>
}) {
  return (
    <>
      <SectionTitle icon={<Crosshair color="#9FE870" size={18} />} title="Nueva detección" subtitle="Registro geolocalizado de plaga o enfermedad." />
      <OptionPicker label="Lote" items={lotes.map(lote => ({ id: lote.id, label: lote.nombre, sublabel: lote.cultivo }))} value={form.loteId} onChange={(id) => {
        const lote = lotes.find(item => item.id === id)
        setForm(current => ({ ...current, loteId: id, cultivo: lote?.cultivo }))
      }} />
      <OptionPicker label="Plaga" items={catalogo.map(item => ({ id: item.id, label: item.nombreComun, sublabel: item.tipo }))} value={form.catalogoPlagaId} onChange={(id) => setForm(current => ({ ...current, catalogoPlagaId: id }))} />
      <Field label="Fecha" icon={<CalendarDays color="#6EA8FF" size={18} />} value={form.fechaDeteccion ?? ''} onChangeText={(value) => setForm(current => ({ ...current, fechaDeteccion: value }))} />
      <Field label="Cultivo" icon={<Leaf color="#39D0D8" size={18} />} value={form.cultivo ?? ''} onChangeText={(value) => setForm(current => ({ ...current, cultivo: value }))} />
      <ChipGroup label="Severidad" value={form.severidad} options={severityOptions} onChange={(value) => setForm(current => ({ ...current, severidad: value as SeveridadPlaga }))} />
      <ChipGroup label="Estado" value={form.estado ?? 'ABIERTA'} options={stateOptions} onChange={(value) => setForm(current => ({ ...current, estado: value as EstadoDeteccionPlaga }))} />
      <View style={styles.gridTwo}>
        <Field label="Área afectada ha" keyboardType="numeric" value={form.areaAfectadaHa?.toString() ?? ''} onChangeText={(value) => setForm(current => ({ ...current, areaAfectadaHa: cleanNumber(value) }))} />
        <Field label="% afectado" keyboardType="numeric" value={form.porcentajeAfectado?.toString() ?? ''} onChangeText={(value) => setForm(current => ({ ...current, porcentajeAfectado: cleanNumber(value) }))} />
      </View>
      <View style={styles.coordPanel}>
        <View>
          <Text style={styles.coordLabel}>Coordenadas</Text>
          <Text style={styles.coordValue}>Lat {form.latitud ?? '-'} · Lng {form.longitud ?? '-'}</Text>
        </View>
        <Pressable style={styles.coordButton} onPress={onCaptureLocation}>
          <MapPinned color="#9FE870" size={18} />
          <Text style={styles.coordButtonText}>GPS</Text>
        </Pressable>
      </View>
      <ResponsibleSelect label="Responsable" value={form.responsableId ?? ''} operarios={operarios} onChange={(value) => setForm(current => ({ ...current, responsableId: value }))} />
      <Textarea label="Descripción" value={form.descripcion ?? ''} onChangeText={(value) => setForm(current => ({ ...current, descripcion: value.slice(0, 500) }))} />
      <PrimaryButton icon={<Plus color="#081225" size={22} />} label={saving ? 'Guardando...' : 'Registrar detección'} disabled={saving} onPress={onSave} />
    </>
  )
}

function ApplicationForm({
  detecciones,
  form,
  lockedDetectionId,
  operarios,
  saving,
  selectedDetectionId,
  onSave,
  setForm,
  setSelectedDetectionId,
}: {
  detecciones: DeteccionPlaga[]
  form: AplicacionFitosanitariaRequest
  lockedDetectionId?: string
  operarios: Operario[]
  saving: boolean
  selectedDetectionId: string
  onSave: () => void
  setForm: React.Dispatch<React.SetStateAction<AplicacionFitosanitariaRequest>>
  setSelectedDetectionId: (value: string) => void
}) {
  return (
    <>
      <SectionTitle icon={<SprayCan color="#6EA8FF" size={18} />} title="Registrar aplicación" subtitle="Tratamiento fitosanitario asociado a una detección." />
      <OptionPicker label="Detección" items={(lockedDetectionId ? detecciones.filter(item => item.id === lockedDetectionId) : detecciones).map(item => ({ id: item.id, label: item.plagaNombre, sublabel: item.loteNombre }))} value={selectedDetectionId} onChange={setSelectedDetectionId} />
      <Field label="Fecha actual" icon={<CalendarDays color="#6EA8FF" size={18} />} value={form.fechaAplicacion ?? ''} onChangeText={(value) => setForm(current => ({ ...current, fechaAplicacion: value }))} />
      <Field label="Producto" value={form.producto} onChangeText={(value) => setForm(current => ({ ...current, producto: value }))} />
      <Field label="Principio activo" value={form.principioActivo ?? ''} onChangeText={(value) => setForm(current => ({ ...current, principioActivo: value }))} />
      <View style={styles.gridTwo}>
        <View style={styles.gridField}>
          <Field label="Dosis" keyboardType="numeric" value={form.dosis ? String(form.dosis) : ''} onChangeText={(value) => setForm(current => ({ ...current, dosis: cleanNumber(value) ?? 0 }))} />
        </View>
        <View style={styles.gridField}>
          <Field label="Unidad" value={form.unidadDosis} onChangeText={(value) => setForm(current => ({ ...current, unidadDosis: value }))} />
        </View>
      </View>
      <View style={styles.gridTwo}>
        <View style={styles.gridField}>
          <Field label="Superficie ha" keyboardType="numeric" value={form.superficieTratadaHa?.toString() ?? ''} onChangeText={(value) => setForm(current => ({ ...current, superficieTratadaHa: cleanNumber(value) }))} />
        </View>
        <View style={styles.gridField}>
          <Field label="Carencia días" keyboardType="numeric" value={form.periodoCarenciaDias?.toString() ?? ''} onChangeText={(value) => setForm(current => ({ ...current, periodoCarenciaDias: cleanNumber(value) }))} />
        </View>
      </View>
      <Field label="Reingreso horas" keyboardType="numeric" value={form.periodoReingresoHoras?.toString() ?? ''} onChangeText={(value) => setForm(current => ({ ...current, periodoReingresoHoras: cleanNumber(value) }))} />
      <ResponsibleSelect label="Responsable" value={form.operarioResponsableId ?? ''} operarios={operarios} onChange={(value) => setForm(current => ({ ...current, operarioResponsableId: value }))} />
      <Textarea label="Observaciones" value={form.observaciones ?? ''} onChangeText={(value) => setForm(current => ({ ...current, observaciones: value.slice(0, 500) }))} />
      <PrimaryButton icon={<SprayCan color="#081225" size={22} />} label={saving ? 'Guardando...' : 'Registrar aplicación'} disabled={saving} onPress={onSave} />
    </>
  )
}

function FollowUpForm({
  detecciones,
  form,
  lockedDetectionId,
  operarios,
  saving,
  selectedDetectionId,
  onSave,
  setForm,
  setSelectedDetectionId,
}: {
  detecciones: DeteccionPlaga[]
  form: SeguimientoPlagaRequest
  lockedDetectionId?: string
  operarios: Operario[]
  saving: boolean
  selectedDetectionId: string
  onSave: () => void
  setForm: React.Dispatch<React.SetStateAction<SeguimientoPlagaRequest>>
  setSelectedDetectionId: (value: string) => void
}) {
  return (
    <>
      <SectionTitle icon={<Leaf color="#39D0D8" size={18} />} title="Registrar seguimiento" subtitle="Evolución posterior a la detección o tratamiento." />
      <OptionPicker label="Detección" items={(lockedDetectionId ? detecciones.filter(item => item.id === lockedDetectionId) : detecciones).map(item => ({ id: item.id, label: item.plagaNombre, sublabel: item.loteNombre }))} value={selectedDetectionId} onChange={setSelectedDetectionId} />
      <Field label="Fecha actual" icon={<CalendarDays color="#6EA8FF" size={18} />} value={form.fecha ?? ''} onChangeText={(value) => setForm(current => ({ ...current, fecha: value }))} />
      <ChipGroup label="Resultado" value={form.resultado} options={resultOptions} onChange={(value) => setForm(current => ({ ...current, resultado: value as ResultadoSeguimientoPlaga }))} />
      <ChipGroup label="Severidad" value={form.severidad} options={severityOptions} onChange={(value) => setForm(current => ({ ...current, severidad: value as SeveridadPlaga }))} />
      <ResponsibleSelect label="Responsable" value={form.responsableId ?? ''} operarios={operarios} onChange={(value) => setForm(current => ({ ...current, responsableId: value }))} />
      <Textarea label="Observaciones" value={form.observaciones ?? ''} onChangeText={(value) => setForm(current => ({ ...current, observaciones: value.slice(0, 500) }))} />
      <PrimaryButton icon={<ClipboardList color="#081225" size={22} />} label={saving ? 'Guardando...' : 'Registrar seguimiento'} disabled={saving} onPress={onSave} />
    </>
  )
}

function HistoryView({
  historyItems,
  historyLoading,
  historyScope,
  lotes,
  detecciones,
  selectedDetectionId,
  selectedHistoryLoteId,
  setHistoryScope,
  setSelectedDetectionId,
  setSelectedHistoryLoteId,
  onRefresh,
}: {
  historyItems: HistoryItem[]
  historyLoading: boolean
  historyScope: HistoryScope
  lotes: Lote[]
  detecciones: DeteccionPlaga[]
  selectedDetectionId: string
  selectedHistoryLoteId: string
  setHistoryScope: (value: HistoryScope) => void
  setSelectedDetectionId: (value: string) => void
  setSelectedHistoryLoteId: (value: string) => void
  onRefresh: () => void
}) {
  const selectedDetection = detecciones.find(item => item.id === selectedDetectionId)

  return (
    <>
      <SectionTitle
        icon={<History color="#FFB84D" size={18} />}
        title={historyScope === 'deteccion' ? 'Historico de la deteccion' : 'Historico del lote'}
        subtitle={historyScope === 'deteccion' ? 'Aplicaciones y seguimientos sobre la plaga seleccionada.' : 'Detecciones, aplicaciones, seguimientos, siembras y cosechas.'}
      />
      <View style={styles.chipRow}>
        <Pressable style={[styles.statusChip, historyScope === 'deteccion' && styles.statusChipActive]} onPress={() => setHistoryScope('deteccion')}>
          <Text style={[styles.statusChipText, historyScope === 'deteccion' && styles.statusChipTextActive]}>Deteccion</Text>
        </Pressable>
        <Pressable style={[styles.statusChip, historyScope === 'lote' && styles.statusChipActive]} onPress={() => setHistoryScope('lote')}>
          <Text style={[styles.statusChipText, historyScope === 'lote' && styles.statusChipTextActive]}>Lote</Text>
        </Pressable>
      </View>
      {historyScope === 'deteccion' ? (
        <OptionPicker label="Deteccion" items={detecciones.map(item => ({ id: item.id, label: item.plagaNombre, sublabel: item.loteNombre }))} value={selectedDetectionId} onChange={setSelectedDetectionId} />
      ) : (
        <OptionPicker label="Lote" items={lotes.map(lote => ({ id: lote.id, label: lote.nombre, sublabel: lote.cultivo }))} value={selectedHistoryLoteId} onChange={setSelectedHistoryLoteId} />
      )}
      <Pressable style={styles.secondaryAction} onPress={onRefresh}>
        <History color="#9FE870" size={18} />
        <Text style={styles.secondaryActionText}>Actualizar historico</Text>
      </Pressable>
      {historyLoading ? (
        <ActivityIndicator color="#9FE870" />
      ) : historyItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin registros</Text>
          <Text style={styles.emptyText}>No hay eventos asociados a {historyScope === 'deteccion' ? selectedDetection?.plagaNombre ?? 'esta deteccion' : selectedLoteName(lotes, selectedHistoryLoteId)}.</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {historyItems.map(item => (
            <View key={`${item.type}-${item.id}`} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: item.tone }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineType}>{item.type}</Text>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={styles.timelineSubtitle}>{item.subtitle}</Text> : null}
                <Text style={styles.timelineDate}>{formatDate(item.date)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  )
}
function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionIcon}>{icon}</View>
      <View>
        <Text style={styles.sectionHeading}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  )
}

function OptionPicker({ label, items, value, onChange }: { label: string; items: Array<{ id: string; label: string; sublabel?: string }>; value: string; onChange: (id: string) => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
        {items.map(item => {
          const active = item.id === value
          return (
            <Pressable key={item.id} style={[styles.optionChip, active && styles.optionChipActive]} onPress={() => onChange(item.id)}>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{item.label}</Text>
              {item.sublabel ? <Text style={styles.optionSublabel}>{item.sublabel}</Text> : null}
              {active ? <Check color="#9FE870" size={16} /> : null}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

function ChipGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(option => {
          const active = option === value
          return (
            <Pressable key={option} style={[styles.statusChip, active && styles.statusChipActive]} onPress={() => onChange(option)}>
              <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>{option.replace('_', ' ')}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function ResponsibleSelect({ label, value, operarios, onChange }: { label: string; value: string; operarios: Operario[]; onChange: (value: string) => void }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return operarios
      .filter(item => !term || [item.nombreCompleto, item.username, item.documentoNumero, item.rolOperativo].some(field => field?.toLowerCase().includes(term)))
      .slice(0, 6)
  }, [operarios, query])

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.searchBox}>
        <Search color="#6EA8FF" size={18} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar responsable"
          placeholderTextColor="#64748B"
        />
      </View>
      <ScrollView style={styles.peopleList} contentContainerStyle={styles.peopleListContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {filtered.map(item => {
          const active = item.id === value
          return (
            <Pressable key={item.id} style={[styles.personItem, active && styles.personItemActive]} onPress={() => {
              onChange(item.id)
              setQuery(item.nombreCompleto)
            }}>
              <View style={styles.personIcon}>
                <User color={active ? '#9FE870' : '#A6B0CF'} size={16} />
              </View>
              <View style={styles.personText}>
                <Text style={styles.personName}>{item.nombreCompleto}</Text>
                <Text style={styles.personRole}>{item.rolOperativo ?? item.username ?? 'Operario'}</Text>
              </View>
              {active ? <Check color="#9FE870" size={16} /> : null}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

function Field({ label, icon, value, onChangeText, keyboardType }: { label: string; icon?: React.ReactNode; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'numeric' }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        {icon}
        <TextInput
          style={styles.input}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#64748B"
        />
      </View>
    </View>
  )
}

function Textarea({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.textarea}
        multiline
        maxLength={500}
        value={value}
        onChangeText={onChangeText}
        placeholder="Observaciones..."
        placeholderTextColor="#64748B"
        textAlignVertical="top"
      />
      <Text style={styles.counter}>{value.length} / 500</Text>
    </View>
  )
}

function PrimaryButton({ icon, label, disabled, onPress }: { icon: React.ReactNode; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.primaryButton, disabled && styles.disabledButton]} disabled={disabled} onPress={onPress}>
      {icon}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  )
}

function toEventHistory(item: EventoSiembra): HistoryItem {
  return {
    id: item.id,
    type: 'Evento',
    title: item.tipoEvento.replace('_', ' '),
    subtitle: item.descripcion ?? item.estadoFenologico,
    date: item.fecha,
    tone: '#9FE870',
  }
}

function toCosechaHistory(item: RegistroCosecha): HistoryItem {
  return {
    id: item.id,
    type: 'Cosecha',
    title: `${Math.round(item.rendimientoKgHa)} kg/ha`,
    subtitle: `${item.toneladasTotal} tn totales`,
    date: item.fecha,
    tone: '#FFB84D',
  }
}

function toCultivoHistory(item: HistoricoCultivo): HistoryItem {
  return {
    id: item.id,
    type: 'Ciclo agrícola',
    title: `${item.cultivo} · ${item.temporada}`,
    subtitle: item.observaciones,
    date: item.fechaSiembra ?? item.createdAt,
    tone: '#6EA8FF',
  }
}

function toDeteccionHistory(item: DeteccionPlaga): HistoryItem {
  return {
    id: item.id,
    type: 'Detección',
    title: item.plagaNombre,
    subtitle: `${item.severidad} · ${item.estado}`,
    date: item.fechaDeteccion,
    tone: '#9A7DFF',
  }
}

function toAplicacionHistory(item: AplicacionFitosanitaria): HistoryItem {
  return {
    id: item.id,
    type: 'Aplicación',
    title: item.producto,
    subtitle: `${item.dosis} ${item.unidadDosis} · ${item.operarioResponsable}`,
    date: item.fechaAplicacion,
    tone: '#39D0D8',
  }
}

function toSeguimientoHistory(item: SeguimientoPlaga): HistoryItem {
  return {
    id: item.id,
    type: 'Seguimiento',
    title: item.resultado.replace('_', ' '),
    subtitle: `${item.severidad}${item.responsable ? ` · ${item.responsable}` : ''}`,
    date: item.fecha,
    tone: '#FFB84D',
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#081225' },
  container: { padding: 18, paddingBottom: 40, gap: 16 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#A6B0CF', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,23,48,.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  headerText: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#A6B0CF', fontSize: 13, lineHeight: 18, marginTop: 3 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { flexGrow: 1, minWidth: '47%', height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 999, backgroundColor: 'rgba(11,23,48,.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  tabActive: { borderColor: 'rgba(159,232,112,.75)', backgroundColor: 'rgba(159,232,112,.12)', shadowColor: '#9FE870', shadowOpacity: 0.16, shadowRadius: 18 },
  tabText: { color: '#A6B0CF', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#9FE870' },
  card: { borderRadius: 24, padding: 16, backgroundColor: '#0B1730', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', gap: 14, shadowColor: '#9FE870', shadowOpacity: 0.08, shadowRadius: 30 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  sectionIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(159,232,112,.08)', borderWidth: 1, borderColor: 'rgba(159,232,112,.22)' },
  sectionHeading: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { color: '#A6B0CF', fontSize: 12, marginTop: 2 },
  fieldGroup: { gap: 8 },
  label: { color: '#A6B0CF', fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  optionRow: { gap: 8, paddingRight: 4 },
  optionChip: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 18, paddingHorizontal: 14, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  optionChipActive: { backgroundColor: 'rgba(159,232,112,.13)', borderColor: '#9FE870' },
  optionLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  optionLabelActive: { color: '#9FE870' },
  optionSublabel: { color: '#A6B0CF', fontSize: 11 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { minHeight: 38, justifyContent: 'center', borderRadius: 999, paddingHorizontal: 12, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  statusChipActive: { backgroundColor: 'rgba(159,232,112,.12)', borderColor: '#9FE870' },
  statusChipText: { color: '#A6B0CF', fontSize: 11, fontWeight: '600' },
  statusChipTextActive: { color: '#9FE870' },
  gridTwo: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  gridField: { flex: 1, minWidth: 0 },
  inputShell: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 12, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 14, paddingVertical: 0 },
  textarea: { minHeight: 104, borderRadius: 20, padding: 14, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', color: '#FFFFFF', fontSize: 14 },
  counter: { alignSelf: 'flex-end', color: '#A6B0CF', fontSize: 11, marginTop: -2 },
  coordPanel: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 20, padding: 12, backgroundColor: 'rgba(57,208,216,.06)', borderWidth: 1, borderColor: 'rgba(57,208,216,.16)' },
  coordLabel: { color: '#A6B0CF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  coordValue: { color: '#FFFFFF', fontSize: 13, marginTop: 4 },
  coordButton: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 16, paddingHorizontal: 12, backgroundColor: 'rgba(159,232,112,.12)', borderWidth: 1, borderColor: 'rgba(159,232,112,.35)' },
  coordButtonText: { color: '#9FE870', fontSize: 12, fontWeight: '800' },
  searchBox: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 12, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14, paddingVertical: 0 },
  peopleList: { maxHeight: 124 },
  peopleListContent: { gap: 8 },
  personItem: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 10, backgroundColor: 'rgba(8,18,37,.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,.06)' },
  personItemActive: { borderColor: 'rgba(159,232,112,.6)', backgroundColor: 'rgba(159,232,112,.10)' },
  personIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.04)' },
  personText: { flex: 1 },
  personName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  personRole: { color: '#A6B0CF', fontSize: 11, marginTop: 2 },
  primaryButton: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 22, backgroundColor: '#9FE870', shadowColor: '#9FE870', shadowOpacity: 0.26, shadowRadius: 24, marginTop: 4 },
  disabledButton: { opacity: 0.58 },
  primaryButtonText: { color: '#081225', fontSize: 15, fontWeight: '900' },
  secondaryAction: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 18, backgroundColor: 'rgba(159,232,112,.08)', borderWidth: 1, borderColor: 'rgba(159,232,112,.24)' },
  secondaryActionText: { color: '#9FE870', fontSize: 13, fontWeight: '800' },
  emptyState: { borderRadius: 20, padding: 16, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#A6B0CF', fontSize: 13, marginTop: 4 },
  timeline: { gap: 10 },
  timelineItem: { flexDirection: 'row', gap: 10 },
  timelineDot: { width: 12, height: 12, borderRadius: 999, marginTop: 14, shadowColor: '#9FE870', shadowOpacity: 0.3, shadowRadius: 10 },
  timelineContent: { flex: 1, borderRadius: 18, padding: 12, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  timelineType: { color: '#9FE870', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  timelineTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginTop: 4 },
  timelineSubtitle: { color: '#A6B0CF', fontSize: 12, marginTop: 3 },
  timelineDate: { color: '#6EA8FF', fontSize: 11, marginTop: 7 },
})
