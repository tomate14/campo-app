import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Pill, Plus, ShieldPlus, Stethoscope, Syringe, type LucideIcon } from 'lucide-react-native'
import { useAnimales } from '../../shared/hooks/useAnimales'
import { useOperarios } from '../../shared/hooks/useOperarios'
import { useCreateAplicacion, useCreateDiagnostico, useCreateTratamiento, useCreateVacuna, useVacunas } from '../../shared/hooks/useSanidad'
import {
  AnimalSelect,
  DateField,
  DatePickerSheet,
  OptionChips,
  PersonSelect,
  SectionTitle,
  SelectableCard,
  TextAreaField,
  TextField,
  VacunaSelect,
  formKitStyles,
  parseNumber,
} from '../../shared/components/ganaderia-form-kit'

type SanidadTipo = 'VACUNA' | 'APLICACION' | 'TRATAMIENTO' | 'DIAGNOSTICO'
type DatePickerTarget = 'fecha' | 'proximaDosisFecha' | 'fechaFin'

const SANIDAD_TYPES: Array<{ value: SanidadTipo; title: string; description: string; Icon: LucideIcon; color: string }> = [
  { value: 'VACUNA', title: 'Nueva vacuna', description: 'Catálogo de vacunas', Icon: ShieldPlus, color: '#9FE870' },
  { value: 'APLICACION', title: 'Aplicación', description: 'Aplicar vacuna', Icon: Syringe, color: '#6EA8FF' },
  { value: 'TRATAMIENTO', title: 'Tratamiento', description: 'Medicamento', Icon: Pill, color: '#FFB84D' },
  { value: 'DIAGNOSTICO', title: 'Diagnóstico', description: 'Diagnóstico sanitario', Icon: Stethoscope, color: '#9A7DFF' },
]

const OBLIGATORIA_OPTIONS = [
  { value: 'true', label: 'Sí' },
  { value: 'false', label: 'No' },
]

const SEVERIDADES = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Crítica' },
]

const ESTADOS_DIAGNOSTICO = [
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'CONTROLADO', label: 'Controlado' },
  { value: 'CERRADO', label: 'Cerrado' },
]

export default function NuevaSanidadScreen() {
  const router = useRouter()
  const { data: animales = [], isLoading: loadingAnimales } = useAnimales()
  const { data: operarios = [] } = useOperarios({ estado: 'ACTIVO' })
  const { data: veterinarios = [] } = useOperarios({ estado: 'ACTIVO', rol: 'VETERINARIO' })
  const { data: vacunas = [], isLoading: loadingVacunas } = useVacunas()

  const createVacuna = useCreateVacuna()
  const createAplicacion = useCreateAplicacion()
  const createTratamiento = useCreateTratamiento()
  const createDiagnostico = useCreateDiagnostico()
  const saving = createVacuna.isPending || createAplicacion.isPending || createTratamiento.isPending || createDiagnostico.isPending

  const [tipo, setTipo] = useState<SanidadTipo>('VACUNA')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [datePickerTarget, setDatePickerTarget] = useState<DatePickerTarget | null>(null)
  const [observaciones, setObservaciones] = useState('')

  const [codigo, setCodigo] = useState('')
  const [nombreVacuna, setNombreVacuna] = useState('')
  const [laboratorio, setLaboratorio] = useState('')
  const [dosisRecomendada, setDosisRecomendada] = useState('')
  const [frecuenciaDias, setFrecuenciaDias] = useState('')
  const [costoReferencia, setCostoReferencia] = useState('')
  const [stockDisponible, setStockDisponible] = useState('')
  const [viaAplicacionVacuna, setViaAplicacionVacuna] = useState('')
  const [obligatoria, setObligatoria] = useState('true')
  const [descripcionVacuna, setDescripcionVacuna] = useState('')

  const [animalId, setAnimalId] = useState('')
  const [vacunaId, setVacunaId] = useState('')
  const [proximaDosisFecha, setProximaDosisFecha] = useState('')
  const [operarioId, setOperarioId] = useState('')
  const [loteMarca, setLoteMarca] = useState('')
  const [costoAplicado, setCostoAplicado] = useState('')

  const [medicamento, setMedicamento] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [dosis, setDosis] = useState('')
  const [viaAplicacionTratamiento, setViaAplicacionTratamiento] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [costoTratamiento, setCostoTratamiento] = useState('')
  const [motivo, setMotivo] = useState('')

  const [enfermedad, setEnfermedad] = useState('')
  const [severidad, setSeveridad] = useState('MEDIA')
  const [estadoDiagnostico, setEstadoDiagnostico] = useState('ABIERTO')
  const [veterinarioId, setVeterinarioId] = useState('')
  const [tratamientoIndicado, setTratamientoIndicado] = useState('')

  const datePickerValue = (() => {
    if (datePickerTarget === 'proximaDosisFecha') return proximaDosisFecha || fecha
    if (datePickerTarget === 'fechaFin') return fechaFin || fecha
    return fecha
  })()

  const handleDatePickerChange = (value: string) => {
    if (datePickerTarget === 'proximaDosisFecha') setProximaDosisFecha(value)
    else if (datePickerTarget === 'fechaFin') setFechaFin(value)
    else setFecha(value)
  }

  const handleSubmit = async () => {
    try {
      if (tipo === 'VACUNA') {
        if (!codigo.trim() || !nombreVacuna.trim()) {
          Alert.alert('Error', 'Ingresá el código y el nombre de la vacuna.')
          return
        }
        await createVacuna.mutateAsync({
          codigo: codigo.trim(),
          nombre: nombreVacuna.trim(),
          laboratorio: laboratorio.trim() || undefined,
          dosisRecomendada: dosisRecomendada.trim() || undefined,
          frecuenciaDias: parseNumber(frecuenciaDias),
          costoReferencia: parseNumber(costoReferencia),
          stockDisponible: parseNumber(stockDisponible),
          viaAplicacion: viaAplicacionVacuna.trim() || undefined,
          obligatoria: obligatoria === 'true',
          descripcion: descripcionVacuna.trim() || undefined,
        })
      } else if (tipo === 'APLICACION') {
        if (!animalId || !vacunaId) {
          Alert.alert('Error', 'Seleccioná el animal y la vacuna.')
          return
        }
        await createAplicacion.mutateAsync({
          animalId,
          vacunaId,
          fechaAplicacion: fecha,
          proximaDosisFecha: proximaDosisFecha || undefined,
          operario: operarioId || undefined,
          loteMarca: loteMarca.trim() || undefined,
          costoAplicado: parseNumber(costoAplicado),
          observaciones: observaciones.trim() || undefined,
        })
      } else if (tipo === 'TRATAMIENTO') {
        if (!animalId || !medicamento.trim()) {
          Alert.alert('Error', 'Seleccioná el animal e ingresá el medicamento.')
          return
        }
        await createTratamiento.mutateAsync({
          animalId,
          fechaInicio: fecha,
          fechaFin: fechaFin || undefined,
          medicamento: medicamento.trim(),
          dosis: dosis.trim() || undefined,
          viaAplicacion: viaAplicacionTratamiento.trim() || undefined,
          responsable: responsableId || undefined,
          motivo: motivo.trim() || undefined,
          costo: parseNumber(costoTratamiento),
          observaciones: observaciones.trim() || undefined,
        })
      } else {
        if (!animalId || !enfermedad.trim()) {
          Alert.alert('Error', 'Seleccioná el animal e ingresá la enfermedad.')
          return
        }
        await createDiagnostico.mutateAsync({
          animalId,
          fechaDiagnostico: fecha,
          enfermedad: enfermedad.trim(),
          severidad,
          estado: estadoDiagnostico,
          veterinario: veterinarioId || undefined,
          tratamientoIndicado: tratamientoIndicado.trim() || undefined,
          observaciones: observaciones.trim() || undefined,
        })
      }

      Alert.alert('Éxito', 'Registro sanitario guardado correctamente.', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo guardar el registro.')
    }
  }

  const loading = tipo === 'VACUNA' ? false : loadingAnimales

  return (
    <SafeAreaView style={formKitStyles.screen}>
      <View style={formKitStyles.header}>
        <Pressable style={formKitStyles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={formKitStyles.headerCopy}>
          <Text style={formKitStyles.title}>Agregar sanidad</Text>
          <Text style={formKitStyles.subtitle}>Registrar un nuevo evento sanitario</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={formKitStyles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={formKitStyles.card}>
          <SectionTitle>Tipo de registro</SectionTitle>
          <View style={formKitStyles.eventGrid}>
            {SANIDAD_TYPES.map((item) => (
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

          {loading ? (
            <View style={formKitStyles.loadingRow}>
              <ActivityIndicator color="#9FE870" />
              <Text style={formKitStyles.loadingText}>Cargando animales...</Text>
            </View>
          ) : (
            <>
              {tipo === 'VACUNA' && (
                <>
                  <SectionTitle>Código</SectionTitle>
                  <TextField value={codigo} onChangeText={setCodigo} placeholder="Ej: VAC-001" />
                  <SectionTitle>Nombre</SectionTitle>
                  <TextField value={nombreVacuna} onChangeText={setNombreVacuna} placeholder="Nombre de la vacuna" />
                  <SectionTitle>Laboratorio (opcional)</SectionTitle>
                  <TextField value={laboratorio} onChangeText={setLaboratorio} placeholder="Laboratorio" />
                  <SectionTitle>Dosis recomendada (opcional)</SectionTitle>
                  <TextField value={dosisRecomendada} onChangeText={setDosisRecomendada} placeholder="Ej: 5ml" />
                  <SectionTitle>Vía de aplicación (opcional)</SectionTitle>
                  <TextField value={viaAplicacionVacuna} onChangeText={setViaAplicacionVacuna} placeholder="Ej: Subcutánea" />
                  <SectionTitle>Frecuencia en días (opcional)</SectionTitle>
                  <TextField value={frecuenciaDias} onChangeText={setFrecuenciaDias} placeholder="0" keyboardType="numeric" />
                  <SectionTitle>Costo de referencia (opcional)</SectionTitle>
                  <TextField value={costoReferencia} onChangeText={setCostoReferencia} placeholder="0" keyboardType="decimal-pad" />
                  <SectionTitle>Stock disponible (opcional)</SectionTitle>
                  <TextField value={stockDisponible} onChangeText={setStockDisponible} placeholder="0" keyboardType="numeric" />
                  <SectionTitle>Obligatoria</SectionTitle>
                  <OptionChips options={OBLIGATORIA_OPTIONS} selected={obligatoria} onSelect={setObligatoria} />
                  <SectionTitle>Descripción (opcional)</SectionTitle>
                  <TextAreaField value={descripcionVacuna} onChangeText={setDescripcionVacuna} placeholder="Descripción de la vacuna..." />
                </>
              )}

              {tipo === 'APLICACION' && (
                <>
                  <AnimalSelect label="Animal" animales={animales} value={animalId} onChange={setAnimalId} placeholder="Buscar animal por caravana" />
                  {loadingVacunas ? (
                    <View style={formKitStyles.loadingRow}>
                      <ActivityIndicator color="#9FE870" />
                      <Text style={formKitStyles.loadingText}>Cargando vacunas...</Text>
                    </View>
                  ) : (
                    <VacunaSelect vacunas={vacunas} value={vacunaId} onChange={(id) => setVacunaId(id)} placeholder="Buscar vacuna del catálogo" />
                  )}
                  <DateField label="Próxima dosis (opcional)" value={proximaDosisFecha} onPress={() => setDatePickerTarget('proximaDosisFecha')} />
                  <PersonSelect label="Operario (opcional)" operarios={operarios} value={operarioId} onChange={setOperarioId} placeholder="Buscar operario" />
                  <SectionTitle>Lote / marca (opcional)</SectionTitle>
                  <TextField value={loteMarca} onChangeText={setLoteMarca} placeholder="Ej: L-2026-04" />
                  <SectionTitle>Costo aplicado (opcional)</SectionTitle>
                  <TextField value={costoAplicado} onChangeText={setCostoAplicado} placeholder="0" keyboardType="decimal-pad" />
                </>
              )}

              {tipo === 'TRATAMIENTO' && (
                <>
                  <AnimalSelect label="Animal" animales={animales} value={animalId} onChange={setAnimalId} placeholder="Buscar animal por caravana" />
                  <SectionTitle>Medicamento</SectionTitle>
                  <TextField value={medicamento} onChangeText={setMedicamento} placeholder="Nombre del medicamento" />
                  <DateField label="Fecha de fin (opcional)" value={fechaFin} onPress={() => setDatePickerTarget('fechaFin')} />
                  <SectionTitle>Dosis (opcional)</SectionTitle>
                  <TextField value={dosis} onChangeText={setDosis} placeholder="Ej: 10ml cada 12hs" />
                  <SectionTitle>Vía de aplicación (opcional)</SectionTitle>
                  <TextField value={viaAplicacionTratamiento} onChangeText={setViaAplicacionTratamiento} placeholder="Ej: Intramuscular" />
                  <PersonSelect label="Responsable (opcional)" operarios={operarios} value={responsableId} onChange={setResponsableId} placeholder="Buscar responsable" />
                  <SectionTitle>Motivo (opcional)</SectionTitle>
                  <TextField value={motivo} onChangeText={setMotivo} placeholder="Motivo del tratamiento" />
                  <SectionTitle>Costo (opcional)</SectionTitle>
                  <TextField value={costoTratamiento} onChangeText={setCostoTratamiento} placeholder="0" keyboardType="decimal-pad" />
                </>
              )}

              {tipo === 'DIAGNOSTICO' && (
                <>
                  <AnimalSelect label="Animal" animales={animales} value={animalId} onChange={setAnimalId} placeholder="Buscar animal por caravana" />
                  <SectionTitle>Enfermedad</SectionTitle>
                  <TextField value={enfermedad} onChangeText={setEnfermedad} placeholder="Enfermedad diagnosticada" />
                  <SectionTitle>Severidad</SectionTitle>
                  <OptionChips options={SEVERIDADES} selected={severidad} onSelect={setSeveridad} />
                  <SectionTitle>Estado</SectionTitle>
                  <OptionChips options={ESTADOS_DIAGNOSTICO} selected={estadoDiagnostico} onSelect={setEstadoDiagnostico} />
                  <PersonSelect label="Veterinario (opcional)" operarios={veterinarios} value={veterinarioId} onChange={setVeterinarioId} placeholder="Buscar veterinario" />
                  <SectionTitle>Tratamiento indicado (opcional)</SectionTitle>
                  <TextField value={tratamientoIndicado} onChangeText={setTratamientoIndicado} placeholder="Tratamiento indicado" />
                </>
              )}
            </>
          )}

          {tipo !== 'VACUNA' && (
            <>
              <DateField label="Fecha" value={fecha} onPress={() => setDatePickerTarget('fecha')} />
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
        visible={datePickerTarget !== null}
        value={datePickerValue}
        onChange={handleDatePickerChange}
        onClose={() => setDatePickerTarget(null)}
      />
    </SafeAreaView>
  )
}
