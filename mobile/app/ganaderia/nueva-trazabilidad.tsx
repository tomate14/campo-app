import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Plus } from 'lucide-react-native'
import { useAnimales, useCreateAnimal } from '../../shared/hooks/useAnimales'
import { usePotrerosList } from '../../shared/hooks/usePotreros'
import { useRazasBovinas } from '../../shared/hooks/useRazasBovinas'
import {
  AnimalSelect,
  DateField,
  DatePickerSheet,
  HEMBRA_TOKENS,
  MACHO_TOKENS,
  OptionChips,
  PotreroSelect,
  RazaSelect,
  SectionTitle,
  TextAreaField,
  TextField,
  formKitStyles,
  matchesSexo,
  parseNumber,
} from '../../shared/components/ganaderia-form-kit'

type DatePickerTarget = 'fechaNacimiento' | 'fechaCompra'

const SEXOS_ANIMAL = [
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Masculino', label: 'Masculino' },
]

export default function NuevaTrazabilidadScreen() {
  const router = useRouter()
  const { data: animales = [] } = useAnimales()
  const { data: razas = [] } = useRazasBovinas()
  const { data: potrerosList = [] } = usePotrerosList()
  const createAnimal = useCreateAnimal()

  const [caravana, setCaravana] = useState('')
  const [razaId, setRazaId] = useState('')
  const [razaNombre, setRazaNombre] = useState('')
  const [sexo, setSexo] = useState('Femenino')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [fechaCompra, setFechaCompra] = useState('')
  const [peso, setPeso] = useState('')
  const [rfid, setRfid] = useState('')
  const [potreroId, setPotreroId] = useState('')
  const [madreId, setMadreId] = useState('')
  const [padreId, setPadreId] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [datePickerTarget, setDatePickerTarget] = useState<DatePickerTarget | null>(null)

  const hembras = animales.filter((animal) => matchesSexo(animal.sexo, HEMBRA_TOKENS))
  const machos = animales.filter((animal) => matchesSexo(animal.sexo, MACHO_TOKENS))

  const datePickerValue = datePickerTarget === 'fechaCompra' ? fechaCompra : fechaNacimiento
  const handleDatePickerChange = (value: string) => {
    if (datePickerTarget === 'fechaCompra') setFechaCompra(value)
    else setFechaNacimiento(value)
  }

  const handleSubmit = async () => {
    if (!caravana.trim()) {
      Alert.alert('Error', 'Ingresá la caravana del animal.')
      return
    }
    try {
      await createAnimal.mutateAsync({
        caravana: caravana.trim(),
        razaId: razaId || undefined,
        raza: razaNombre || undefined,
        sexo,
        fechaNacimiento: fechaNacimiento || undefined,
        fechaCompra: fechaCompra || undefined,
        pesoActualKg: parseNumber(peso),
        rfidCodigo: rfid.trim() || undefined,
        potreroId: potreroId || undefined,
        madreId: madreId || undefined,
        padreId: padreId || undefined,
        observaciones: observaciones.trim() || undefined,
      })
      Alert.alert('Éxito', 'Animal registrado correctamente.', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo registrar el animal.')
    }
  }

  return (
    <SafeAreaView style={formKitStyles.screen}>
      <View style={formKitStyles.header}>
        <Pressable style={formKitStyles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={formKitStyles.headerCopy}>
          <Text style={formKitStyles.title}>Agregar trazabilidad</Text>
          <Text style={formKitStyles.subtitle}>Registrar un nuevo animal</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={formKitStyles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={formKitStyles.card}>
          <SectionTitle>Caravana</SectionTitle>
          <TextField value={caravana} onChangeText={setCaravana} placeholder="Caravana" />

          <RazaSelect razas={razas} value={razaId} onChange={(id, nombre) => { setRazaId(id); setRazaNombre(nombre) }} placeholder="Buscar raza bovina" />

          <SectionTitle>Sexo</SectionTitle>
          <OptionChips options={SEXOS_ANIMAL} selected={sexo} onSelect={setSexo} />

          <DateField label="Fecha de nacimiento (opcional)" value={fechaNacimiento} onPress={() => setDatePickerTarget('fechaNacimiento')} />
          <DateField label="Fecha de compra (opcional)" value={fechaCompra} onPress={() => setDatePickerTarget('fechaCompra')} />

          <SectionTitle>Peso actual kg (opcional)</SectionTitle>
          <TextField value={peso} onChangeText={setPeso} placeholder="0" keyboardType="decimal-pad" />

          <SectionTitle>RFID (opcional)</SectionTitle>
          <TextField value={rfid} onChangeText={setRfid} placeholder="Código RFID" />

          <PotreroSelect potreros={potrerosList} value={potreroId} onChange={setPotreroId} placeholder="Buscar potrero" />

          <AnimalSelect label="Madre (opcional)" animales={hembras} value={madreId} onChange={setMadreId} placeholder="Buscar madre por caravana" hideWhenEmpty />

          <AnimalSelect label="Padre (opcional)" animales={machos} value={padreId} onChange={setPadreId} placeholder="Buscar padre por caravana" hideWhenEmpty />

          <SectionTitle>Observaciones (opcional)</SectionTitle>
          <TextAreaField value={observaciones} onChangeText={setObservaciones} placeholder="Observaciones del animal..." />

          <Pressable style={[formKitStyles.submitButton, createAnimal.isPending && formKitStyles.submitButtonDisabled]} onPress={handleSubmit} disabled={createAnimal.isPending}>
            <View style={formKitStyles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={formKitStyles.submitText}>{createAnimal.isPending ? 'Guardando...' : 'Registrar animal'}</Text>
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
