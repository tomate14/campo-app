import { useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Leaf,
  PencilLine,
  Plus,
  Sprout,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native'
import { useLotes } from '../../shared/hooks/useLotes'
import { useCreateCosecha } from '../../shared/hooks/useCosecha'
import { useCreateEvento } from '../../shared/hooks/useSiembra'
import type { CalidadGrano, TipoEvento } from '../../shared/types/agricola'

const MAX_DESCRIPTION = 500
type RegistroMode = 'SIEMBRA' | 'COSECHA'

const REGISTRO_TYPES: Array<{ value: RegistroMode; title: string; description: string; Icon: LucideIcon; color: string }> = [
  { value: 'SIEMBRA', title: 'Siembra', description: 'Evento operativo del cultivo', Icon: Sprout, color: '#9FE870' },
  { value: 'COSECHA', title: 'Cosecha', description: 'Producción y calidad del lote', Icon: ClipboardList, color: '#FFB84D' },
]

const EVENT_TYPES: Array<{ value: TipoEvento; title: string; description: string; Icon: LucideIcon; color: string }> = [
  { value: 'SIEMBRA', title: 'Sembrado', description: 'Registro de siembra', Icon: Sprout, color: '#9FE870' },
  { value: 'MONITOREO_FENOLOGICO', title: 'Monitoreo Fenológico', description: 'Seguimiento del cultivo', Icon: Leaf, color: '#6EA8FF' },
  { value: 'ALERTA', title: 'Alerta', description: 'Situación detectada', Icon: TriangleAlert, color: '#FFB84D' },
]

const CALIDADES: CalidadGrano[] = ['PREMIUM', 'ESTANDAR', 'DESCUENTO']

export default function NuevaSiembraScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ loteId?: string }>()
  const { data: lotes = [], isLoading } = useLotes()
  const createEvento = useCreateEvento()
  const createCosecha = useCreateCosecha()

  const [loteId, setLoteId] = useState(params.loteId ?? '')
  const [registroMode, setRegistroMode] = useState<RegistroMode>('SIEMBRA')
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('SIEMBRA')
  const [estadoFenologico, setEstadoFenologico] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [rendimientoKgHa, setRendimientoKgHa] = useState('')
  const [toneladasTotal, setToneladasTotal] = useState('')
  const [calidadGrano, setCalidadGrano] = useState<CalidadGrano | undefined>()
  const [humedad, setHumedad] = useState('')

  const saving = createEvento.isPending || createCosecha.isPending

  const handleDescriptionChange = (value: string) => {
    setDescripcion(value.slice(0, MAX_DESCRIPTION))
  }

  const handleSubmit = async () => {
    if (!loteId) {
      Alert.alert('Error', 'Seleccioná un lote')
      return
    }

    try {
      if (registroMode === 'COSECHA') {
        const rendimiento = parseNumber(rendimientoKgHa)
        const toneladas = parseNumber(toneladasTotal)

        if (rendimiento === undefined || toneladas === undefined) {
          Alert.alert('Error', 'Cargá rendimiento y toneladas para registrar la cosecha.')
          return
        }

        await createCosecha.mutateAsync({
          loteId,
          fecha,
          rendimientoKgHa: rendimiento,
          toneladasTotal: toneladas,
          calidadGrano,
          humedad: parseNumber(humedad),
          observaciones: descripcion || undefined,
        })
        Alert.alert('Éxito', 'Cosecha registrada correctamente', [{ text: 'OK', onPress: () => router.replace('/(tabs)/lotes') }])
        return
      }

      await createEvento.mutateAsync({
        loteId,
        tipoEvento,
        estadoFenologico: estadoFenologico || undefined,
        descripcion: descripcion || undefined,
        fecha,
      })
      Alert.alert('Éxito', 'Evento registrado correctamente', [{ text: 'OK', onPress: () => router.replace('/(tabs)/lotes') }])
    } catch {
      Alert.alert('Error', registroMode === 'COSECHA' ? 'No se pudo registrar la cosecha' : 'No se pudo registrar el evento')
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Registrar evento</Text>
          <Text style={styles.subtitle}>Crear un nuevo registro operativo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <SectionTitle>Lote</SectionTitle>
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#9FE870" />
              <Text style={styles.loadingText}>Cargando lotes...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.loteChips}>
              {lotes.map((lote) => {
                const selected = loteId === lote.id
                return (
                  <Pressable key={lote.id} style={[styles.loteChip, selected && styles.loteChipActive]} onPress={() => setLoteId(lote.id)}>
                    <Text style={[styles.loteChipText, selected && styles.loteChipTextActive]}>{lote.nombre}</Text>
                    {selected && <ChipCheck />}
                  </Pressable>
                )
              })}
            </ScrollView>
          )}

          <SectionTitle>Tipo de registro</SectionTitle>
          <CardGrid>
            {REGISTRO_TYPES.map((item) => (
              <SelectableCard
                key={item.value}
                active={registroMode === item.value}
                title={item.title}
                description={item.description}
                Icon={item.Icon}
                color={item.color}
                onPress={() => setRegistroMode(item.value)}
              />
            ))}
          </CardGrid>

          {registroMode === 'SIEMBRA' && (
            <>
              <SectionTitle>Tipo de evento</SectionTitle>
              <CardGrid>
                {EVENT_TYPES.map((item) => (
                  <SelectableCard
                    key={item.value}
                    active={tipoEvento === item.value}
                    title={item.title}
                    description={item.description}
                    Icon={item.Icon}
                    color={item.color}
                    onPress={() => setTipoEvento(item.value)}
                  />
                ))}
              </CardGrid>

              <SectionTitle>Estado fenológico</SectionTitle>
              <View style={styles.inputWrap}>
                <Leaf size={18} color="#9FE870" strokeWidth={2} />
                <TextInput
                  value={estadoFenologico}
                  onChangeText={setEstadoFenologico}
                  style={styles.input}
                  placeholder="Ej: V8, R3, Z65"
                  placeholderTextColor="#6F7D9A"
                />
              </View>
            </>
          )}

          {registroMode === 'COSECHA' && (
            <>
              <SectionTitle>Producción</SectionTitle>
              <View style={styles.formGrid}>
                <MetricInput label="Rendimiento kg/ha" value={rendimientoKgHa} onChangeText={setRendimientoKgHa} />
                <MetricInput label="Toneladas" value={toneladasTotal} onChangeText={setToneladasTotal} />
              </View>

              <SectionTitle>Calidad del grano</SectionTitle>
              <View style={styles.qualityRow}>
                {CALIDADES.map((calidad) => {
                  const selected = calidadGrano === calidad
                  return (
                    <Pressable key={calidad} style={[styles.qualityChip, selected && styles.loteChipActive]} onPress={() => setCalidadGrano(selected ? undefined : calidad)}>
                      <Text style={[styles.loteChipText, selected && styles.loteChipTextActive]}>{calidad}</Text>
                    </Pressable>
                  )
                })}
              </View>

              <SectionTitle>Humedad</SectionTitle>
              <View style={styles.inputWrap}>
                <TextInput
                  value={humedad}
                  onChangeText={setHumedad}
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="Ej: 13.5"
                  placeholderTextColor="#6F7D9A"
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
            </>
          )}

          <SectionTitle>Fecha</SectionTitle>
          <Pressable style={styles.dateInput} onPress={() => setDatePickerOpen(true)}>
            <CalendarDays size={18} color="#A6B0CF" strokeWidth={2} />
            <Text style={styles.dateText}>{formatDateDisplay(fecha)}</Text>
            <ChevronDown size={18} color="#A6B0CF" strokeWidth={2} />
          </Pressable>

          <SectionTitle>{registroMode === 'COSECHA' ? 'Observaciones (opcional)' : 'Descripción (opcional)'}</SectionTitle>
          <View style={styles.textAreaWrap}>
            <PencilLine size={20} color="#6EA8FF" strokeWidth={1.9} />
            <TextInput
              value={descripcion}
              onChangeText={handleDescriptionChange}
              style={styles.textArea}
              placeholder="Observaciones del evento..."
              placeholderTextColor="#6F7D9A"
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{descripcion.length} / {MAX_DESCRIPTION}</Text>
          </View>

          <Pressable style={[styles.submitButton, saving && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={saving}>
            <View style={styles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={styles.submitText}>{saving ? 'Guardando...' : registroMode === 'COSECHA' ? 'Registrar cosecha' : 'Registrar evento'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DatePickerSheet visible={datePickerOpen} value={fecha} onChange={setFecha} onClose={() => setDatePickerOpen(false)} />
    </SafeAreaView>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.eventGrid}>{children}</View>
}

function ChipCheck() {
  return (
    <View style={styles.chipCheck}>
      <Check size={13} color="#081225" strokeWidth={3} />
    </View>
  )
}

function SelectableCard({ active, title, description, Icon, color, onPress }: { active: boolean; title: string; description: string; Icon: LucideIcon; color: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.eventCard, active && styles.eventCardActive]} onPress={onPress}>
      {active && (
        <View style={styles.cardCheck}>
          <Check size={13} color="#081225" strokeWidth={3} />
        </View>
      )}
      <Icon size={34} color={color} strokeWidth={1.8} />
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventDescription}>{description}</Text>
    </Pressable>
  )
}

function MetricInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.metricInputWrap}>
      <Text style={styles.metricLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={styles.metricInput} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#6F7D9A" />
    </View>
  )
}

function DatePickerSheet({ visible, value, onChange, onClose }: { visible: boolean; value: string; onChange: (value: string) => void; onClose: () => void }) {
  const parts = dateParts(value)
  const years = Array.from({ length: 9 }, (_, index) => parts.year - 4 + index)
  const months = Array.from({ length: 12 }, (_, index) => index + 1)
  const days = Array.from({ length: daysInMonth(parts.year, parts.month) }, (_, index) => index + 1)

  const updateDate = (next: Partial<{ day: number; month: number; year: number }>) => {
    const year = next.year ?? parts.year
    const month = next.month ?? parts.month
    const day = Math.min(next.day ?? parts.day, daysInMonth(year, month))
    onChange(`${year}-${pad2(month)}-${pad2(day)}`)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.pickerBackdrop} onPress={onClose} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHandle} />
        <View style={styles.pickerHeader}>
          <View>
            <Text style={styles.pickerTitle}>Seleccionar fecha</Text>
            <Text style={styles.pickerSubtitle}>{formatDateDisplay(value)}</Text>
          </View>
          <Pressable style={styles.pickerDone} onPress={onClose}>
            <Text style={styles.pickerDoneText}>Listo</Text>
          </Pressable>
        </View>

        <View style={styles.pickerColumns}>
          <PickerColumn label="Día" values={days} selected={parts.day} onSelect={(day) => updateDate({ day })} formatter={(day) => pad2(day)} />
          <PickerColumn label="Mes" values={months} selected={parts.month} onSelect={(month) => updateDate({ month })} formatter={(month) => pad2(month)} />
          <PickerColumn label="Año" values={years} selected={parts.year} onSelect={(year) => updateDate({ year })} formatter={(year) => String(year)} />
        </View>
      </View>
    </Modal>
  )
}

function PickerColumn({ label, values, selected, onSelect, formatter }: { label: string; values: number[]; selected: number; onSelect: (value: number) => void; formatter: (value: number) => string }) {
  return (
    <View style={styles.pickerColumn}>
      <Text style={styles.pickerColumnLabel}>{label}</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerOptions}>
        {values.map((value) => {
          const active = value === selected
          return (
            <Pressable key={value} style={[styles.pickerOption, active && styles.pickerOptionActive]} onPress={() => onSelect(value)}>
              <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextActive]}>{formatter(value)}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

function formatDateDisplay(value: string) {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function dateParts(value: string) {
  const [rawYear, rawMonth, rawDay] = value.split('-').map(Number)
  const now = new Date()
  return {
    year: Number.isFinite(rawYear) ? rawYear : now.getFullYear(),
    month: Number.isFinite(rawMonth) ? rawMonth : now.getMonth() + 1,
    day: Number.isFinite(rawDay) ? rawDay : now.getDate(),
  }
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.').trim())
  return Number.isFinite(parsed) ? parsed : undefined
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#081225' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 14 },
  backButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 22, lineHeight: 27, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: '#A6B0CF', fontSize: 13, marginTop: 3 },
  scroll: { paddingHorizontal: 12, paddingBottom: 26 },
  card: { borderRadius: 24, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28, backgroundColor: 'rgba(11, 23, 48, 0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', shadowColor: '#9FE870', shadowOpacity: 0.08, shadowRadius: 32, shadowOffset: { width: 0, height: 16 } },
  sectionTitle: { color: '#A6B0CF', fontSize: 12, lineHeight: 15, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 20, marginBottom: 12 },
  loadingRow: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: '#A6B0CF', fontSize: 13 },
  loteChips: { gap: 10, paddingRight: 20 },
  loteChip: { height: 48, paddingHorizontal: 18, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  loteChipActive: { backgroundColor: 'rgba(159,232,112,0.15)', borderColor: '#9FE870', shadowColor: '#9FE870', shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  loteChipText: { color: '#DCE8F8', fontSize: 13, fontWeight: '800' },
  loteChipTextActive: { color: '#FFFFFF' },
  chipCheck: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9FE870' },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  eventCard: { width: '48%', minHeight: 118, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 16, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  eventCardActive: { backgroundColor: 'rgba(159,232,112,0.08)', borderColor: '#9FE870', shadowColor: '#9FE870', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  cardCheck: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9FE870' },
  eventTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', marginTop: 11, textAlign: 'center' },
  eventDescription: { color: '#A6B0CF', fontSize: 11, lineHeight: 15, marginTop: 4, textAlign: 'center' },
  inputWrap: { height: 56, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '700', paddingVertical: 0 },
  inputSuffix: { color: '#A6B0CF', fontSize: 14, fontWeight: '800' },
  formGrid: { flexDirection: 'row', gap: 10 },
  metricInputWrap: { flex: 1, minHeight: 76, borderRadius: 18, padding: 12, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  metricLabel: { color: '#A6B0CF', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  metricInput: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', padding: 0 },
  qualityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qualityChip: { minHeight: 42, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dateInput: { height: 56, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dateText: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  textAreaWrap: { minHeight: 100, borderRadius: 20, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 26, flexDirection: 'row', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  textArea: { flex: 1, minHeight: 70, color: '#FFFFFF', fontSize: 14, lineHeight: 20, padding: 0 },
  counter: { position: 'absolute', right: 14, bottom: 10, color: '#A6B0CF', fontSize: 11 },
  submitButton: { height: 60, borderRadius: 22, marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#9FE870', shadowColor: '#9FE870', shadowOpacity: 0.42, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
  submitButtonDisabled: { opacity: 0.62 },
  submitIcon: { position: 'absolute', left: 16, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,18,37,0.08)' },
  submitText: { color: '#081225', fontSize: 16, fontWeight: '900' },
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)' },
  pickerSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 26, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(159,232,112,0.14)', shadowColor: '#9FE870', shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: -12 } },
  pickerHandle: { alignSelf: 'center', width: 46, height: 4, borderRadius: 999, backgroundColor: 'rgba(166,176,207,0.35)', marginBottom: 16 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  pickerTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  pickerSubtitle: { color: '#A6B0CF', fontSize: 13, marginTop: 4 },
  pickerDone: { height: 38, paddingHorizontal: 15, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(159,232,112,0.14)', borderWidth: 1, borderColor: 'rgba(159,232,112,0.28)' },
  pickerDoneText: { color: '#9FE870', fontSize: 13, fontWeight: '900' },
  pickerColumns: { flexDirection: 'row', gap: 10, height: 250 },
  pickerColumn: { flex: 1, minWidth: 0 },
  pickerColumnLabel: { color: '#A6B0CF', fontSize: 11, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' },
  pickerOptions: { gap: 8, paddingBottom: 12 },
  pickerOption: { height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1730', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  pickerOptionActive: { backgroundColor: 'rgba(159,232,112,0.14)', borderColor: '#9FE870' },
  pickerOptionText: { color: '#DCE8F8', fontSize: 14, fontWeight: '800' },
  pickerOptionTextActive: { color: '#FFFFFF' },
})
