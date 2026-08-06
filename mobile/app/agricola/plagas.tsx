import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Modal,
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
  Bug,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  ClipboardList,
  Crosshair,
  Gauge,
  GitBranch,
  History,
  Images,
  Info,
  Leaf,
  MapPin,
  MapPinned,
  Microscope,
  Pencil,
  Plus,
  Search,
  Sparkles,
  SprayCan,
  Sprout,
  Star,
  Stethoscope,
  Trash2,
  User,
  X,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import {
  createAplicacionFitosanitaria,
  createCatalogoPlaga,
  buscarSimilaresGbif,
  createDeteccionPlaga,
  createSeguimientoPlaga,
  deleteCatalogoPlagaImagen,
  getAplicacionesFitosanitarias,
  getCatalogoPlagaImagenes,
  getCatalogoPlagaSimilares,
  getCatalogoPlagaSugeridas,
  getCatalogoPlagas,
  getCosechasByLote,
  getDeteccionesPlaga,
  getEventosByLote,
  getHistorialByLote,
  getLotes,
  getSeguimientosPlaga,
  updateCatalogoPlaga,
  uploadCatalogoPlagaImagen,
} from '../../shared/api/agricola'
import type { PlagaImageAsset } from '../../shared/api/agricola'
import { resolveAssetUrl } from '../../shared/api/client'
import { isOnline, subscribeConnectivity } from '../../shared/sync/connectivity'
import { getOperarios } from '../../shared/api/operarios'
import type {
  AplicacionFitosanitaria,
  AplicacionFitosanitariaRequest,
  CatalogoPlaga,
  CatalogoPlagaImagen,
  CatalogoPlagaRequest,
  DeteccionPlaga,
  DeteccionPlagaRequest,
  EspecieSimilar,
  EstadoDeteccionPlaga,
  EventoSiembra,
  HistoricoCultivo,
  Lote,
  PlagaSugerida,
  RegistroCosecha,
  ResultadoSeguimientoPlaga,
  SeguimientoPlaga,
  SeguimientoPlagaRequest,
  SeveridadPlaga,
  UtilidadOpcion,
} from '../../shared/types/agricola'
import type { Operario } from '../../shared/types/operarios'
import { useUtilidadOpciones } from '../../shared/hooks/useUtilidades'

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

// Formulario vacio de alta de plaga de catalogo (default PLAGA, activo)
function emptyCatalogoForm(): CatalogoPlagaRequest {
  return {
    nombreComun: '',
    nombreCientifico: '',
    // tipo guarda el id del catalogo TIPO_PLAGA (feature 72); se elige en el formulario
    tipo: '',
    cultivosAfectados: '',
    umbralAccion: '',
    zonaTipica: '',
    sintomas: '',
    activo: true,
  }
}

// Hook de estado de conectividad (feature 24/54): la subida de imagenes es online.
function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline())
  useEffect(() => subscribeConnectivity(setOnline), [])
  return online
}

// Convierte el asset de expo-image-picker al shape que espera el upload multipart.
function toImageAsset(asset: ImagePicker.ImagePickerAsset): PlagaImageAsset {
  return { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType }
}

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
  const [catalogoModalOpen, setCatalogoModalOpen] = useState(false)
  const [savingCatalogo, setSavingCatalogo] = useState(false)
  const [catalogoForm, setCatalogoForm] = useState<CatalogoPlagaRequest>(emptyCatalogoForm)
  // Edicion de catalogo (feature 54): null = alta, id = edicion via PUT.
  const [catalogoEditingId, setCatalogoEditingId] = useState<string | null>(null)
  // Ficha de plaga (feature 54): id del item de catalogo cuya ficha esta abierta.
  const [fichaPlagaId, setFichaPlagaId] = useState<string | null>(null)

  // Catalogos configurables de Utilidades (feature 72): tipo de plaga y cultivo.
  // Los pickers guardan el id de la opcion; el label mostrado es el valor.
  const { data: tipoPlagaOpciones = [] } = useUtilidadOpciones('TIPO_PLAGA')
  const { data: cultivoOpciones = [] } = useUtilidadOpciones('CULTIVO')

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
  }, [mode, historyScope, selectedDetectionId, selectedHistoryLoteId, detecciones, aplicaciones, seguimientos])

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

  function openNuevaPlaga() {
    setCatalogoEditingId(null)
    setCatalogoForm(emptyCatalogoForm())
    setCatalogoModalOpen(true)
  }

  function openEditarPlaga(plaga: CatalogoPlaga) {
    setCatalogoEditingId(plaga.id)
    setCatalogoForm({
      nombreComun: plaga.nombreComun,
      nombreCientifico: plaga.nombreCientifico ?? '',
      tipo: plaga.tipo,
      cultivosAfectados: plaga.cultivosAfectados ?? '',
      descripcion: plaga.descripcion ?? '',
      sintomas: plaga.sintomas ?? '',
      umbralAccion: plaga.umbralAccion ?? '',
      zonaTipica: plaga.zonaTipica ?? '',
      activo: plaga.activo ?? true,
    })
    setCatalogoModalOpen(true)
  }

  async function refreshCatalogo() {
    try {
      const catalogoData = await getCatalogoPlagas()
      setCatalogo(catalogoData)
      return catalogoData
    } catch {
      return catalogo
    }
  }

  async function saveCatalogoPlaga() {
    const nombreComun = catalogoForm.nombreComun.trim()
    if (!nombreComun) {
      Alert.alert(catalogoEditingId ? 'Editar plaga' : 'Nueva plaga', 'Ingresá el nombre común antes de guardar.')
      return
    }
    const editing = catalogoEditingId
    setSavingCatalogo(true)
    try {
      const saved = editing
        ? await updateCatalogoPlaga(editing, { ...catalogoForm, nombreComun })
        : await createCatalogoPlaga({ ...catalogoForm, nombreComun, activo: true })
      const catalogoData = await getCatalogoPlagas()
      // Si el alta/edicion se resolvio offline el item puede no venir actualizado en
      // el refresco: lo anteponemos/reemplazamos con la respuesta sintetica del outbox.
      let nextCatalogo = catalogoData
      if (saved?.id) {
        const exists = catalogoData.some(item => item.id === saved.id)
        nextCatalogo = exists
          ? catalogoData.map(item => (item.id === saved.id ? saved : item))
          : [saved, ...catalogoData]
      }
      setCatalogo(nextCatalogo)
      if (!editing && saved?.id) {
        setDeteccionForm(current => ({ ...current, catalogoPlagaId: saved.id }))
      }
      setCatalogoModalOpen(false)
      setCatalogoEditingId(null)
      setCatalogoForm(emptyCatalogoForm())
    } catch {
      Alert.alert(editing ? 'Editar plaga' : 'Nueva plaga', 'No se pudo guardar la plaga.')
    } finally {
      setSavingCatalogo(false)
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
              cultivoOptions={cultivoOpciones}
              form={deteccionForm}
              lotes={lotes}
              operarios={operarios}
              saving={saving}
              onCaptureLocation={captureLocation}
              onSave={saveDeteccion}
              onAddPlaga={openNuevaPlaga}
              onOpenFicha={setFichaPlagaId}
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

      <CatalogoPlagaModal
        visible={catalogoModalOpen}
        editing={catalogoEditingId !== null}
        form={catalogoForm}
        tipoOptions={tipoPlagaOpciones}
        cultivoOptions={cultivoOpciones}
        saving={savingCatalogo}
        onClose={() => { setCatalogoModalOpen(false); setCatalogoEditingId(null) }}
        onSave={saveCatalogoPlaga}
        setForm={setCatalogoForm}
      />

      <PlagaFichaModal
        plagaId={fichaPlagaId}
        catalogo={catalogo}
        onClose={() => setFichaPlagaId(null)}
        onOpenSugerida={setFichaPlagaId}
        onEdit={(plaga) => { setFichaPlagaId(null); openEditarPlaga(plaga) }}
        onCatalogoChanged={refreshCatalogo}
      />
    </SafeAreaView>
  )
}

function DetectionForm({
  catalogo,
  cultivoOptions,
  form,
  lotes,
  operarios,
  saving,
  onCaptureLocation,
  onSave,
  onAddPlaga,
  onOpenFicha,
  setForm,
}: {
  catalogo: CatalogoPlaga[]
  cultivoOptions: UtilidadOpcion[]
  form: DeteccionPlagaRequest
  lotes: Lote[]
  operarios: Operario[]
  saving: boolean
  onCaptureLocation: () => void
  onSave: () => void
  onAddPlaga: () => void
  onOpenFicha: (id: string) => void
  setForm: React.Dispatch<React.SetStateAction<DeteccionPlagaRequest>>
}) {
  // Chips de cultivo por id (feature 72): value = opcion.id, label = opcion.valor.
  // El cultivo autocompletado desde el lote se conserva como chip activo aunque no este en el catalogo activo.
  const cultivoChips = useMemo(() => {
    const base = cultivoOptions.map(opcion => ({ id: opcion.id, label: opcion.valor }))
    if (form.cultivo && !cultivoOptions.some(opcion => opcion.id === form.cultivo)) {
      const selectedLote = lotes.find(lote => lote.id === form.loteId)
      return [{ id: form.cultivo, label: selectedLote?.cultivoNombre ?? form.cultivo }, ...base]
    }
    return base
  }, [cultivoOptions, form.cultivo, form.loteId, lotes])
  return (
    <>
      <SectionTitle icon={<Crosshair color="#9FE870" size={18} />} title="Nueva detección" subtitle="Registro geolocalizado de plaga o enfermedad." />
      <OptionPicker label="Lote" items={lotes.map(lote => ({ id: lote.id, label: lote.nombre, sublabel: lote.cultivoNombre ?? lote.cultivo }))} value={form.loteId} onChange={(id) => {
        const lote = lotes.find(item => item.id === id)
        setForm(current => ({ ...current, loteId: id, cultivo: lote?.cultivo }))
      }} />
      <OptionPicker label="Plaga" items={catalogo.map(item => ({ id: item.id, label: item.nombreComun, sublabel: item.tipoNombre ?? item.tipo }))} value={form.catalogoPlagaId} onChange={(id) => setForm(current => ({ ...current, catalogoPlagaId: id }))} onAdd={onAddPlaga} addLabel="Nueva plaga en el catálogo" />
      {form.catalogoPlagaId ? (
        <Pressable style={styles.fichaLink} onPress={() => onOpenFicha(form.catalogoPlagaId)} accessibilityRole="button">
          <Info color="#6EA8FF" size={18} />
          <Text style={styles.fichaLinkText}>Ver ficha de la plaga</Text>
          <ChevronRight color="#6EA8FF" size={18} />
        </Pressable>
      ) : null}
      <Field label="Fecha" icon={<CalendarDays color="#6EA8FF" size={18} />} value={form.fechaDeteccion ?? ''} onChangeText={(value) => setForm(current => ({ ...current, fechaDeteccion: value }))} />
      {cultivoOptions.length > 0 ? (
        <IdChipGroup label="Cultivo" value={form.cultivo ?? ''} options={cultivoChips} onChange={(id) => setForm(current => ({ ...current, cultivo: id }))} />
      ) : (
        <Field label="Cultivo" icon={<Leaf color="#39D0D8" size={18} />} value={form.cultivo ?? ''} onChangeText={(value) => setForm(current => ({ ...current, cultivo: value }))} />
      )}
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
        <OptionPicker label="Lote" items={lotes.map(lote => ({ id: lote.id, label: lote.nombre, sublabel: lote.cultivoNombre ?? lote.cultivo }))} value={selectedHistoryLoteId} onChange={setSelectedHistoryLoteId} />
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
function CatalogoPlagaModal({
  visible,
  editing,
  form,
  tipoOptions,
  cultivoOptions,
  saving,
  onClose,
  onSave,
  setForm,
}: {
  visible: boolean
  editing: boolean
  form: CatalogoPlagaRequest
  tipoOptions: UtilidadOpcion[]
  cultivoOptions: UtilidadOpcion[]
  saving: boolean
  onClose: () => void
  onSave: () => void
  setForm: React.Dispatch<React.SetStateAction<CatalogoPlagaRequest>>
}) {
  // Busqueda en vivo de especies similares GBIF (feature 75), on-demand y solo online.
  const online = useOnlineStatus()
  const [similares, setSimilares] = useState<EspecieSimilar[]>([])
  const [buscando, setBuscando] = useState(false)
  const [searched, setSearched] = useState(false)
  const sci = (form.nombreCientifico ?? '').trim()

  // Al cerrar el modal, limpiar los resultados de la busqueda anterior.
  useEffect(() => {
    if (!visible) {
      setSimilares([])
      setSearched(false)
      setBuscando(false)
    }
  }, [visible])

  async function buscarSimilares() {
    if (!sci) return
    if (!online) {
      Alert.alert('Buscar similares', 'La búsqueda de especies similares requiere conexión.')
      return
    }
    setBuscando(true)
    setSearched(false)
    try {
      const result = await buscarSimilaresGbif(sci)
      setSimilares(result)
      setSearched(true)
    } catch {
      setSimilares([])
      setSearched(true)
      Alert.alert('Buscar similares', 'No se pudieron obtener especies similares. Reintentá más tarde.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <SectionTitle
                icon={editing ? <Pencil color="#9FE870" size={18} /> : <Leaf color="#9FE870" size={18} />}
                title={editing ? 'Editar plaga' : 'Nueva plaga'}
                subtitle={editing ? 'Actualización del catálogo sanitario.' : 'Alta en el catálogo sanitario.'}
              />
            </View>
            <Pressable style={styles.modalClose} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar">
              <X color="#A6B0CF" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Field label="Nombre común" value={form.nombreComun} onChangeText={(value) => setForm(current => ({ ...current, nombreComun: value }))} />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre científico</Text>
              <View style={styles.sciRow}>
                <View style={[styles.inputShell, styles.sciInput]}>
                  <Microscope color="#6EA8FF" size={18} />
                  <TextInput
                    style={styles.input}
                    value={form.nombreCientifico ?? ''}
                    onChangeText={(value) => setForm(current => ({ ...current, nombreCientifico: value }))}
                    placeholder="Ej. Spodoptera frugiperda"
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                  />
                </View>
                <Pressable
                  style={[styles.sciSearchButton, (!sci || buscando) && styles.disabledButton]}
                  disabled={!sci || buscando}
                  onPress={buscarSimilares}
                  accessibilityRole="button"
                  accessibilityLabel="Buscar especies similares en GBIF"
                >
                  {buscando ? <ActivityIndicator color="#9FE870" size="small" /> : <Sparkles color="#9FE870" size={18} />}
                  <Text style={styles.sciSearchText}>Similares</Text>
                </Pressable>
              </View>
              {!online ? <Text style={styles.offlineNote}>Sin conexión: la búsqueda de similares está deshabilitada.</Text> : null}
              {buscando ? (
                <ActivityIndicator color="#6EA8FF" />
              ) : searched && similares.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No se encontraron especies similares para ese nombre científico.</Text>
                </View>
              ) : similares.length > 0 ? (
                <View style={styles.similarResults}>
                  <Text style={styles.similarResultsHint}>Especies similares (GBIF)</Text>
                  {similares.map(similar => (
                    <EspecieSimilarItem
                      key={similar.usageKey}
                      similar={similar}
                      onUse={(item) => setForm(current => ({ ...current, nombreCientifico: item.nombreCientifico }))}
                    />
                  ))}
                </View>
              ) : null}
            </View>
            <IdChipGroup label="Tipo" value={form.tipo} options={tipoOptions.map(opcion => ({ id: opcion.id, label: opcion.valor }))} onChange={(id) => setForm(current => ({ ...current, tipo: id }))} />
            <IdMultiChipGroup
              label="Cultivos afectados"
              value={form.cultivosAfectados ?? ''}
              options={cultivoOptions.map(opcion => ({ id: opcion.id, label: opcion.valor }))}
              onChange={(csv) => setForm(current => ({ ...current, cultivosAfectados: csv }))}
            />
            <Field label="Zona / área típica" icon={<MapPin color="#FFB84D" size={18} />} value={form.zonaTipica ?? ''} onChangeText={(value) => setForm(current => ({ ...current, zonaTipica: value }))} />
            <Field label="Umbral de acción" icon={<Gauge color="#FF6B6B" size={18} />} value={form.umbralAccion ?? ''} onChangeText={(value) => setForm(current => ({ ...current, umbralAccion: value }))} />
            <Textarea label="Síntomas" value={form.sintomas ?? ''} onChangeText={(value) => setForm(current => ({ ...current, sintomas: value.slice(0, 500) }))} />
            <PrimaryButton icon={<Plus color="#081225" size={22} />} label={saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Guardar plaga'} disabled={saving} onPress={onSave} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// Ficha de plaga (feature 54): galeria de imagenes propias (subir desde galeria/
// camara con expo-image-picker, borrar), datos de identificacion (zona/area tipica,
// umbral, tipo, nombre cientifico, cultivos, sintomas) y plagas sugeridas.
function PlagaFichaModal({
  plagaId,
  catalogo,
  onClose,
  onOpenSugerida,
  onEdit,
  onCatalogoChanged,
}: {
  plagaId: string | null
  catalogo: CatalogoPlaga[]
  onClose: () => void
  onOpenSugerida: (id: string) => void
  onEdit: (plaga: CatalogoPlaga) => void
  onCatalogoChanged: () => Promise<CatalogoPlaga[]>
}) {
  const online = useOnlineStatus()
  const plaga = useMemo(() => catalogo.find(item => item.id === plagaId), [catalogo, plagaId])
  const [imagenes, setImagenes] = useState<CatalogoPlagaImagen[]>([])
  const [sugeridas, setSugeridas] = useState<PlagaSugerida[]>([])
  // Especies similares desde GBIF (feature 75): fuente externa, distinta del catalogo propio.
  const [similares, setSimilares] = useState<EspecieSimilar[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [markPrincipal, setMarkPrincipal] = useState(false)
  const [activeImageUrl, setActiveImageUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!plagaId) return
    let cancelled = false
    setLoading(true)
    // Precarga de la lista (imagenes ya vienen en el catalogo) para no parpadear.
    setImagenes(plaga?.imagenes ?? [])
    setSugeridas([])
    setSimilares([])
    setActiveImageUrl(undefined)
    setMarkPrincipal(false)
    Promise.all([
      getCatalogoPlagaImagenes(plagaId).catch(() => plaga?.imagenes ?? []),
      getCatalogoPlagaSugeridas(plagaId).catch(() => [] as PlagaSugerida[]),
      getCatalogoPlagaSimilares(plagaId).catch(() => [] as EspecieSimilar[]),
    ]).then(([imgs, sugs, sims]) => {
      if (cancelled) return
      setImagenes(imgs)
      setSugeridas(sugs)
      setSimilares(sims)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [plagaId, plaga?.imagenes])

  const orderedImages = useMemo(
    () => [...imagenes].sort((a, b) => Number(b.esPrincipal) - Number(a.esPrincipal) || a.orden - b.orden),
    [imagenes],
  )
  const heroImage = orderedImages.find(img => resolveAssetUrl(img.url) === activeImageUrl) ?? orderedImages[0]
  const heroUrl = resolveAssetUrl(heroImage?.url)

  async function refreshImagenes() {
    if (!plagaId) return
    const imgs = await getCatalogoPlagaImagenes(plagaId).catch(() => imagenes)
    setImagenes(imgs)
    onCatalogoChanged()
  }

  async function pickAndUpload(source: 'library' | 'camera') {
    if (!plagaId) return
    if (!online) {
      Alert.alert('Subir imagen', 'La subida de imágenes requiere conexión. Reintentá cuando tengas red.')
      return
    }
    try {
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert('Permiso requerido', source === 'camera' ? 'No se otorgó permiso para usar la cámara.' : 'No se otorgó permiso para acceder a la galería.')
        return
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
      if (result.canceled || !result.assets?.[0]) return
      setUploading(true)
      // Primera imagen del catalogo: principal por defecto aunque el usuario no lo marque.
      const esPrincipal = markPrincipal || imagenes.length === 0
      await uploadCatalogoPlagaImagen(plagaId, toImageAsset(result.assets[0]), esPrincipal)
      await refreshImagenes()
      setMarkPrincipal(false)
    } catch {
      Alert.alert('Subir imagen', 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function confirmDelete(imagen: CatalogoPlagaImagen) {
    if (!plagaId) return
    Alert.alert('Eliminar imagen', '¿Querés eliminar esta imagen del catálogo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCatalogoPlagaImagen(plagaId, imagen.id)
            setActiveImageUrl(undefined)
            await refreshImagenes()
          } catch {
            Alert.alert('Eliminar imagen', 'No se pudo eliminar la imagen.')
          }
        },
      },
    ])
  }

  return (
    <Modal visible={plagaId !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.fichaCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <SectionTitle icon={<Bug color="#9FE870" size={18} />} title={plaga?.nombreComun ?? 'Ficha de plaga'} subtitle={plaga?.tipoNombre ?? plaga?.tipo ?? 'Identificación y referencia visual.'} />
            </View>
            <Pressable style={styles.modalClose} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar">
              <X color="#A6B0CF" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Galeria: imagen principal grande + miniaturas; placeholder si no hay. */}
            <View style={styles.gallery}>
              {heroUrl ? (
                <View style={styles.heroWrap}>
                  <Image source={{ uri: heroUrl }} style={styles.heroImage} contentFit="cover" transition={200} />
                  {heroImage?.esPrincipal ? (
                    <View style={styles.principalBadge}>
                      <Star color="#081225" size={12} fill="#081225" />
                      <Text style={styles.principalBadgeText}>Principal</Text>
                    </View>
                  ) : null}
                  <Pressable style={styles.imageDelete} onPress={() => heroImage && confirmDelete(heroImage)} accessibilityRole="button" accessibilityLabel="Eliminar imagen">
                    <Trash2 color="#FF6B6B" size={18} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.heroPlaceholder}>
                  <Bug color="#3A4A6B" size={40} />
                  <Text style={styles.heroPlaceholderText}>Sin imágenes cargadas</Text>
                </View>
              )}
              {orderedImages.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
                  {orderedImages.map(img => {
                    const url = resolveAssetUrl(img.url)
                    const active = url === heroUrl
                    return (
                      <Pressable key={img.id} style={[styles.thumb, active && styles.thumbActive]} onPress={() => setActiveImageUrl(url)}>
                        <Image source={{ uri: url }} style={styles.thumbImage} contentFit="cover" />
                      </Pressable>
                    )
                  })}
                </ScrollView>
              ) : null}
              {!online ? (
                <Text style={styles.offlineNote}>Sin conexión: la subida de imágenes está deshabilitada.</Text>
              ) : null}
              <Pressable style={[styles.principalToggle, markPrincipal && styles.principalToggleActive]} onPress={() => setMarkPrincipal(value => !value)}>
                <Star color={markPrincipal ? '#9FE870' : '#A6B0CF'} size={16} fill={markPrincipal ? '#9FE870' : 'transparent'} />
                <Text style={[styles.principalToggleText, markPrincipal && styles.principalToggleTextActive]}>Marcar la próxima como principal</Text>
              </Pressable>
              <View style={styles.uploadRow}>
                <Pressable style={[styles.uploadButton, (!online || uploading) && styles.disabledButton]} disabled={!online || uploading} onPress={() => pickAndUpload('library')}>
                  <Images color="#9FE870" size={18} />
                  <Text style={styles.uploadButtonText}>Galería</Text>
                </Pressable>
                <Pressable style={[styles.uploadButton, (!online || uploading) && styles.disabledButton]} disabled={!online || uploading} onPress={() => pickAndUpload('camera')}>
                  <Camera color="#9FE870" size={18} />
                  <Text style={styles.uploadButtonText}>Cámara</Text>
                </Pressable>
              </View>
              {uploading ? <ActivityIndicator color="#9FE870" /> : null}
            </View>

            {/* Datos de identificacion */}
            <View style={styles.dataGrid}>
              <FichaRow icon={<Bug color="#9A7DFF" size={16} />} label="Tipo" value={plaga?.tipoNombre ?? plaga?.tipo} />
              <FichaRow icon={<Microscope color="#6EA8FF" size={16} />} label="Nombre científico" value={plaga?.nombreCientifico} italic />
              <FichaRow icon={<MapPin color="#FFB84D" size={16} />} label="Zona / área típica" value={plaga?.zonaTipica} />
              <FichaRow icon={<Gauge color="#FF6B6B" size={16} />} label="Umbral de acción" value={plaga?.umbralAccion} />
              <FichaRow icon={<Sprout color="#39D0D8" size={16} />} label="Cultivos afectados" value={parseCsvIds(plaga?.cultivosAfectadosNombres).join(', ')} />
              <FichaRow icon={<Stethoscope color="#9FE870" size={16} />} label="Síntomas" value={plaga?.sintomas} />
            </View>

            {/* Plagas sugeridas */}
            <View style={styles.suggestBlock}>
              <SectionTitle icon={<Sparkles color="#9FE870" size={18} />} title="Plagas sugeridas" subtitle="Similares en el catálogo para descartar confusiones." />
              {loading ? (
                <ActivityIndicator color="#9FE870" />
              ) : sugeridas.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Sin sugerencias por el momento.</Text>
                </View>
              ) : (
                sugeridas.map(sug => {
                  const thumb = resolveAssetUrl(sug.imagenPrincipalUrl)
                  return (
                    <Pressable key={sug.id} style={styles.suggestItem} onPress={() => onOpenSugerida(sug.id)}>
                      {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.suggestThumb} contentFit="cover" />
                      ) : (
                        <View style={styles.suggestThumbPlaceholder}><Bug color="#3A4A6B" size={20} /></View>
                      )}
                      <View style={styles.suggestText}>
                        <Text style={styles.suggestName}>{sug.nombreComun}</Text>
                        <Text style={styles.suggestType}>{sug.tipoNombre ?? sug.tipo}</Text>
                        {sug.motivos.length > 0 ? (
                          <View style={styles.motivosRow}>
                            {sug.motivos.map((motivo, index) => (
                              <View key={index} style={styles.motivoChip}><Text style={styles.motivoChipText}>{motivo}</Text></View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                      <ChevronRight color="#6EA8FF" size={18} />
                    </Pressable>
                  )
                })
              )}
            </View>

            {/* Especies similares (GBIF): fuente externa por parentesco taxonomico (feature 75) */}
            <View style={styles.suggestBlock}>
              <SectionTitle icon={<GitBranch color="#6EA8FF" size={18} />} title="Especies similares (GBIF)" subtitle="Parientes taxonómicos externos para comparar." />
              {loading ? (
                <ActivityIndicator color="#6EA8FF" />
              ) : similares.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Sin especies similares (se completan en la sincronización).</Text>
                </View>
              ) : (
                similares.map(similar => (
                  <EspecieSimilarItem key={similar.usageKey} similar={similar} />
                ))
              )}
            </View>

            {plaga ? (
              <Pressable style={styles.editButton} onPress={() => onEdit(plaga)}>
                <Pencil color="#9FE870" size={18} />
                <Text style={styles.editButtonText}>Editar datos de la plaga</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

function FichaRow({ icon, label, value, italic }: { icon: React.ReactNode; label: string; value?: string | null; italic?: boolean }) {
  return (
    <View style={styles.fichaRow}>
      <View style={styles.fichaRowIcon}>{icon}</View>
      <View style={styles.fichaRowText}>
        <Text style={styles.fichaRowLabel}>{label}</Text>
        <Text style={[styles.fichaRowValue, italic && styles.fichaRowValueItalic]}>{value?.trim() ? value : 'Sin datos'}</Text>
      </View>
    </View>
  )
}

// Etiqueta legible del nivel de proximidad taxonomica (feature 75).
function nivelLabel(nivel: EspecieSimilar['nivel']) {
  return nivel === 'GENERO' ? 'Género' : 'Familia'
}

// Item de especie similar GBIF (feature 75): miniatura remota/local, nombre vulgar,
// cientifico en italica, badge de nivel y atribucion/licencia. onUse (opcional) agrega
// la accion "Usar" para autocompletar el nombre cientifico en el alta.
function EspecieSimilarItem({ similar, onUse }: { similar: EspecieSimilar; onUse?: (similar: EspecieSimilar) => void }) {
  const thumb = resolveAssetUrl(similar.imagenUrl)
  const credito = [similar.atribucion, similar.licencia].filter(Boolean).join(' · ')
  return (
    <View style={styles.similarItem}>
      <View style={styles.similarRow}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.suggestThumb} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.suggestThumbPlaceholder}><Bug color="#3A4A6B" size={20} /></View>
        )}
        <View style={styles.suggestText}>
          <Text style={styles.suggestName}>{similar.nombreVulgar?.trim() || similar.nombreCientifico}</Text>
          <Text style={styles.similarSci}>{similar.nombreCientifico}</Text>
          <View style={styles.similarBadgeRow}>
            <View style={styles.similarBadge}>
              <GitBranch color="#6EA8FF" size={11} />
              <Text style={styles.similarBadgeText}>{nivelLabel(similar.nivel)}</Text>
            </View>
          </View>
        </View>
        {onUse ? (
          <Pressable style={styles.similarUseButton} onPress={() => onUse(similar)} accessibilityRole="button" accessibilityLabel="Usar nombre científico">
            <Check color="#9FE870" size={16} />
            <Text style={styles.similarUseText}>Usar</Text>
          </Pressable>
        ) : null}
      </View>
      {credito ? <Text style={styles.similarCredit}>{credito}</Text> : null}
    </View>
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

function OptionPicker({ label, items, value, onChange, onAdd, addLabel }: { label: string; items: Array<{ id: string; label: string; sublabel?: string }>; value: string; onChange: (id: string) => void; onAdd?: () => void; addLabel?: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
        {onAdd ? (
          <Pressable style={styles.addOptionChip} onPress={onAdd} accessibilityRole="button" accessibilityLabel={addLabel ?? 'Agregar'}>
            <Plus color="#9FE870" size={22} strokeWidth={2.4} />
          </Pressable>
        ) : null}
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

// Chips que guardan el id de una opcion de catalogo mostrando su valor (feature 72).
function IdChipGroup({ label, value, options, onChange }: { label: string; value: string; options: Array<{ id: string; label: string }>; onChange: (id: string) => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(option => {
          const active = option.id === value
          return (
            <Pressable key={option.id} style={[styles.statusChip, active && styles.statusChipActive]} onPress={() => onChange(option.id)}>
              <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>{option.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

// Parsea un CSV de ids en lista limpia (sin vacios ni espacios).
function parseCsvIds(value?: string): string[] {
  if (!value) return []
  return value.split(',').map(id => id.trim()).filter(Boolean)
}

// Multi-seleccion de chips por id (feature 73): cada chip togglea un id y el valor
// se serializa a CSV de ids. Igual estilo que IdChipGroup pero admite varios activos.
function IdMultiChipGroup({ label, value, options, onChange }: { label: string; value: string; options: Array<{ id: string; label: string }>; onChange: (csv: string) => void }) {
  const selected = parseCsvIds(value)
  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id]
    onChange(next.join(','))
  }
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.emptyText}>No hay cultivos en el catálogo.</Text>
      ) : (
        <View style={styles.chipRow}>
          {options.map(option => {
            const active = selected.includes(option.id)
            return (
              <Pressable key={option.id} style={[styles.statusChip, active && styles.statusChipActive]} onPress={() => toggle(option.id)}>
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>{option.label}</Text>
              </Pressable>
            )
          })}
        </View>
      )}
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
  addOptionChip: { width: 54, height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(159,232,112,.06)', borderWidth: 1.5, borderColor: 'rgba(159,232,112,.55)', borderStyle: 'dashed' },
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(4,10,22,.72)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalCard: { width: '100%', maxHeight: '88%', borderRadius: 24, backgroundColor: '#0B1730', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 16, gap: 8, shadowColor: '#9FE870', shadowOpacity: 0.14, shadowRadius: 30 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  modalHeaderText: { flex: 1 },
  modalClose: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  modalBody: { gap: 14, paddingBottom: 6, paddingTop: 4 },
  // Enlace a la ficha de plaga desde el selector (feature 54)
  fichaLink: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 14, backgroundColor: 'rgba(110,168,255,.08)', borderWidth: 1, borderColor: 'rgba(110,168,255,.28)' },
  fichaLinkText: { flex: 1, color: '#6EA8FF', fontSize: 13, fontWeight: '800' },
  // Ficha de plaga (feature 54)
  fichaCard: { width: '100%', maxHeight: '92%', borderRadius: 24, backgroundColor: '#0B1730', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 16, gap: 8, shadowColor: '#9FE870', shadowOpacity: 0.14, shadowRadius: 30 },
  gallery: { gap: 10 },
  heroWrap: { position: 'relative', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  heroImage: { width: '100%', height: 200, backgroundColor: '#081225' },
  principalBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#9FE870' },
  principalBadgeText: { color: '#081225', fontSize: 11, fontWeight: '900' },
  imageDelete: { position: 'absolute', top: 10, right: 10, width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,18,37,.82)', borderWidth: 1, borderColor: 'rgba(255,107,107,.35)' },
  heroPlaceholder: { height: 200, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,.12)' },
  heroPlaceholderText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  thumbRow: { gap: 8, paddingVertical: 2 },
  thumb: { width: 64, height: 64, borderRadius: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,.08)' },
  thumbActive: { borderColor: '#9FE870' },
  thumbImage: { width: '100%', height: '100%', backgroundColor: '#081225' },
  offlineNote: { color: '#FFB84D', fontSize: 12, fontWeight: '600' },
  principalToggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingHorizontal: 12, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  principalToggleActive: { borderColor: 'rgba(159,232,112,.6)', backgroundColor: 'rgba(159,232,112,.1)' },
  principalToggleText: { color: '#A6B0CF', fontSize: 12, fontWeight: '700' },
  principalToggleTextActive: { color: '#9FE870' },
  uploadRow: { flexDirection: 'row', gap: 10 },
  uploadButton: { flex: 1, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 18, backgroundColor: 'rgba(159,232,112,.1)', borderWidth: 1, borderColor: 'rgba(159,232,112,.32)' },
  uploadButtonText: { color: '#9FE870', fontSize: 13, fontWeight: '800' },
  dataGrid: { gap: 8 },
  fichaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, padding: 12, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.06)' },
  fichaRowIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.04)' },
  fichaRowText: { flex: 1 },
  fichaRowLabel: { color: '#A6B0CF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  fichaRowValue: { color: '#DCE8F8', fontSize: 14, marginTop: 3, lineHeight: 19 },
  fichaRowValueItalic: { fontStyle: 'italic', color: '#6EA8FF' },
  suggestBlock: { gap: 10 },
  suggestItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  suggestThumb: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#0B1730' },
  suggestThumbPlaceholder: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1730', borderWidth: 1, borderColor: 'rgba(255,255,255,.06)' },
  suggestText: { flex: 1, gap: 4 },
  suggestName: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  suggestType: { color: '#A6B0CF', fontSize: 11 },
  motivosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  motivoChip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, backgroundColor: 'rgba(159,232,112,.1)', borderWidth: 1, borderColor: 'rgba(159,232,112,.24)' },
  motivoChipText: { color: '#9FE870', fontSize: 10, fontWeight: '700' },
  editButton: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 18, backgroundColor: 'rgba(159,232,112,.08)', borderWidth: 1, borderColor: 'rgba(159,232,112,.24)' },
  editButtonText: { color: '#9FE870', fontSize: 13, fontWeight: '800' },
  // Especies similares GBIF (feature 75): boton al lado del nombre cientifico + items.
  sciRow: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  sciInput: { flex: 1, minWidth: 0 },
  sciSearchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 18, paddingHorizontal: 14, backgroundColor: 'rgba(159,232,112,.12)', borderWidth: 1, borderColor: 'rgba(159,232,112,.35)' },
  sciSearchText: { color: '#9FE870', fontSize: 12, fontWeight: '800' },
  similarResults: { gap: 10, marginTop: 4 },
  similarResultsHint: { color: '#6EA8FF', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  similarItem: { gap: 8, borderRadius: 18, padding: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(110,168,255,.18)' },
  similarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  similarSci: { color: '#6EA8FF', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  similarBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  similarBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, backgroundColor: 'rgba(110,168,255,.12)', borderWidth: 1, borderColor: 'rgba(110,168,255,.28)' },
  similarBadgeText: { color: '#6EA8FF', fontSize: 10, fontWeight: '800' },
  similarUseButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: 'rgba(159,232,112,.1)', borderWidth: 1, borderColor: 'rgba(159,232,112,.32)' },
  similarUseText: { color: '#9FE870', fontSize: 12, fontWeight: '800' },
  similarCredit: { color: '#64748B', fontSize: 10, lineHeight: 14 },
})
