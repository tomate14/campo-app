import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Check, Droplets, Fence, Leaf, PencilLine, Plus, TreeDeciduous } from 'lucide-react-native'
import { useCreatePotrero, usePotrero, useUpdatePotrero } from '../../shared/hooks/usePotreros'

const TIPOS_USO = ['PASTOREO', 'RESERVA', 'RECRIA', 'MATERNIDAD', 'ENCIERRE', 'OTRO']
const ESTADOS: Array<{ value: string; label: string; color: string }> = [
  { value: 'ACTIVO', label: 'Activo', color: '#9FE870' },
  { value: 'DESCANSO', label: 'Descanso', color: '#6EA8FF' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', color: '#FFB84D' },
  { value: 'INACTIVO', label: 'Inactivo', color: '#A6B0CF' },
]

export default function PotreroFormScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string }>()
  const potreroId = params.id
  const isEdit = Boolean(potreroId)

  const { data: potrero, isLoading } = usePotrero(potreroId ?? '')
  const createPotrero = useCreatePotrero()
  const updatePotrero = useUpdatePotrero()
  const saving = createPotrero.isPending || updatePotrero.isPending

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [superficieHa, setSuperficieHa] = useState('')
  const [tipoUso, setTipoUso] = useState('PASTOREO')
  const [estado, setEstado] = useState('ACTIVO')
  const [capacidadAnimales, setCapacidadAnimales] = useState('')
  const [recursoForrajero, setRecursoForrajero] = useState('')
  const [disponibilidadAgua, setDisponibilidadAgua] = useState(false)
  const [tieneSombra, setTieneSombra] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [poligono, setPoligono] = useState('')
  const [centroideLatitud, setCentroideLatitud] = useState('')
  const [centroideLongitud, setCentroideLongitud] = useState('')

  useEffect(() => {
    if (!potrero) return
    setNombre(potrero.nombre ?? '')
    setDescripcion(potrero.descripcion ?? '')
    setSuperficieHa(String(potrero.superficieHa ?? ''))
    setTipoUso(potrero.tipoUso ?? 'PASTOREO')
    setEstado(potrero.estado ?? 'ACTIVO')
    setCapacidadAnimales(potrero.capacidadAnimales != null ? String(potrero.capacidadAnimales) : '')
    setRecursoForrajero(potrero.recursoForrajero ?? '')
    setDisponibilidadAgua(Boolean(potrero.disponibilidadAgua))
    setTieneSombra(Boolean(potrero.tieneSombra))
    setObservaciones(potrero.observaciones ?? '')
    setPoligono(potrero.poligono ?? '')
    setCentroideLatitud(potrero.centroideLatitud != null ? String(potrero.centroideLatitud) : '')
    setCentroideLongitud(potrero.centroideLongitud != null ? String(potrero.centroideLongitud) : '')
  }, [potrero])

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingresá un nombre para el potrero.')
      return
    }
    const superficie = parseNumber(superficieHa)
    if (superficie === undefined) {
      Alert.alert('Error', 'Ingresá la superficie en hectáreas.')
      return
    }
    if (!poligono.trim()) {
      Alert.alert('Error', 'Ingresá el polígono GeoJSON del potrero.')
      return
    }

    const data = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      superficieHa: superficie,
      tipoUso,
      estado,
      capacidadAnimales: parseInteger(capacidadAnimales),
      recursoForrajero: recursoForrajero.trim() || undefined,
      disponibilidadAgua,
      tieneSombra,
      observaciones: observaciones.trim() || undefined,
      poligono: poligono.trim(),
      centroideLatitud: parseNumber(centroideLatitud),
      centroideLongitud: parseNumber(centroideLongitud),
    }

    try {
      if (isEdit && potreroId) {
        await updatePotrero.mutateAsync({ id: potreroId, data })
        Alert.alert('Éxito', 'Potrero actualizado correctamente.', [{ text: 'OK', onPress: () => router.back() }])
      } else {
        await createPotrero.mutateAsync(data)
        Alert.alert('Éxito', 'Potrero creado correctamente.', [{ text: 'OK', onPress: () => router.back() }])
      }
    } catch {
      Alert.alert('Error', isEdit ? 'No se pudo actualizar el potrero.' : 'No se pudo crear el potrero.')
    }
  }

  if (isEdit && isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9FE870" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{isEdit ? 'Editar potrero' : 'Nuevo potrero'}</Text>
          <Text style={styles.subtitle}>{isEdit ? 'Actualizá los datos del potrero' : 'Cargá un nuevo potrero del establecimiento'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <SectionTitle>Nombre</SectionTitle>
          <View style={styles.inputWrap}>
            <Fence size={18} color="#9FE870" strokeWidth={2} />
            <TextInput value={nombre} onChangeText={setNombre} style={styles.input} placeholder="Potrero 12" placeholderTextColor="#6F7D9A" />
          </View>

          <SectionTitle>Tipo de uso</SectionTitle>
          <View style={styles.chipRow}>
            {TIPOS_USO.map((value) => {
              const active = tipoUso === value
              return (
                <Pressable key={value} style={[styles.chip, active && styles.chipActive]} onPress={() => setTipoUso(value)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{value}</Text>
                </Pressable>
              )
            })}
          </View>

          <SectionTitle>Estado</SectionTitle>
          <View style={styles.chipRow}>
            {ESTADOS.map((item) => {
              const active = estado === item.value
              return (
                <Pressable
                  key={item.value}
                  style={[styles.chip, active && { backgroundColor: `${item.color}22`, borderColor: item.color }]}
                  onPress={() => setEstado(item.value)}
                >
                  <View style={[styles.stateDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                  {active && <Check size={13} color={item.color} strokeWidth={3} />}
                </Pressable>
              )
            })}
          </View>

          <SectionTitle>Superficie (ha)</SectionTitle>
          <View style={styles.inputWrap}>
            <TextInput value={superficieHa} onChangeText={setSuperficieHa} style={styles.input} keyboardType="decimal-pad" placeholder="150.50" placeholderTextColor="#6F7D9A" />
          </View>

          <SectionTitle>Capacidad de animales</SectionTitle>
          <View style={styles.inputWrap}>
            <TextInput value={capacidadAnimales} onChangeText={setCapacidadAnimales} style={styles.input} keyboardType="number-pad" placeholder="80" placeholderTextColor="#6F7D9A" />
          </View>

          <SectionTitle>Recurso forrajero</SectionTitle>
          <View style={styles.inputWrap}>
            <Leaf size={18} color="#9FE870" strokeWidth={2} />
            <TextInput value={recursoForrajero} onChangeText={setRecursoForrajero} style={styles.input} placeholder="Pastura consociada" placeholderTextColor="#6F7D9A" />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Droplets size={18} color="#6EA8FF" strokeWidth={2} />
              <Text style={styles.switchText}>Disponibilidad de agua</Text>
            </View>
            <Switch
              value={disponibilidadAgua}
              onValueChange={setDisponibilidadAgua}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(159,232,112,0.34)' }}
              thumbColor={disponibilidadAgua ? '#9FE870' : '#A6B0CF'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <TreeDeciduous size={18} color="#9FE870" strokeWidth={2} />
              <Text style={styles.switchText}>Tiene sombra</Text>
            </View>
            <Switch
              value={tieneSombra}
              onValueChange={setTieneSombra}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(159,232,112,0.34)' }}
              thumbColor={tieneSombra ? '#9FE870' : '#A6B0CF'}
            />
          </View>

          <SectionTitle>Descripción (opcional)</SectionTitle>
          <View style={styles.inputWrap}>
            <TextInput value={descripcion} onChangeText={setDescripcion} style={styles.input} placeholder="Descripción breve" placeholderTextColor="#6F7D9A" />
          </View>

          <SectionTitle>Observaciones (opcional)</SectionTitle>
          <View style={styles.textAreaWrap}>
            <PencilLine size={20} color="#6EA8FF" strokeWidth={1.9} />
            <TextInput
              value={observaciones}
              onChangeText={setObservaciones}
              style={styles.textArea}
              placeholder="Observaciones del potrero..."
              placeholderTextColor="#6F7D9A"
              multiline
              textAlignVertical="top"
            />
          </View>

          <SectionTitle>Centroide (latitud / longitud)</SectionTitle>
          <View style={styles.formGrid}>
            <View style={[styles.inputWrap, styles.inputHalf]}>
              <TextInput value={centroideLatitud} onChangeText={setCentroideLatitud} style={styles.input} keyboardType="decimal-pad" placeholder="-36.19" placeholderTextColor="#6F7D9A" />
            </View>
            <View style={[styles.inputWrap, styles.inputHalf]}>
              <TextInput value={centroideLongitud} onChangeText={setCentroideLongitud} style={styles.input} keyboardType="decimal-pad" placeholder="-60.67" placeholderTextColor="#6F7D9A" />
            </View>
          </View>

          <SectionTitle>Polígono GeoJSON</SectionTitle>
          <View style={styles.textAreaWrap}>
            <TextInput
              value={poligono}
              onChangeText={setPoligono}
              style={styles.textArea}
              placeholder='{"type":"Polygon","coordinates":[...]}'
              placeholderTextColor="#6F7D9A"
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable style={[styles.submitButton, saving && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={saving}>
            <View style={styles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={styles.submitText}>{saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear potrero'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

function parseNumber(value: string): number | undefined {
  const parsed = Number(value.replace(',', '.').trim())
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseInteger(value: string): number | undefined {
  const parsed = parseInt(value.trim(), 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#081225' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  inputWrap: {
    height: 56, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '700', paddingVertical: 0 },
  formGrid: { flexDirection: 'row', gap: 10 },
  inputHalf: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    minHeight: 42, paddingHorizontal: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: { borderColor: '#9FE870', backgroundColor: 'rgba(159,232,112,0.12)' },
  chipText: { color: '#DCE8F8', fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  stateDot: { width: 8, height: 8, borderRadius: 4 },
  switchRow: {
    minHeight: 56, borderRadius: 18, paddingHorizontal: 14, marginTop: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  switchLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchText: { color: '#DCE8F8', fontSize: 13, fontWeight: '800' },
  textAreaWrap: {
    minHeight: 100, borderRadius: 20, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14,
    flexDirection: 'row', gap: 10, backgroundColor: '#081225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  textArea: { flex: 1, minHeight: 70, color: '#FFFFFF', fontSize: 14, lineHeight: 20, padding: 0 },
  submitButton: {
    height: 60, borderRadius: 22, marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 16, backgroundColor: '#9FE870', shadowColor: '#9FE870', shadowOpacity: 0.42, shadowRadius: 22, shadowOffset: { width: 0, height: 12 },
  },
  submitButtonDisabled: { opacity: 0.62 },
  submitIcon: { position: 'absolute', left: 16, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,18,37,0.08)' },
  submitText: { color: '#081225', fontSize: 16, fontWeight: '900' },
})
