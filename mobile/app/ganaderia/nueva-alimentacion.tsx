import { useRef, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Plus, Scale, Trash2, Utensils, Wheat, type LucideIcon } from 'lucide-react-native'
import { useAnimales } from '../../shared/hooks/useAnimales'
import { useOperarios } from '../../shared/hooks/useOperarios'
import { usePotrerosList } from '../../shared/hooks/usePotreros'
import { useCreateDieta, useCreatePesaje, useCreateRegistroAlimentacion, useDietas } from '../../shared/hooks/useAlimentacion'
import {
  AnimalSelect,
  DateField,
  DatePickerSheet,
  PersonSelect,
  PotreroSelect,
  SectionTitle,
  SelectableCard,
  StaticCatalogSelect,
  TextAreaField,
  TextField,
  formKitStyles,
  parseNumber,
  type CatalogOption,
} from '../../shared/components/ganaderia-form-kit'
import type { DietaIngredienteRequest } from '../../shared/types/ganaderia'

type AlimentacionTipo = 'DIETA' | 'SUMINISTRO' | 'PESAJE'

const ALIMENTACION_TYPES: Array<{ value: AlimentacionTipo; title: string; description: string; Icon: LucideIcon; color: string }> = [
  { value: 'DIETA', title: 'Nueva dieta', description: 'Definir dieta', Icon: Utensils, color: '#9FE870' },
  { value: 'SUMINISTRO', title: 'Suministro', description: 'Registrar suministro', Icon: Wheat, color: '#FFB84D' },
  { value: 'PESAJE', title: 'Pesaje', description: 'Registrar pesaje', Icon: Scale, color: '#6EA8FF' },
]

const ALIMENTO_OPTIONS: CatalogOption[] = [
  { value: 'Maiz partido', label: 'Maíz partido', subtitle: 'Energético' },
  { value: 'Silo de maiz', label: 'Silo de maíz', subtitle: 'Voluminoso' },
  { value: 'Heno de alfalfa', label: 'Heno de alfalfa', subtitle: 'Fibra/proteína' },
  { value: 'Expeller de soja', label: 'Expeller de soja', subtitle: 'Proteico' },
  { value: 'Nucleo mineral', label: 'Núcleo mineral', subtitle: 'Mineral' },
  { value: 'Sales minerales', label: 'Sales minerales', subtitle: 'Mineral' },
]

const METODO_PESAJE_OPTIONS: CatalogOption[] = [
  { value: 'Balanza electronica', label: 'Balanza electrónica' },
  { value: 'Balanza mecanica', label: 'Balanza mecánica' },
  { value: 'Cinta bovinometrica', label: 'Cinta bovinométrica' },
  { value: 'Estimacion visual', label: 'Estimación visual' },
]

type IngredienteRow = { rowId: string; ingrediente: string; proporcionPct: string; costoKg: string }

export default function NuevaAlimentacionScreen() {
  const router = useRouter()
  const { data: animales = [], isLoading: loadingAnimales } = useAnimales()
  const { data: operarios = [] } = useOperarios({ estado: 'ACTIVO' })
  const { data: potrerosList = [] } = usePotrerosList()
  const { data: dietas = [] } = useDietas()

  const createDieta = useCreateDieta()
  const createRegistro = useCreateRegistroAlimentacion()
  const createPesaje = useCreatePesaje()
  const saving = createDieta.isPending || createRegistro.isPending || createPesaje.isPending

  const [tipo, setTipo] = useState<AlimentacionTipo>('DIETA')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [observaciones, setObservaciones] = useState('')

  const [nombreDieta, setNombreDieta] = useState('')
  const [tipoAnimal, setTipoAnimal] = useState('BOVINO ENGORDE')
  const [materiaSecaKg, setMateriaSecaKg] = useState('')
  const [costoDiario, setCostoDiario] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const rowCounter = useRef(0)
  const [ingredientes, setIngredientes] = useState<IngredienteRow[]>([{ rowId: 'row-0', ingrediente: '', proporcionPct: '100', costoKg: '' }])

  const [animalId, setAnimalId] = useState('')
  const [dietaId, setDietaId] = useState('')
  const [alimento, setAlimento] = useState('')
  const [cantidadKg, setCantidadKg] = useState('')
  const [costoTotal, setCostoTotal] = useState('')
  const [potreroId, setPotreroId] = useState('')
  const [responsableId, setResponsableId] = useState('')

  const [pesajeAnimalId, setPesajeAnimalId] = useState('')
  const [pesoKg, setPesoKg] = useState('')
  const [condicionCorporal, setCondicionCorporal] = useState('')
  const [metodo, setMetodo] = useState('')
  const [pesajeResponsableId, setPesajeResponsableId] = useState('')

  const dietaOptions: CatalogOption[] = dietas.map((dieta) => ({ value: dieta.id, label: dieta.nombre }))

  const addIngredienteRow = () => {
    rowCounter.current += 1
    setIngredientes((current) => [...current, { rowId: `row-${rowCounter.current}`, ingrediente: '', proporcionPct: '', costoKg: '' }])
  }

  const removeIngredienteRow = (rowId: string) => {
    setIngredientes((current) => current.filter((row) => row.rowId !== rowId))
  }

  const updateIngredienteRow = (rowId: string, patch: Partial<IngredienteRow>) => {
    setIngredientes((current) => current.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)))
  }

  const handleSubmit = async () => {
    try {
      if (tipo === 'DIETA') {
        if (!nombreDieta.trim() || !tipoAnimal.trim()) {
          Alert.alert('Error', 'Ingresá el nombre y el tipo de animal de la dieta.')
          return
        }
        const ingredientesValidos: DietaIngredienteRequest[] = ingredientes
          .filter((row) => row.ingrediente.trim())
          .map((row) => ({
            ingrediente: row.ingrediente.trim(),
            proporcionPct: parseNumber(row.proporcionPct) ?? 0,
            costoKg: parseNumber(row.costoKg),
          }))
        await createDieta.mutateAsync({
          nombre: nombreDieta.trim(),
          tipoAnimal: tipoAnimal.trim(),
          objetivo: objetivo.trim() || undefined,
          materiaSecaKg: parseNumber(materiaSecaKg),
          costoDiario: parseNumber(costoDiario),
          ingredientes: ingredientesValidos.length ? ingredientesValidos : undefined,
        })
      } else if (tipo === 'SUMINISTRO') {
        if (!alimento.trim() || !cantidadKg.trim()) {
          Alert.alert('Error', 'Seleccioná el alimento e ingresá la cantidad.')
          return
        }
        await createRegistro.mutateAsync({
          animalId: animalId || undefined,
          dietaId: dietaId || undefined,
          fecha,
          alimento: alimento.trim(),
          cantidadKg: parseNumber(cantidadKg) ?? 0,
          costoTotal: parseNumber(costoTotal),
          potreroId: potreroId || undefined,
          responsable: responsableId || undefined,
          observaciones: observaciones.trim() || undefined,
        })
      } else {
        if (!pesajeAnimalId || !pesoKg.trim()) {
          Alert.alert('Error', 'Seleccioná el animal e ingresá el peso.')
          return
        }
        await createPesaje.mutateAsync({
          animalId: pesajeAnimalId,
          fecha,
          pesoKg: parseNumber(pesoKg) ?? 0,
          condicionCorporal: parseNumber(condicionCorporal),
          metodo: metodo || undefined,
          responsable: pesajeResponsableId || undefined,
          observaciones: observaciones.trim() || undefined,
        })
      }

      Alert.alert('Éxito', 'Registro de alimentación guardado correctamente.', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo guardar el registro.')
    }
  }

  return (
    <SafeAreaView style={formKitStyles.screen}>
      <View style={formKitStyles.header}>
        <Pressable style={formKitStyles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={formKitStyles.headerCopy}>
          <Text style={formKitStyles.title}>Agregar alimentación</Text>
          <Text style={formKitStyles.subtitle}>Registrar un nuevo evento de alimentación</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={formKitStyles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={formKitStyles.card}>
          <SectionTitle>Tipo de registro</SectionTitle>
          <View style={formKitStyles.eventGrid}>
            {ALIMENTACION_TYPES.map((item) => (
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

          {tipo === 'DIETA' && (
            <>
              <SectionTitle>Nombre</SectionTitle>
              <TextField value={nombreDieta} onChangeText={setNombreDieta} placeholder="Nombre de la dieta" />
              <SectionTitle>Tipo de animal</SectionTitle>
              <TextField value={tipoAnimal} onChangeText={setTipoAnimal} placeholder="Ej: BOVINO ENGORDE" />
              <SectionTitle>Materia seca kg (opcional)</SectionTitle>
              <TextField value={materiaSecaKg} onChangeText={setMateriaSecaKg} placeholder="0" keyboardType="decimal-pad" />
              <SectionTitle>Costo diario (opcional)</SectionTitle>
              <TextField value={costoDiario} onChangeText={setCostoDiario} placeholder="0" keyboardType="decimal-pad" />
              <SectionTitle>Objetivo (opcional)</SectionTitle>
              <TextAreaField value={objetivo} onChangeText={setObjetivo} placeholder="Objetivo de la dieta..." />

              <SectionTitle>Ingredientes</SectionTitle>
              {ingredientes.map((row, index) => (
                <View key={row.rowId} style={localStyles.ingredienteRow}>
                  <View style={localStyles.ingredienteHeader}>
                    <Text style={localStyles.ingredienteIndex}>Ingrediente {index + 1}</Text>
                    {ingredientes.length > 1 && (
                      <Pressable onPress={() => removeIngredienteRow(row.rowId)} style={localStyles.removeRowButton}>
                        <Trash2 size={15} color="#FF8A8A" strokeWidth={2} />
                      </Pressable>
                    )}
                  </View>
                  <StaticCatalogSelect
                    label="Alimento"
                    options={ALIMENTO_OPTIONS}
                    value={row.ingrediente}
                    onChange={(value) => updateIngredienteRow(row.rowId, { ingrediente: value })}
                    placeholder="Buscar alimento"
                  />
                  <View style={localStyles.ingredienteNumbers}>
                    <View style={localStyles.ingredienteNumberField}>
                      <SectionTitle>Proporción %</SectionTitle>
                      <TextField value={row.proporcionPct} onChangeText={(value) => updateIngredienteRow(row.rowId, { proporcionPct: value })} placeholder="0" keyboardType="decimal-pad" />
                    </View>
                    <View style={localStyles.ingredienteNumberField}>
                      <SectionTitle>Costo/kg (opcional)</SectionTitle>
                      <TextField value={row.costoKg} onChangeText={(value) => updateIngredienteRow(row.rowId, { costoKg: value })} placeholder="0" keyboardType="decimal-pad" />
                    </View>
                  </View>
                </View>
              ))}
              <Pressable style={formKitStyles.addAnimalButton} onPress={addIngredienteRow}>
                <Plus size={16} color="#9FE870" strokeWidth={2.2} />
                <Text style={formKitStyles.addAnimalText}>Agregar ingrediente</Text>
              </Pressable>
            </>
          )}

          {tipo === 'SUMINISTRO' && (
            <>
              {loadingAnimales ? (
                <View style={formKitStyles.loadingRow}>
                  <ActivityIndicator color="#9FE870" />
                  <Text style={formKitStyles.loadingText}>Cargando animales...</Text>
                </View>
              ) : (
                <AnimalSelect label="Animal (opcional)" animales={animales} value={animalId} onChange={setAnimalId} placeholder="Buscar animal por caravana" />
              )}
              <StaticCatalogSelect label="Dieta (opcional)" options={dietaOptions} value={dietaId} onChange={(value) => setDietaId(value)} placeholder="Buscar dieta" />
              <StaticCatalogSelect label="Alimento" options={ALIMENTO_OPTIONS} value={alimento} onChange={(value) => setAlimento(value)} placeholder="Buscar alimento" />
              <SectionTitle>Cantidad kg</SectionTitle>
              <TextField value={cantidadKg} onChangeText={setCantidadKg} placeholder="0" keyboardType="decimal-pad" />
              <SectionTitle>Costo total (opcional)</SectionTitle>
              <TextField value={costoTotal} onChangeText={setCostoTotal} placeholder="0" keyboardType="decimal-pad" />
              <PotreroSelect potreros={potrerosList} value={potreroId} onChange={setPotreroId} placeholder="Buscar potrero" label="Potrero (opcional)" />
              <PersonSelect label="Responsable (opcional)" operarios={operarios} value={responsableId} onChange={setResponsableId} placeholder="Buscar responsable" />
            </>
          )}

          {tipo === 'PESAJE' && (
            <>
              {loadingAnimales ? (
                <View style={formKitStyles.loadingRow}>
                  <ActivityIndicator color="#9FE870" />
                  <Text style={formKitStyles.loadingText}>Cargando animales...</Text>
                </View>
              ) : (
                <AnimalSelect label="Animal" animales={animales} value={pesajeAnimalId} onChange={setPesajeAnimalId} placeholder="Buscar animal por caravana" />
              )}
              <SectionTitle>Peso kg</SectionTitle>
              <TextField value={pesoKg} onChangeText={setPesoKg} placeholder="0" keyboardType="decimal-pad" />
              <SectionTitle>Condición corporal 1-5 (opcional)</SectionTitle>
              <TextField value={condicionCorporal} onChangeText={setCondicionCorporal} placeholder="Ej: 3.5" keyboardType="decimal-pad" />
              <StaticCatalogSelect label="Método (opcional)" options={METODO_PESAJE_OPTIONS} value={metodo} onChange={(value) => setMetodo(value)} placeholder="Buscar método de pesaje" Icon={Scale} />
              <PersonSelect label="Responsable (opcional)" operarios={operarios} value={pesajeResponsableId} onChange={setPesajeResponsableId} placeholder="Buscar responsable" />
            </>
          )}

          <DateField label="Fecha" value={fecha} onPress={() => setDatePickerOpen(true)} />

          {tipo !== 'DIETA' && (
            <>
              <SectionTitle>Observaciones (opcional)</SectionTitle>
              <TextAreaField value={observaciones} onChangeText={setObservaciones} placeholder="Observaciones del registro..." />
            </>
          )}

          <Pressable style={[formKitStyles.submitButton, saving && formKitStyles.submitButtonDisabled]} onPress={handleSubmit} disabled={saving}>
            <View style={formKitStyles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={formKitStyles.submitText}>{saving ? 'Guardando...' : 'Registrar'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DatePickerSheet
        visible={datePickerOpen}
        value={fecha}
        onChange={setFecha}
        onClose={() => setDatePickerOpen(false)}
      />
    </SafeAreaView>
  )
}

const localStyles = StyleSheet.create({
  ingredienteRow: {
    marginTop: 12, padding: 14, borderRadius: 18,
    backgroundColor: 'rgba(8,18,37,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  ingredienteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ingredienteIndex: { color: '#DCE8F8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  removeRowButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,138,138,0.12)' },
  ingredienteNumbers: { flexDirection: 'row', gap: 10 },
  ingredienteNumberField: { flex: 1 },
})
