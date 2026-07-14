import { useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { CalendarDays, Check, ChevronDown, Dna, Fence, Search, Syringe, Tag, User, Wheat, type LucideIcon } from 'lucide-react-native'
import type { Animal, Potrero, RazaBovina, VacunaCatalogo } from '../types/ganaderia'
import type { Operario } from '../types/operarios'

export const HEMBRA_TOKENS = ['femenino', 'hembra', 'f']
export const MACHO_TOKENS = ['masculino', 'macho', 'toro', 'm']

export function matchesSexo(sexo: string | undefined, tokens: string[]): boolean {
  if (!sexo) return false
  return tokens.includes(sexo.trim().toLowerCase())
}

export function formatDateDisplay(value: string) {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

export function dateParts(value: string) {
  const [rawYear, rawMonth, rawDay] = value.split('-').map(Number)
  const now = new Date()
  return {
    year: Number.isFinite(rawYear) ? rawYear : now.getFullYear(),
    month: Number.isFinite(rawMonth) ? rawMonth : now.getMonth() + 1,
    day: Number.isFinite(rawDay) ? rawDay : now.getDate(),
  }
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export function pad2(value: number) {
  return String(value).padStart(2, '0')
}

export function parseNumber(value: string): number | undefined {
  const parsed = Number(value.replace(',', '.').trim())
  return Number.isFinite(parsed) ? parsed : undefined
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={formKitStyles.sectionTitle}>{children}</Text>
}

export function TextField({
  value, onChangeText, placeholder, keyboardType,
}: {
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  keyboardType?: 'decimal-pad' | 'numeric'
}) {
  return (
    <View style={formKitStyles.inputWrap}>
      <TextInput value={value} onChangeText={onChangeText} style={formKitStyles.input} placeholder={placeholder} placeholderTextColor="#6F7D9A" keyboardType={keyboardType} />
    </View>
  )
}

export function TextAreaField({
  value, onChangeText, placeholder, Icon = Search,
}: {
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  Icon?: LucideIcon
}) {
  return (
    <View style={formKitStyles.textAreaWrap}>
      <Icon size={20} color="#6EA8FF" strokeWidth={1.9} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={formKitStyles.textArea}
        placeholder={placeholder}
        placeholderTextColor="#6F7D9A"
        multiline
        textAlignVertical="top"
      />
    </View>
  )
}

export function OptionChips({ options, selected, onSelect }: { options: Array<{ value: string; label: string }>; selected: string; onSelect: (value: string) => void }) {
  return (
    <View style={formKitStyles.chipRow}>
      {options.map((option) => {
        const active = selected === option.value
        return (
          <Pressable key={option.value} style={[formKitStyles.chip, active && formKitStyles.chipActive]} onPress={() => onSelect(option.value)}>
            <Text style={[formKitStyles.chipText, active && formKitStyles.chipTextActive]}>{option.label}</Text>
            {active && <ChipCheck />}
          </Pressable>
        )
      })}
    </View>
  )
}

export function ChipCheck() {
  return (
    <View style={formKitStyles.chipCheck}>
      <Check size={13} color="#081225" strokeWidth={3} />
    </View>
  )
}

export function SelectableCard({ active, title, description, Icon, color, onPress }: { active: boolean; title: string; description: string; Icon: LucideIcon; color: string; onPress: () => void }) {
  return (
    <Pressable style={[formKitStyles.eventCard, active && formKitStyles.eventCardActive]} onPress={onPress}>
      {active && (
        <View style={formKitStyles.cardCheck}>
          <Check size={13} color="#081225" strokeWidth={3} />
        </View>
      )}
      <Icon size={30} color={color} strokeWidth={1.8} />
      <Text style={formKitStyles.eventTitle}>{title}</Text>
      <Text style={formKitStyles.eventDescription}>{description}</Text>
    </Pressable>
  )
}

type CatalogSelectProps<T> = {
  label: string
  items: T[]
  value: string
  onChange: (id: string, item: T) => void
  placeholder: string
  getId: (item: T) => string
  getLabel: (item: T) => string
  getSubtitle: (item: T) => string | undefined
  Icon: LucideIcon
  limit?: number
  hideWhenEmpty?: boolean
  emptyText?: string
}

export function CatalogSelect<T>({
  label, items, value, onChange, placeholder, getId, getLabel, getSubtitle, Icon, limit = 6, hideWhenEmpty = false, emptyText = 'Sin resultados disponibles.',
}: CatalogSelectProps<T>) {
  const [query, setQuery] = useState('')
  const isEmptyQuery = !query.trim()
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term && hideWhenEmpty) return []
    return items
      .filter((item) => !term || getLabel(item).toLowerCase().includes(term) || (getSubtitle(item)?.toLowerCase().includes(term) ?? false))
      .slice(0, limit)
  }, [items, query, hideWhenEmpty, getLabel, getSubtitle, limit])
  const showEmptyMessage = !filtered.length && !(hideWhenEmpty && isEmptyQuery)

  return (
    <View style={formKitStyles.fieldGroup}>
      <SectionTitle>{label}</SectionTitle>
      <View style={formKitStyles.searchBox}>
        <Search size={18} color="#6EA8FF" strokeWidth={2} />
        <TextInput style={formKitStyles.searchInput} value={query} onChangeText={setQuery} placeholder={placeholder} placeholderTextColor="#6F7D9A" />
      </View>
      {!!filtered.length && (
        <ScrollView style={formKitStyles.peopleListScroll} contentContainerStyle={formKitStyles.peopleList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {filtered.map((item) => {
            const id = getId(item)
            const active = id === value
            return (
              <Pressable
                key={id}
                style={[formKitStyles.personItem, active && formKitStyles.personItemActive]}
                onPress={() => {
                  onChange(id, item)
                  setQuery(getLabel(item))
                }}
              >
                <View style={formKitStyles.personIcon}>
                  <Icon size={16} color={active ? '#9FE870' : '#A6B0CF'} strokeWidth={2} />
                </View>
                <View style={formKitStyles.personText}>
                  <Text style={formKitStyles.personName}>{getLabel(item)}</Text>
                  <Text style={formKitStyles.personRole}>{getSubtitle(item) ?? 'Sin datos'}</Text>
                </View>
                {active && <Check size={16} color="#9FE870" strokeWidth={2.4} />}
              </Pressable>
            )
          })}
        </ScrollView>
      )}
      {showEmptyMessage && <Text style={formKitStyles.emptyPickerText}>{emptyText}</Text>}
    </View>
  )
}

export function AnimalSelect({
  label, animales, value, onChange, placeholder, hideWhenEmpty = false, limit = 2,
}: {
  label: string
  animales: Animal[]
  value: string
  onChange: (id: string) => void
  placeholder: string
  hideWhenEmpty?: boolean
  limit?: number
}) {
  return (
    <CatalogSelect
      label={label}
      items={animales}
      value={value}
      onChange={(id) => onChange(id)}
      placeholder={placeholder}
      getId={(item) => item.id}
      getLabel={(item) => item.caravana}
      getSubtitle={(item) => item.raza ?? item.potreroNombre}
      Icon={Tag}
      limit={limit}
      hideWhenEmpty={hideWhenEmpty}
      emptyText="Sin animales disponibles."
    />
  )
}

export function PersonSelect({
  label, operarios, value, onChange, placeholder, hideWhenEmpty = false, limit = 6,
}: {
  label: string
  operarios: Operario[]
  value: string
  onChange: (id: string) => void
  placeholder: string
  hideWhenEmpty?: boolean
  limit?: number
}) {
  return (
    <CatalogSelect
      label={label}
      items={operarios}
      value={value}
      onChange={(id) => onChange(id)}
      placeholder={placeholder}
      getId={(item) => item.id}
      getLabel={(item) => item.nombreCompleto}
      getSubtitle={(item) => item.rolOperativo ?? item.username}
      Icon={User}
      limit={limit}
      hideWhenEmpty={hideWhenEmpty}
      emptyText="Sin personas disponibles."
    />
  )
}

export function RazaSelect({
  razas, value, onChange, placeholder, label = 'Raza (opcional)',
}: {
  razas: RazaBovina[]
  value: string
  onChange: (id: string, nombre: string) => void
  placeholder: string
  label?: string
}) {
  return (
    <CatalogSelect
      label={label}
      items={razas}
      value={value}
      onChange={(id, item) => onChange(id, item.nombre)}
      placeholder={placeholder}
      getId={(item) => item.id}
      getLabel={(item) => item.nombre}
      getSubtitle={(item) => item.aptitud ?? item.tipoGenetico}
      Icon={Dna}
      limit={2}
      hideWhenEmpty
      emptyText="Sin razas disponibles."
    />
  )
}

export function PotreroSelect({
  potreros, value, onChange, placeholder, label = 'Potrero actual (opcional)',
}: {
  potreros: Potrero[]
  value: string
  onChange: (id: string) => void
  placeholder: string
  label?: string
}) {
  return (
    <CatalogSelect
      label={label}
      items={potreros}
      value={value}
      onChange={(id) => onChange(id)}
      placeholder={placeholder}
      getId={(item) => item.id}
      getLabel={(item) => item.nombre}
      getSubtitle={(item) => item.tipoUso ?? item.estado}
      Icon={Fence}
      limit={2}
      hideWhenEmpty
      emptyText="Sin potreros disponibles."
    />
  )
}

export function VacunaSelect({
  vacunas, value, onChange, placeholder, label = 'Vacuna',
}: {
  vacunas: VacunaCatalogo[]
  value: string
  onChange: (id: string, nombre: string) => void
  placeholder: string
  label?: string
}) {
  return (
    <CatalogSelect
      label={label}
      items={vacunas}
      value={value}
      onChange={(id, item) => onChange(id, item.nombre)}
      placeholder={placeholder}
      getId={(item) => item.id}
      getLabel={(item) => item.nombre}
      getSubtitle={(item) => item.codigo ?? item.laboratorio}
      Icon={Syringe}
      limit={2}
      emptyText="Sin vacunas disponibles."
    />
  )
}

export type CatalogOption = { value: string; label: string; subtitle?: string }

export function StaticCatalogSelect({
  label, options, value, onChange, placeholder, Icon = Wheat,
}: {
  label: string
  options: CatalogOption[]
  value: string
  onChange: (value: string, label: string) => void
  placeholder: string
  Icon?: LucideIcon
}) {
  return (
    <CatalogSelect
      label={label}
      items={options}
      value={value}
      onChange={(id, item) => onChange(id, item.label)}
      placeholder={placeholder}
      getId={(item) => item.value}
      getLabel={(item) => item.label}
      getSubtitle={(item) => item.subtitle}
      Icon={Icon}
      limit={8}
      hideWhenEmpty={false}
      emptyText="Sin opciones disponibles."
    />
  )
}

export function DatePickerSheet({ visible, value, onChange, onClose }: { visible: boolean; value: string; onChange: (value: string) => void; onClose: () => void }) {
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
      <Pressable style={formKitStyles.pickerBackdrop} onPress={onClose} />
      <View style={formKitStyles.pickerSheet}>
        <View style={formKitStyles.pickerHandle} />
        <View style={formKitStyles.pickerHeader}>
          <View>
            <Text style={formKitStyles.pickerTitle}>Seleccionar fecha</Text>
            <Text style={formKitStyles.pickerSubtitle}>{formatDateDisplay(value)}</Text>
          </View>
          <Pressable style={formKitStyles.pickerDone} onPress={onClose}>
            <Text style={formKitStyles.pickerDoneText}>Listo</Text>
          </Pressable>
        </View>

        <View style={formKitStyles.pickerColumns}>
          <PickerColumn label="Día" values={days} selected={parts.day} onSelect={(day) => updateDate({ day })} formatter={(day) => pad2(day)} />
          <PickerColumn label="Mes" values={months} selected={parts.month} onSelect={(month) => updateDate({ month })} formatter={(month) => pad2(month)} />
          <PickerColumn label="Año" values={years} selected={parts.year} onSelect={(year) => updateDate({ year })} formatter={(year) => String(year)} />
        </View>
      </View>
    </Modal>
  )
}

export function PickerColumn({ label, values, selected, onSelect, formatter }: { label: string; values: number[]; selected: number; onSelect: (value: number) => void; formatter: (value: number) => string }) {
  return (
    <View style={formKitStyles.pickerColumn}>
      <Text style={formKitStyles.pickerColumnLabel}>{label}</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={formKitStyles.pickerOptions}>
        {values.map((value) => {
          const active = value === selected
          return (
            <Pressable key={value} style={[formKitStyles.pickerOption, active && formKitStyles.pickerOptionActive]} onPress={() => onSelect(value)}>
              <Text style={[formKitStyles.pickerOptionText, active && formKitStyles.pickerOptionTextActive]}>{formatter(value)}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

export function DateField({ label, value, onPress, emptyLabel = 'Sin definir' }: { label: string; value: string; onPress: () => void; emptyLabel?: string }) {
  return (
    <>
      <SectionTitle>{label}</SectionTitle>
      <Pressable style={formKitStyles.dateInput} onPress={onPress}>
        <CalendarDays size={18} color="#A6B0CF" strokeWidth={2} />
        <Text style={formKitStyles.dateText}>{value ? formatDateDisplay(value) : emptyLabel}</Text>
        <ChevronDown size={18} color="#A6B0CF" strokeWidth={2} />
      </Pressable>
    </>
  )
}

export const formKitStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#081225' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 14 },
  backButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 22, lineHeight: 27, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: '#A6B0CF', fontSize: 13, marginTop: 3 },
  scroll: { paddingHorizontal: 12, paddingBottom: 26 },
  card: {
    borderRadius: 24, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28,
    backgroundColor: 'rgba(11, 23, 48, 0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#9FE870', shadowOpacity: 0.08, shadowRadius: 32, shadowOffset: { width: 0, height: 16 },
  },
  sectionTitle: {
    color: '#A6B0CF', fontSize: 12, lineHeight: 15, fontWeight: '900', letterSpacing: 0.7,
    textTransform: 'uppercase', marginTop: 20, marginBottom: 12,
  },
  loadingRow: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  loadingText: { color: '#A6B0CF', fontSize: 13 },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  eventCard: {
    width: '31%', minHeight: 108, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 14,
    backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  eventCardActive: { backgroundColor: 'rgba(159,232,112,0.08)', borderColor: '#9FE870', shadowColor: '#9FE870', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  cardCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9FE870' },
  eventTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', marginTop: 9, textAlign: 'center' },
  eventDescription: { color: '#A6B0CF', fontSize: 9, lineHeight: 12, marginTop: 3, textAlign: 'center' },
  fieldGroup: { gap: 0 },
  searchBox: {
    height: 52, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14, padding: 0 },
  peopleListScroll: { maxHeight: 118, marginTop: 8 },
  peopleList: { gap: 8 },
  emptyPickerText: { color: '#A6B0CF', fontSize: 12, paddingVertical: 8 },
  personItem: {
    minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 10,
    backgroundColor: 'rgba(8,18,37,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  personItemActive: { borderColor: 'rgba(159,232,112,0.6)', backgroundColor: 'rgba(159,232,112,0.10)' },
  personIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  personText: { flex: 1 },
  personName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  personRole: { color: '#A6B0CF', fontSize: 11, marginTop: 2 },
  addAnimalButton: {
    height: 44, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, backgroundColor: 'rgba(159,232,112,0.08)', borderWidth: 1, borderColor: 'rgba(159,232,112,0.24)',
  },
  addAnimalText: { color: '#9FE870', fontSize: 12, fontWeight: '800' },
  newAnimalBox: {
    marginTop: 12, padding: 14, borderRadius: 18,
    backgroundColor: 'rgba(8,18,37,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  newAnimalTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  saveAnimalButton: { height: 46, marginTop: 20, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9FE870' },
  saveAnimalText: { color: '#081225', fontSize: 13, fontWeight: '900' },
  chipCheck: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9FE870' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { minHeight: 42, paddingHorizontal: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { borderColor: '#9FE870', backgroundColor: 'rgba(159,232,112,0.12)' },
  chipText: { color: '#DCE8F8', fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  inputWrap: { height: 56, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '700', paddingVertical: 0 },
  dateInput: { height: 56, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dateText: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  textAreaWrap: { minHeight: 100, borderRadius: 20, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14, flexDirection: 'row', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  textArea: { flex: 1, minHeight: 70, color: '#FFFFFF', fontSize: 14, lineHeight: 20, padding: 0 },
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
