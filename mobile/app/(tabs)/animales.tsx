import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import {
  ArrowRightLeft,
  Beef,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Menu,
  Pill,
  Scale,
  SlidersHorizontal,
  Stethoscope,
  Syringe,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react-native'
import { useAnimales, useAnimalesPage } from '../../shared/hooks/useAnimales'
import { useSyncStatus } from '../../shared/sync/SyncProvider'
import { usePotrerosList } from '../../shared/hooks/usePotreros'
import {
  PotreroSelect,
  SectionTitle,
  TextField,
  formatDateDisplay,
} from '../../shared/components/ganaderia-form-kit'
import type { HistorialTipo } from '../../shared/hooks/useAnimalHistorial'
import type { Animal } from '../../shared/types/ganaderia'

// LayoutAnimation en Android requiere habilitar el flag experimental de UIManager.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type HistorialAction = { label: string; tipo: HistorialTipo; Icon: LucideIcon; color: string }

const historialActions: HistorialAction[] = [
  { label: 'Clínico', tipo: 'CLINICO', Icon: Stethoscope, color: '#9FE870' },
  { label: 'Pesos', tipo: 'PESOS', Icon: Scale, color: '#6EA8FF' },
  { label: 'Movimientos', tipo: 'MOVIMIENTOS', Icon: ArrowRightLeft, color: '#FFB84D' },
  { label: 'Vacunas', tipo: 'VACUNAS', Icon: Syringe, color: '#39D0D8' },
  { label: 'Tratamientos', tipo: 'TRATAMIENTOS', Icon: Pill, color: '#9A7DFF' },
  { label: 'Diagnósticos', tipo: 'DIAGNOSTICOS', Icon: ClipboardList, color: '#FF8A4C' },
]

function estadoColor(estado?: string): string {
  return estado?.toUpperCase() === 'ACTIVO' || !estado ? '#9FE870' : '#A6B0CF'
}

// Tamano fijo de pagina para el listado server-side y el fallback offline.
const PAGE_SIZE = 20

export default function AnimalesScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const { data: potreros = [] } = usePotrerosList()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Pagina actual (0-based) del listado paginado.
  const [page, setPage] = useState(0)

  // Filtros aplicados (combinables) + borradores del sheet.
  const [caravanaFilter, setCaravanaFilter] = useState('')
  const [potreroFilter, setPotreroFilter] = useState('')
  const [caravanaDraft, setCaravanaDraft] = useState('')
  const [potreroDraft, setPotreroDraft] = useState('')

  // Consulta paginada server-side: los filtros aplicados viajan como params al backend.
  const pageQuery = useAnimalesPage({
    caravana: caravanaFilter.trim() || undefined,
    potreroId: potreroFilter || undefined,
    page,
    size: PAGE_SIZE,
  })

  // Replica local completa (sincronizada por la feature 24): solo se usa como fallback sin conexion.
  // Sin red la query no llega a isError (onlineManager la pausa), por eso tambien miramos `online`.
  const { online } = useSyncStatus()
  const { data: replicaAnimales = [] } = useAnimales()
  const offlineMode = (pageQuery.isError || !online) && replicaAnimales.length > 0

  // Fallback offline: mismo filtrado local que tenia la pantalla antes de la paginacion server-side.
  const offlineFiltered = useMemo(() => {
    if (!offlineMode) return []
    const term = caravanaFilter.trim().toLowerCase()
    return replicaAnimales.filter((animal) => {
      if (term && !animal.caravana.toLowerCase().includes(term)) return false
      if (potreroFilter && animal.potreroId !== potreroFilter) return false
      return true
    })
  }, [offlineMode, replicaAnimales, caravanaFilter, potreroFilter])

  // Valores unificados de paginacion para ambos modos (server y fallback offline en cliente).
  const totalElements = offlineMode ? offlineFiltered.length : pageQuery.data?.totalElements ?? 0
  const totalPages = offlineMode
    ? Math.max(1, Math.ceil(offlineFiltered.length / PAGE_SIZE))
    : Math.max(pageQuery.data?.totalPages ?? 0, 1)
  const currentPage = Math.min(offlineMode ? page : pageQuery.data?.number ?? page, totalPages - 1)
  const rows = offlineMode
    ? offlineFiltered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
    : pageQuery.data?.content ?? []
  const isFirstPage = offlineMode ? currentPage === 0 : pageQuery.data?.first ?? true
  const isLastPage = offlineMode ? currentPage >= totalPages - 1 : pageQuery.data?.last ?? true

  // Con placeholderData la lista anterior queda visible mientras carga la pagina nueva.
  const isPageChanging = !offlineMode && pageQuery.isFetching && pageQuery.isPlaceholderData

  const potreroFilterNombre = useMemo(
    () => potreros.find((potrero) => potrero.id === potreroFilter)?.nombre ?? potreroFilter,
    [potreros, potreroFilter]
  )

  const toggleExpanded = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedId((current) => (current === id ? null : id))
  }

  // Cambia de pagina colapsando la row expandida para no arrastrar la ficha abierta.
  const changePage = (nextPage: number) => {
    if (nextPage < 0) return
    setExpandedId(null)
    setPage(nextPage)
  }

  // Todo cambio de filtros vuelve a la primera pagina.
  const resetPagination = () => {
    setExpandedId(null)
    setPage(0)
  }

  const openFilters = () => {
    setCaravanaDraft(caravanaFilter)
    setPotreroDraft(potreroFilter)
    setFiltersOpen(true)
  }

  const applyFilters = () => {
    setCaravanaFilter(caravanaDraft)
    setPotreroFilter(potreroDraft)
    resetPagination()
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setCaravanaDraft('')
    setPotreroDraft('')
    setCaravanaFilter('')
    setPotreroFilter('')
    resetPagination()
    setFiltersOpen(false)
  }

  const removeCaravanaFilter = () => {
    setCaravanaFilter('')
    resetPagination()
  }

  const removePotreroFilter = () => {
    setPotreroFilter('')
    resetPagination()
  }

  const openHistorial = (animal: Animal, tipo: HistorialTipo) => {
    router.push({
      pathname: '/ganaderia/animal-historial',
      params: { animalId: animal.id, caravana: animal.caravana, tipo },
    } as never)
  }

  const hasActiveFilters = Boolean(caravanaFilter.trim()) || Boolean(potreroFilter)

  // Spinner grande solo en la carga inicial (sin datos previos ni placeholder).
  if (pageQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9FE870" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Menu size={19} color="#DCE8F8" strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Animales</Text>
          <Text style={styles.subtitle}>{totalElements} {totalElements === 1 ? 'animal' : 'animales'}</Text>
        </View>
        <Pressable style={[styles.circleButton, hasActiveFilters && styles.circleButtonActive]} onPress={openFilters}>
          <SlidersHorizontal size={18} color={hasActiveFilters ? '#9FE870' : '#FFFFFF'} strokeWidth={2} />
        </Pressable>
      </View>

      {hasActiveFilters && (
        <View style={styles.filterChipsRow}>
          {Boolean(caravanaFilter.trim()) && (
            <Pressable style={styles.filterChip} onPress={removeCaravanaFilter}>
              <Text style={styles.filterChipText}>Caravana: {caravanaFilter.trim()}</Text>
              <X size={13} color="#9FE870" strokeWidth={2.4} />
            </Pressable>
          )}
          {Boolean(potreroFilter) && (
            <Pressable style={styles.filterChip} onPress={removePotreroFilter}>
              <Text style={styles.filterChipText}>Potrero: {potreroFilterNombre}</Text>
              <X size={13} color="#9FE870" strokeWidth={2.4} />
            </Pressable>
          )}
        </View>
      )}

      {offlineMode && (
        <View style={styles.offlineNotice}>
          <WifiOff size={13} color="#FFB84D" strokeWidth={2.2} />
          <Text style={styles.offlineNoticeText}>Sin conexión: mostrando datos de la última sincronización</Text>
        </View>
      )}

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        style={isPageChanging ? styles.listDimmed : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Beef size={30} color="#A6B0CF" strokeWidth={1.6} />
            <Text style={styles.emptyText}>
              {(pageQuery.isError || !online) && !offlineMode
                ? 'No se pudo cargar el listado y no hay datos sincronizados'
                : 'Sin animales para los filtros aplicados'}
            </Text>
          </View>
        }
        ListFooterComponent={
          totalElements > 0 ? (
            <View style={styles.paginationBar}>
              <Pressable
                style={[styles.pageButton, isFirstPage && styles.pageButtonDisabled]}
                onPress={() => changePage(currentPage - 1)}
                disabled={isFirstPage || isPageChanging}
              >
                <ChevronLeft size={18} color={isFirstPage ? '#A6B0CF' : '#9FE870'} strokeWidth={2.4} />
              </Pressable>
              <View style={styles.pageIndicator}>
                <Text style={styles.pageIndicatorText}>Página {currentPage + 1} de {totalPages}</Text>
                {isPageChanging && <ActivityIndicator size="small" color="#9FE870" />}
              </View>
              <Pressable
                style={[styles.pageButton, isLastPage && styles.pageButtonDisabled]}
                onPress={() => changePage(currentPage + 1)}
                disabled={isLastPage || isPageChanging}
              >
                <ChevronRight size={18} color={isLastPage ? '#A6B0CF' : '#9FE870'} strokeWidth={2.4} />
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <AnimalRow
            animal={item}
            expanded={expandedId === item.id}
            onToggle={() => toggleExpanded(item.id)}
            onHistorial={(tipo) => openHistorial(item, tipo)}
          />
        )}
      />

      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setFiltersOpen(false)} />
        <View style={styles.filtersSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleBlock}>
              <Text style={styles.sheetTitle}>Filtros</Text>
              <Text style={styles.sheetSubtitle}>Buscá animales por caravana y potrero</Text>
            </View>
            <Pressable style={styles.sheetClose} onPress={() => setFiltersOpen(false)}>
              <X size={16} color="#DCE8F8" strokeWidth={2.2} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            <SectionTitle>Caravana</SectionTitle>
            <TextField value={caravanaDraft} onChangeText={setCaravanaDraft} placeholder="Ej: 40" />

            <PotreroSelect
              label="Potrero"
              potreros={potreros}
              value={potreroDraft}
              onChange={setPotreroDraft}
              placeholder="Buscar potrero"
            />

            <View style={styles.sheetActions}>
              <Pressable style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function AnimalRow({
  animal,
  expanded,
  onToggle,
  onHistorial,
}: {
  animal: Animal
  expanded: boolean
  onToggle: () => void
  onHistorial: (tipo: HistorialTipo) => void
}) {
  const color = estadoColor(animal.estado)
  const detalle = [animal.raza, animal.potreroNombre].filter(Boolean).join(' · ')

  return (
    <View style={[styles.rowCard, expanded && styles.rowCardExpanded]}>
      <Pressable style={styles.rowHead} onPress={onToggle}>
        <View style={styles.rowIcon}>
          <Beef size={18} color={color} strokeWidth={2} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.rowCaravana}>{animal.caravana}</Text>
          <Text style={styles.rowDetail}>{detalle || 'Sin datos de raza y potrero'}</Text>
        </View>
        <View style={[styles.estadoBadge, { borderColor: `${color}80`, backgroundColor: `${color}18` }]}>
          <Text style={[styles.estadoBadgeText, { color }]}>{animal.estado || 'ACTIVO'}</Text>
        </View>
        {expanded
          ? <ChevronUp size={17} color="#A6B0CF" strokeWidth={2.2} />
          : <ChevronDown size={17} color="#A6B0CF" strokeWidth={2.2} />}
      </Pressable>

      {expanded && (
        <View style={styles.fichaBlock}>
          <View style={styles.fichaGrid}>
            <FichaItem label="Caravana" value={animal.caravana} />
            <FichaItem label="RFID" value={animal.rfidCodigo} />
            <FichaItem label="Sexo" value={animal.sexo} />
            <FichaItem label="Raza" value={animal.raza} />
            <FichaItem label="Estado" value={animal.estado || 'ACTIVO'} />
            <FichaItem label="Nacimiento" value={animal.fechaNacimiento ? formatDateDisplay(animal.fechaNacimiento) : undefined} />
            <FichaItem label="Compra" value={animal.fechaCompra ? formatDateDisplay(animal.fechaCompra) : undefined} />
            <FichaItem label="Peso actual" value={animal.pesoActualKg != null ? `${animal.pesoActualKg} kg` : undefined} />
            <FichaItem label="Potrero actual" value={animal.potreroNombre} />
            <FichaItem label="Madre" value={animal.madreCaravana} />
            <FichaItem label="Padre" value={animal.padreCaravana} />
          </View>

          <View style={styles.observationBox}>
            <Text style={styles.fichaLabel}>Observaciones</Text>
            <Text style={styles.observationText}>{animal.observaciones || 'Sin observaciones registradas.'}</Text>
          </View>

          <View style={styles.historialGrid}>
            {historialActions.map(({ label, tipo, Icon, color: chipColor }) => (
              <Pressable
                key={tipo}
                style={[styles.historialChip, { borderColor: `${chipColor}45` }]}
                onPress={() => onHistorial(tipo)}
              >
                <Icon size={15} color={chipColor} strokeWidth={2.2} />
                <Text style={styles.historialChipText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

function FichaItem({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.fichaItem}>
      <Text style={styles.fichaLabel}>{label}</Text>
      <Text style={styles.fichaValue}>{value || 'Sin dato'}</Text>
    </View>
  )
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(11, 23, 48, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#A6B0CF',
    fontSize: 10,
    marginTop: 1,
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
  circleButtonActive: {
    borderColor: 'rgba(159,232,112,0.42)',
    backgroundColor: 'rgba(159,232,112,0.08)',
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  filterChip: {
    height: 30,
    paddingHorizontal: 11,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(159,232,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.30)',
  },
  filterChipText: {
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '700',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginHorizontal: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,184,77,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,77,0.30)',
  },
  offlineNoticeText: {
    flex: 1,
    color: '#FFB84D',
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 26,
    gap: 10,
  },
  listDimmed: {
    opacity: 0.55,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    paddingVertical: 4,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.35)',
  },
  pageButtonDisabled: {
    backgroundColor: 'rgba(11,23,48,0.78)',
    borderColor: 'rgba(255,255,255,0.10)',
    opacity: 0.5,
  },
  pageIndicator: {
    minWidth: 122,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(11,23,48,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pageIndicatorText: {
    color: '#DCE8F8',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 60,
  },
  emptyText: {
    color: '#A6B0CF',
    fontSize: 12,
  },
  rowCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(11,23,48,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rowCardExpanded: {
    borderColor: 'rgba(159,232,112,0.28)',
    shadowColor: '#9FE870',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  rowHead: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  rowCopy: {
    flex: 1,
  },
  rowCaravana: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  rowDetail: {
    color: '#A6B0CF',
    fontSize: 11,
    marginTop: 2,
  },
  estadoBadge: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    justifyContent: 'center',
    borderWidth: 1,
  },
  estadoBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
  },
  fichaBlock: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  fichaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  fichaItem: {
    width: '48%',
    flexGrow: 1,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(8,18,37,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  fichaLabel: {
    color: '#A6B0CF',
    fontSize: 10,
    lineHeight: 13,
  },
  fichaValue: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  observationBox: {
    marginTop: 10,
    padding: 11,
    borderRadius: 14,
    backgroundColor: 'rgba(8,18,37,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  observationText: {
    color: '#DCE8F8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  // Grilla fija de 2 filas x 3 chips (sin scroll horizontal).
  historialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  historialChip: {
    flexBasis: '30%',
    flexGrow: 1,
    height: 34,
    paddingHorizontal: 6,
    borderRadius: 17,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(8,18,37,0.78)',
    borderWidth: 1,
  },
  historialChipText: {
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '800',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  filtersSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
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
    paddingBottom: 34,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  clearButtonText: {
    color: '#DCE8F8',
    fontSize: 13,
    fontWeight: '800',
  },
  applyButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9FE870',
    shadowColor: '#9FE870',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  applyButtonText: {
    color: '#081225',
    fontSize: 13,
    fontWeight: '900',
  },
})
