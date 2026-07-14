import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  Check,
  ChevronDown,
  Dna,
  Heart,
  PencilLine,
  Plus,
  Search,
  Syringe,
  Tag,
  User,
  UserPlus,
  type LucideIcon,
} from 'lucide-react-native'
import { useAnimales, useCreateAnimal } from '../../shared/hooks/useAnimales'
import { useOperarios } from '../../shared/hooks/useOperarios'
import { useCreateControlPrenez, useCreateIndiceGenetico, useCreateInseminacion, useCreateMonta, useCreateParto } from '../../shared/hooks/useReproduccion'
import type { Animal } from '../../shared/types/ganaderia'
import type { Operario } from '../../shared/types/operarios'

type ActividadTipo = 'MONTA' | 'INSEMINACION' | 'PRENEZ' | 'PARTO' | 'INDICE'

const ACTIVIDAD_TYPES: Array<{ value: ActividadTipo; title: string; description: string; Icon: LucideIcon; color: string }> = [
  { value: 'MONTA', title: 'Nueva monta', description: 'Servicio natural', Icon: Heart, color: '#9FE870' },
  { value: 'INSEMINACION', title: 'Inseminación', description: 'Inseminación artificial', Icon: Syringe, color: '#6EA8FF' },
  { value: 'PRENEZ', title: 'Preñez', description: 'Control de preñez', Icon: Baby, color: '#9A7DFF' },
  { value: 'PARTO', title: 'Parto', description: 'Registro de parto', Icon: Baby, color: '#FFB84D' },
  { value: 'INDICE', title: 'Índice', description: 'Índice genético', Icon: Dna, color: '#39D0D8' },
]

const RESULTADOS_MONTA = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PRENADA', label: 'Preñada' },
  { value: 'FALLIDA', label: 'Fallida' },
]

const ESTADOS_PRENEZ = [
  { value: 'PRENADA', label: 'Preñada' },
  { value: 'VACIA', label: 'Vacía' },
  { value: 'CONTROL', label: 'Control' },
]

const NIVELES_RIESGO = [
  { value: 'BAJO', label: 'Bajo' },
  { value: 'MEDIO', label: 'Medio' },
  { value: 'ALTO', label: 'Alto' },
]

const VIABILIDADES = [
  { value: 'VIABLE', label: 'Viable' },
  { value: 'NO_VIABLE', label: 'No viable' },
  { value: 'OBSERVACION', label: 'Observación' },
]

const SEXOS_ANIMAL = [
  { value: 'HEMBRA', label: 'Hembra' },
  { value: 'MACHO', label: 'Macho' },
]

const HEMBRA_TOKENS = ['femenino', 'hembra', 'f']
const MACHO_TOKENS = ['masculino', 'macho', 'toro', 'm']

export default function NuevaReproduccionScreen() {
  const router = useRouter()
  const { data: animales = [], isLoading: loadingAnimales } = useAnimales()
  const { data: operarios = [] } = useOperarios({ estado: 'ACTIVO' })
  const createAnimal = useCreateAnimal()

  const createMonta = useCreateMonta()
  const createInseminacion = useCreateInseminacion()
  const createControlPrenez = useCreateControlPrenez()
  const createParto = useCreateParto()
  const createIndiceGenetico = useCreateIndiceGenetico()
  const saving =
    createMonta.isPending || createInseminacion.isPending || createControlPrenez.isPending || createParto.isPending || createIndiceGenetico.isPending

  const [tipo, setTipo] = useState<ActividadTipo>('MONTA')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [datePickerTarget, setDatePickerTarget] = useState<'fecha' | 'fechaEstimadaParto' | null>(null)
  const [observaciones, setObservaciones] = useState('')

  const [vacaId, setVacaId] = useState('')
  const [toroId, setToroId] = useState('')
  const [resultadoMonta, setResultadoMonta] = useState('PENDIENTE')

  const [geneticaUsada, setGeneticaUsada] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [costo, setCosto] = useState('')

  const [estadoPrenez, setEstadoPrenez] = useState('PRENADA')
  const [fechaEstimadaParto, setFechaEstimadaParto] = useState('')
  const [nivelRiesgoParto, setNivelRiesgoParto] = useState('MEDIO')
  const [veterinarioId, setVeterinarioId] = useState('')

  const [madreId, setMadreId] = useState('')
  const [terneroId, setTerneroId] = useState('')
  const [viabilidadTernero, setViabilidadTernero] = useState('VIABLE')

  const [animalId, setAnimalId] = useState('')
  const [epd, setEpd] = useState('')
  const [dep, setDep] = useState('')
  const [indiceProductivo, setIndiceProductivo] = useState('')

  const [addingTernero, setAddingTernero] = useState(false)
  const [newAnimalCaravana, setNewAnimalCaravana] = useState('')
  const [newAnimalSexo, setNewAnimalSexo] = useState('HEMBRA')
  const [newAnimalRaza, setNewAnimalRaza] = useState('')

  const hembras = useMemo(() => animales.filter((animal) => matchesSexo(animal.sexo, HEMBRA_TOKENS)), [animales])
  const machos = useMemo(() => animales.filter((animal) => matchesSexo(animal.sexo, MACHO_TOKENS)), [animales])

  const handleCreateTernero = async () => {
    if (!newAnimalCaravana.trim()) {
      Alert.alert('Error', 'Ingresá la caravana del animal.')
      return
    }
    try {
      const created = await createAnimal.mutateAsync({
        caravana: newAnimalCaravana.trim(),
        sexo: newAnimalSexo,
        raza: newAnimalRaza.trim() || undefined,
      })
      setTerneroId(created.id)
      setAddingTernero(false)
      setNewAnimalCaravana('')
      setNewAnimalRaza('')
      setNewAnimalSexo('HEMBRA')
    } catch {
      Alert.alert('Error', 'No se pudo registrar el animal.')
    }
  }

  const handleSubmit = async () => {
    try {
      if (tipo === 'MONTA') {
        if (!vacaId || !toroId) {
          Alert.alert('Error', 'Seleccioná la vaca y el toro.')
          return
        }
        await createMonta.mutateAsync({ vacaId, toroId, fecha, resultado: resultadoMonta, observaciones: observaciones || undefined })
      } else if (tipo === 'INSEMINACION') {
        if (!vacaId || !geneticaUsada.trim()) {
          Alert.alert('Error', 'Seleccioná la vaca e ingresá la genética usada.')
          return
        }
        await createInseminacion.mutateAsync({
          vacaId,
          fecha,
          geneticaUsada: geneticaUsada.trim(),
          tecnico: tecnicoId || undefined,
          costo: parseNumber(costo),
          observaciones: observaciones || undefined,
        })
      } else if (tipo === 'PRENEZ') {
        if (!vacaId) {
          Alert.alert('Error', 'Seleccioná la vaca.')
          return
        }
        await createControlPrenez.mutateAsync({
          vacaId,
          fechaDiagnostico: fecha,
          estado: estadoPrenez,
          fechaEstimadaParto: fechaEstimadaParto || undefined,
          nivelRiesgoParto,
          veterinario: veterinarioId || undefined,
          observaciones: observaciones || undefined,
        })
      } else if (tipo === 'PARTO') {
        if (!madreId) {
          Alert.alert('Error', 'Seleccioná la madre.')
          return
        }
        await createParto.mutateAsync({
          madreId,
          terneroId: terneroId || undefined,
          fecha,
          viabilidadTernero,
          observaciones: observaciones || undefined,
        })
      } else {
        if (!animalId) {
          Alert.alert('Error', 'Seleccioná el animal.')
          return
        }
        await createIndiceGenetico.mutateAsync({
          animalId,
          fechaEvaluacion: fecha,
          epd: parseNumber(epd),
          dep: parseNumber(dep),
          indiceProductivo: parseNumber(indiceProductivo),
          observaciones: observaciones || undefined,
        })
      }

      Alert.alert('Éxito', 'Actividad reproductiva registrada correctamente.', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo registrar la actividad.')
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Agregar reproducción</Text>
          <Text style={styles.subtitle}>Registrar un nuevo evento reproductivo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <SectionTitle>Tipo de actividad</SectionTitle>
          <View style={styles.eventGrid}>
            {ACTIVIDAD_TYPES.map((item) => (
              <SelectableCard
                key={item.value}
                active={tipo === item.value}
                title={item.title}
                description={item.description}
                Icon={item.Icon}
                color={item.color}
                onPress={() => setTipo(item.value)}
              />
            ))}
          </View>

          {loadingAnimales ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#9FE870" />
              <Text style={styles.loadingText}>Cargando animales...</Text>
            </View>
          ) : (
            <>
              {tipo === 'MONTA' && (
                <>
                  <AnimalSelect label="Vaca" animales={hembras} value={vacaId} onChange={setVacaId} placeholder="Buscar vaca por caravana" />
                  <AnimalSelect label="Toro" animales={machos} value={toroId} onChange={setToroId} placeholder="Buscar toro por caravana" />
                  <SectionTitle>Resultado</SectionTitle>
                  <OptionChips options={RESULTADOS_MONTA} selected={resultadoMonta} onSelect={setResultadoMonta} />
                </>
              )}

              {tipo === 'INSEMINACION' && (
                <>
                  <AnimalSelect label="Vaca" animales={hembras} value={vacaId} onChange={setVacaId} placeholder="Buscar vaca por caravana" />
                  <SectionTitle>Genética usada</SectionTitle>
                  <TextField value={geneticaUsada} onChangeText={setGeneticaUsada} placeholder="Ej: Angus PC 4021" />
                  <PersonSelect label="Técnico (opcional)" operarios={operarios} value={tecnicoId} onChange={setTecnicoId} placeholder="Buscar responsable" />
                  <SectionTitle>Costo (opcional)</SectionTitle>
                  <TextField value={costo} onChangeText={setCosto} placeholder="0" keyboardType="decimal-pad" />
                </>
              )}

              {tipo === 'PRENEZ' && (
                <>
                  <AnimalSelect label="Vaca" animales={hembras} value={vacaId} onChange={setVacaId} placeholder="Buscar vaca por caravana" />
                  <SectionTitle>Estado</SectionTitle>
                  <OptionChips options={ESTADOS_PRENEZ} selected={estadoPrenez} onSelect={setEstadoPrenez} />
                  <SectionTitle>Parto estimado (opcional)</SectionTitle>
                  <Pressable style={styles.dateInput} onPress={() => setDatePickerTarget('fechaEstimadaParto')}>
                    <CalendarDays size={18} color="#A6B0CF" strokeWidth={2} />
                    <Text style={styles.dateText}>{fechaEstimadaParto ? formatDateDisplay(fechaEstimadaParto) : 'Sin definir'}</Text>
                    <ChevronDown size={18} color="#A6B0CF" strokeWidth={2} />
                  </Pressable>
                  <SectionTitle>Nivel de riesgo del parto</SectionTitle>
                  <OptionChips options={NIVELES_RIESGO} selected={nivelRiesgoParto} onSelect={setNivelRiesgoParto} />
                  <PersonSelect label="Veterinario (opcional)" operarios={operarios} value={veterinarioId} onChange={setVeterinarioId} placeholder="Buscar veterinario" />
                </>
              )}

              {tipo === 'PARTO' && (
                <>
                  <AnimalSelect label="Madre" animales={hembras} value={madreId} onChange={setMadreId} placeholder="Buscar madre por caravana" />

                  <AnimalSelect label="Ternero (opcional)" animales={animales} value={terneroId} onChange={setTerneroId} placeholder="Buscar ternero por caravana" />
                  <Pressable style={styles.addAnimalButton} onPress={() => setAddingTernero((current) => !current)}>
                    <UserPlus size={16} color="#9FE870" strokeWidth={2.2} />
                    <Text style={styles.addAnimalText}>{addingTernero ? 'Cancelar' : 'Registrar nuevo animal'}</Text>
                  </Pressable>

                  {addingTernero && (
                    <View style={styles.newAnimalBox}>
                      <Text style={styles.newAnimalTitle}>Alta rápida de animal</Text>
                      <TextField value={newAnimalCaravana} onChangeText={setNewAnimalCaravana} placeholder="Caravana" />
                      <View style={styles.chipRow}>
                        {SEXOS_ANIMAL.map((option) => {
                          const active = newAnimalSexo === option.value
                          return (
                            <Pressable key={option.value} style={[styles.chip, active && styles.chipActive]} onPress={() => setNewAnimalSexo(option.value)}>
                              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                            </Pressable>
                          )
                        })}
                      </View>
                      <TextField value={newAnimalRaza} onChangeText={setNewAnimalRaza} placeholder="Raza (opcional)" />
                      <Pressable style={[styles.saveAnimalButton, createAnimal.isPending && styles.submitButtonDisabled]} onPress={handleCreateTernero} disabled={createAnimal.isPending}>
                        <Text style={styles.saveAnimalText}>{createAnimal.isPending ? 'Guardando...' : 'Guardar animal'}</Text>
                      </Pressable>
                    </View>
                  )}

                  <SectionTitle>Viabilidad</SectionTitle>
                  <OptionChips options={VIABILIDADES} selected={viabilidadTernero} onSelect={setViabilidadTernero} />
                </>
              )}

              {tipo === 'INDICE' && (
                <>
                  <AnimalSelect label="Animal" animales={animales} value={animalId} onChange={setAnimalId} placeholder="Buscar animal por caravana" />
                  <SectionTitle>EPD (opcional)</SectionTitle>
                  <TextField value={epd} onChangeText={setEpd} placeholder="0" keyboardType="decimal-pad" />
                  <SectionTitle>DEP (opcional)</SectionTitle>
                  <TextField value={dep} onChangeText={setDep} placeholder="0" keyboardType="decimal-pad" />
                  <SectionTitle>Índice productivo (opcional)</SectionTitle>
                  <TextField value={indiceProductivo} onChangeText={setIndiceProductivo} placeholder="0" keyboardType="decimal-pad" />
                </>
              )}
            </>
          )}

          <SectionTitle>Fecha</SectionTitle>
          <Pressable style={styles.dateInput} onPress={() => setDatePickerTarget('fecha')}>
            <CalendarDays size={18} color="#A6B0CF" strokeWidth={2} />
            <Text style={styles.dateText}>{formatDateDisplay(fecha)}</Text>
            <ChevronDown size={18} color="#A6B0CF" strokeWidth={2} />
          </Pressable>

          <SectionTitle>Observaciones (opcional)</SectionTitle>
          <View style={styles.textAreaWrap}>
            <PencilLine size={20} color="#6EA8FF" strokeWidth={1.9} />
            <TextInput
              value={observaciones}
              onChangeText={setObservaciones}
              style={styles.textArea}
              placeholder="Observaciones del evento..."
              placeholderTextColor="#6F7D9A"
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable style={[styles.submitButton, saving && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={saving}>
            <View style={styles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={styles.submitText}>{saving ? 'Guardando...' : 'Registrar actividad'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DatePickerSheet
        visible={datePickerTarget !== null}
        value={datePickerTarget === 'fechaEstimadaParto' ? fechaEstimadaParto || fecha : fecha}
        onChange={datePickerTarget === 'fechaEstimadaParto' ? setFechaEstimadaParto : setFecha}
        onClose={() => setDatePickerTarget(null)}
      />
    </SafeAreaView>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

function TextField({ value, onChangeText, placeholder, keyboardType }: { value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'decimal-pad' }) {
  return (
    <View style={styles.inputWrap}>
      <TextInput value={value} onChangeText={onChangeText} style={styles.input} placeholder={placeholder} placeholderTextColor="#6F7D9A" keyboardType={keyboardType} />
    </View>
  )
}

function OptionChips({ options, selected, onSelect }: { options: Array<{ value: string; label: string }>; selected: string; onSelect: (value: string) => void }) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = selected === option.value
        return (
          <Pressable key={option.value} style={[styles.chip, active && styles.chipActive]} onPress={() => onSelect(option.value)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            {active && <ChipCheck />}
          </Pressable>
        )
      })}
    </View>
  )
}

function AnimalSelect({ label, animales, value, onChange, placeholder }: { label: string; animales: Animal[]; value: string; onChange: (id: string) => void; placeholder: string }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return animales
      .filter((item) => !term || [item.caravana, item.raza, item.potreroNombre].some((field) => field?.toLowerCase().includes(term)))
      .slice(0, 2)
  }, [animales, query])

  return (
    <View style={styles.fieldGroup}>
      <SectionTitle>{label}</SectionTitle>
      <View style={styles.searchBox}>
        <Search size={18} color="#6EA8FF" strokeWidth={2} />
        <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder={placeholder} placeholderTextColor="#6F7D9A" />
      </View>
      <View style={styles.peopleList}>
        {filtered.map((item) => {
          const active = item.id === value
          return (
            <Pressable
              key={item.id}
              style={[styles.personItem, active && styles.personItemActive]}
              onPress={() => {
                onChange(item.id)
                setQuery(item.caravana)
              }}
            >
              <View style={styles.personIcon}>
                <Tag size={16} color={active ? '#9FE870' : '#A6B0CF'} strokeWidth={2} />
              </View>
              <View style={styles.personText}>
                <Text style={styles.personName}>{item.caravana}</Text>
                <Text style={styles.personRole}>{item.raza ?? item.potreroNombre ?? 'Sin datos'}</Text>
              </View>
              {active && <Check size={16} color="#9FE870" strokeWidth={2.4} />}
            </Pressable>
          )
        })}
        {!filtered.length && <Text style={styles.emptyPickerText}>Sin animales disponibles.</Text>}
      </View>
    </View>
  )
}

function PersonSelect({ label, operarios, value, onChange, placeholder }: { label: string; operarios: Operario[]; value: string; onChange: (id: string) => void; placeholder: string }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return operarios
      .filter((item) => !term || [item.nombreCompleto, item.username, item.documentoNumero, item.rolOperativo].some((field) => field?.toLowerCase().includes(term)))
      .slice(0, 6)
  }, [operarios, query])

  return (
    <View style={styles.fieldGroup}>
      <SectionTitle>{label}</SectionTitle>
      <View style={styles.searchBox}>
        <Search size={18} color="#6EA8FF" strokeWidth={2} />
        <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder={placeholder} placeholderTextColor="#6F7D9A" />
      </View>
      <ScrollView style={styles.peopleListScroll} contentContainerStyle={styles.peopleList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {filtered.map((item) => {
          const active = item.id === value
          return (
            <Pressable
              key={item.id}
              style={[styles.personItem, active && styles.personItemActive]}
              onPress={() => {
                onChange(item.id)
                setQuery(item.nombreCompleto)
              }}
            >
              <View style={styles.personIcon}>
                <User size={16} color={active ? '#9FE870' : '#A6B0CF'} strokeWidth={2} />
              </View>
              <View style={styles.personText}>
                <Text style={styles.personName}>{item.nombreCompleto}</Text>
                <Text style={styles.personRole}>{item.rolOperativo ?? item.username ?? 'Operario'}</Text>
              </View>
              {active && <Check size={16} color="#9FE870" strokeWidth={2.4} />}
            </Pressable>
          )
        })}
        {!filtered.length && <Text style={styles.emptyPickerText}>Sin personas disponibles.</Text>}
      </ScrollView>
    </View>
  )
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
      <Icon size={30} color={color} strokeWidth={1.8} />
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventDescription}>{description}</Text>
    </Pressable>
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

function matchesSexo(sexo: string | undefined, tokens: string[]): boolean {
  if (!sexo) return false
  const normalized = sexo.trim().toLowerCase()
  return tokens.includes(normalized)
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

function parseNumber(value: string): number | undefined {
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
  peopleListScroll: { maxHeight: 220, marginTop: 8 },
  peopleList: { gap: 8, marginTop: 8 },
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
    marginTop: 12, padding: 14, borderRadius: 18, gap: 10,
    backgroundColor: 'rgba(8,18,37,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  newAnimalTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  saveAnimalButton: { height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9FE870' },
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
