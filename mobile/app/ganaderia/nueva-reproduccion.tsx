import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Baby, Dna, Heart, Plus, Syringe, UserPlus, type LucideIcon } from 'lucide-react-native'
import { useAnimales, useCreateAnimal } from '../../shared/hooks/useAnimales'
import { useOperarios } from '../../shared/hooks/useOperarios'
import { usePotrerosList } from '../../shared/hooks/usePotreros'
import { useRazasBovinas } from '../../shared/hooks/useRazasBovinas'
import { useCreateControlPrenez, useCreateIndiceGenetico, useCreateInseminacion, useCreateMonta, useCreateParto } from '../../shared/hooks/useReproduccion'
import {
  AnimalSelect,
  DateField,
  DatePickerSheet,
  HEMBRA_TOKENS,
  MACHO_TOKENS,
  OptionChips,
  PersonSelect,
  PotreroSelect,
  RazaSelect,
  SectionTitle,
  SelectableCard,
  TextAreaField,
  TextField,
  formKitStyles,
  matchesSexo,
  parseNumber,
} from '../../shared/components/ganaderia-form-kit'

type ActividadTipo = 'MONTA' | 'INSEMINACION' | 'PRENEZ' | 'PARTO' | 'INDICE'
type DatePickerTarget = 'fecha' | 'fechaEstimadaParto' | 'nuevoAnimalFechaNacimiento' | 'nuevoAnimalFechaCompra'

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
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Masculino', label: 'Masculino' },
]

export default function NuevaReproduccionScreen() {
  const router = useRouter()
  const { data: animales = [], isLoading: loadingAnimales } = useAnimales()
  const { data: operarios = [] } = useOperarios({ estado: 'ACTIVO' })
  const { data: razas = [] } = useRazasBovinas()
  const { data: potrerosList = [] } = usePotrerosList()
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
  const [datePickerTarget, setDatePickerTarget] = useState<DatePickerTarget | null>(null)
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
  const [newAnimalRazaId, setNewAnimalRazaId] = useState('')
  const [newAnimalRazaNombre, setNewAnimalRazaNombre] = useState('')
  const [newAnimalSexo, setNewAnimalSexo] = useState('Femenino')
  const [newAnimalFechaNacimiento, setNewAnimalFechaNacimiento] = useState('')
  const [newAnimalFechaCompra, setNewAnimalFechaCompra] = useState('')
  const [newAnimalPeso, setNewAnimalPeso] = useState('')
  const [newAnimalRfid, setNewAnimalRfid] = useState('')
  const [newAnimalPotreroId, setNewAnimalPotreroId] = useState('')
  const [newAnimalMadreId, setNewAnimalMadreId] = useState('')
  const [newAnimalPadreId, setNewAnimalPadreId] = useState('')
  const [newAnimalObservaciones, setNewAnimalObservaciones] = useState('')

  const hembras = useMemo(() => animales.filter((animal) => matchesSexo(animal.sexo, HEMBRA_TOKENS)), [animales])
  const machos = useMemo(() => animales.filter((animal) => matchesSexo(animal.sexo, MACHO_TOKENS)), [animales])

  const resetNewAnimalForm = () => {
    setNewAnimalCaravana('')
    setNewAnimalRazaId('')
    setNewAnimalRazaNombre('')
    setNewAnimalSexo('Femenino')
    setNewAnimalFechaNacimiento('')
    setNewAnimalFechaCompra('')
    setNewAnimalPeso('')
    setNewAnimalRfid('')
    setNewAnimalPotreroId('')
    setNewAnimalMadreId('')
    setNewAnimalPadreId('')
    setNewAnimalObservaciones('')
  }

  const handleCreateTernero = async () => {
    if (!newAnimalCaravana.trim()) {
      Alert.alert('Error', 'Ingresá la caravana del animal.')
      return
    }
    try {
      const created = await createAnimal.mutateAsync({
        caravana: newAnimalCaravana.trim(),
        razaId: newAnimalRazaId || undefined,
        raza: newAnimalRazaNombre || undefined,
        sexo: newAnimalSexo,
        fechaNacimiento: newAnimalFechaNacimiento || undefined,
        fechaCompra: newAnimalFechaCompra || undefined,
        pesoActualKg: parseNumber(newAnimalPeso),
        rfidCodigo: newAnimalRfid.trim() || undefined,
        potreroId: newAnimalPotreroId || undefined,
        madreId: newAnimalMadreId || undefined,
        padreId: newAnimalPadreId || undefined,
        observaciones: newAnimalObservaciones.trim() || undefined,
      })
      setTerneroId(created.id)
      setAddingTernero(false)
      resetNewAnimalForm()
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

  const datePickerValue = (() => {
    if (datePickerTarget === 'fechaEstimadaParto') return fechaEstimadaParto || fecha
    if (datePickerTarget === 'nuevoAnimalFechaNacimiento') return newAnimalFechaNacimiento || fecha
    if (datePickerTarget === 'nuevoAnimalFechaCompra') return newAnimalFechaCompra || fecha
    return fecha
  })()

  const handleDatePickerChange = (value: string) => {
    if (datePickerTarget === 'fechaEstimadaParto') setFechaEstimadaParto(value)
    else if (datePickerTarget === 'nuevoAnimalFechaNacimiento') setNewAnimalFechaNacimiento(value)
    else if (datePickerTarget === 'nuevoAnimalFechaCompra') setNewAnimalFechaCompra(value)
    else setFecha(value)
  }

  return (
    <SafeAreaView style={formKitStyles.screen}>
      <View style={formKitStyles.header}>
        <Pressable style={formKitStyles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={formKitStyles.headerCopy}>
          <Text style={formKitStyles.title}>Agregar reproducción</Text>
          <Text style={formKitStyles.subtitle}>Registrar un nuevo evento reproductivo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={formKitStyles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={formKitStyles.card}>
          <SectionTitle>Tipo de actividad</SectionTitle>
          <View style={formKitStyles.eventGrid}>
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
            <View style={formKitStyles.loadingRow}>
              <ActivityIndicator color="#9FE870" />
              <Text style={formKitStyles.loadingText}>Cargando animales...</Text>
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
                  <DateField label="Parto estimado (opcional)" value={fechaEstimadaParto} onPress={() => setDatePickerTarget('fechaEstimadaParto')} />
                  <SectionTitle>Nivel de riesgo del parto</SectionTitle>
                  <OptionChips options={NIVELES_RIESGO} selected={nivelRiesgoParto} onSelect={setNivelRiesgoParto} />
                  <PersonSelect label="Veterinario (opcional)" operarios={operarios} value={veterinarioId} onChange={setVeterinarioId} placeholder="Buscar veterinario" />
                </>
              )}

              {tipo === 'PARTO' && (
                <>
                  <AnimalSelect label="Madre" animales={hembras} value={madreId} onChange={setMadreId} placeholder="Buscar madre por caravana" />

                  <AnimalSelect label="Ternero (opcional)" animales={animales} value={terneroId} onChange={setTerneroId} placeholder="Buscar ternero por caravana" />
                  <Pressable style={formKitStyles.addAnimalButton} onPress={() => setAddingTernero((current) => !current)}>
                    <UserPlus size={16} color="#9FE870" strokeWidth={2.2} />
                    <Text style={formKitStyles.addAnimalText}>{addingTernero ? 'Cancelar' : 'Registrar nuevo animal'}</Text>
                  </Pressable>

                  {addingTernero && (
                    <View style={formKitStyles.newAnimalBox}>
                      <Text style={formKitStyles.newAnimalTitle}>Alta de animal</Text>

                      <SectionTitle>Caravana</SectionTitle>
                      <TextField value={newAnimalCaravana} onChangeText={setNewAnimalCaravana} placeholder="Caravana" />

                      <RazaSelect razas={razas} value={newAnimalRazaId} onChange={(id, nombre) => { setNewAnimalRazaId(id); setNewAnimalRazaNombre(nombre) }} placeholder="Buscar raza bovina" />

                      <SectionTitle>Sexo</SectionTitle>
                      <OptionChips options={SEXOS_ANIMAL} selected={newAnimalSexo} onSelect={setNewAnimalSexo} />

                      <DateField label="Fecha de nacimiento (opcional)" value={newAnimalFechaNacimiento} onPress={() => setDatePickerTarget('nuevoAnimalFechaNacimiento')} />
                      <DateField label="Fecha de compra (opcional)" value={newAnimalFechaCompra} onPress={() => setDatePickerTarget('nuevoAnimalFechaCompra')} />

                      <SectionTitle>Peso actual kg (opcional)</SectionTitle>
                      <TextField value={newAnimalPeso} onChangeText={setNewAnimalPeso} placeholder="0" keyboardType="decimal-pad" />

                      <SectionTitle>RFID (opcional)</SectionTitle>
                      <TextField value={newAnimalRfid} onChangeText={setNewAnimalRfid} placeholder="Código RFID" />

                      <PotreroSelect potreros={potrerosList} value={newAnimalPotreroId} onChange={setNewAnimalPotreroId} placeholder="Buscar potrero" />

                      <AnimalSelect label="Madre (opcional)" animales={hembras} value={newAnimalMadreId} onChange={setNewAnimalMadreId} placeholder="Buscar madre por caravana" hideWhenEmpty />

                      <AnimalSelect label="Padre (opcional)" animales={machos} value={newAnimalPadreId} onChange={setNewAnimalPadreId} placeholder="Buscar padre por caravana" hideWhenEmpty />

                      <SectionTitle>Observaciones (opcional)</SectionTitle>
                      <TextAreaField value={newAnimalObservaciones} onChangeText={setNewAnimalObservaciones} placeholder="Observaciones del animal..." />

                      <Pressable style={[formKitStyles.saveAnimalButton, createAnimal.isPending && formKitStyles.submitButtonDisabled]} onPress={handleCreateTernero} disabled={createAnimal.isPending}>
                        <Text style={formKitStyles.saveAnimalText}>{createAnimal.isPending ? 'Guardando...' : 'Guardar animal'}</Text>
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

          <DateField label="Fecha" value={fecha} onPress={() => setDatePickerTarget('fecha')} />

          <SectionTitle>Observaciones (opcional)</SectionTitle>
          <TextAreaField value={observaciones} onChangeText={setObservaciones} placeholder="Observaciones del evento..." />

          <Pressable style={[formKitStyles.submitButton, saving && formKitStyles.submitButtonDisabled]} onPress={handleSubmit} disabled={saving}>
            <View style={formKitStyles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={formKitStyles.submitText}>{saving ? 'Guardando...' : 'Registrar actividad'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DatePickerSheet
        visible={datePickerTarget !== null}
        value={datePickerValue}
        onChange={handleDatePickerChange}
        onClose={() => setDatePickerTarget(null)}
      />
    </SafeAreaView>
  )
}
