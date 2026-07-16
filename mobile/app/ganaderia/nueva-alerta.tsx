import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { AlertTriangle, ArrowLeft, Bell, MapPin, Plus } from 'lucide-react-native'
import { usePotrerosList } from '../../shared/hooks/usePotreros'
import { useCreateAlertaPotrero } from '../../shared/hooks/usePotreroAlertas'
import {
  DateField,
  DatePickerSheet,
  OptionChips,
  PotreroSelect,
  SectionTitle,
  TextAreaField,
  formKitStyles,
} from '../../shared/components/ganaderia-form-kit'
import type { SeveridadPlaga } from '../../shared/types/agricola'

const GRAVEDADES: Array<{ value: SeveridadPlaga; label: string }> = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Crítica' },
]

export default function NuevaAlertaScreen() {
  const router = useRouter()
  const { data: potreros = [] } = usePotrerosList()
  const createAlerta = useCreateAlertaPotrero()

  const [potreroId, setPotreroId] = useState('')
  const [gravedad, setGravedad] = useState<SeveridadPlaga>('MEDIA')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [observacion, setObservacion] = useState('')
  const [coords, setCoords] = useState<{ latitud: number; longitud: number } | null>(null)

  // Mismo patron de captura GPS que agricola/plagas.tsx (feature 47).
  const captureLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert('Ubicación', 'No se otorgó permiso para usar la ubicación del dispositivo.')
        return
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setCoords({
        latitud: Number(current.coords.latitude.toFixed(7)),
        longitud: Number(current.coords.longitude.toFixed(7)),
      })
    } catch {
      Alert.alert('Ubicación', 'No se pudo obtener la ubicación del dispositivo.')
    }
  }

  const handleSubmit = async () => {
    if (!potreroId) {
      Alert.alert('Error', 'Seleccioná el potrero de la alerta.')
      return
    }
    if (!observacion.trim()) {
      Alert.alert('Error', 'Ingresá la observación: es el contenido de la alerta.')
      return
    }

    try {
      await createAlerta.mutateAsync({
        potreroId,
        fecha,
        gravedad,
        observacion: observacion.trim(),
        latitud: coords?.latitud,
        longitud: coords?.longitud,
      })
      Alert.alert('Éxito', 'Alerta registrada correctamente.', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo registrar la alerta.')
    }
  }

  return (
    <SafeAreaView style={formKitStyles.screen}>
      <View style={formKitStyles.header}>
        <Pressable style={formKitStyles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={formKitStyles.headerCopy}>
          <Text style={formKitStyles.title}>Agregar alerta</Text>
          <Text style={formKitStyles.subtitle}>Marcar algo que requiere atención en un potrero</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={formKitStyles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={formKitStyles.card}>
          <PotreroSelect label="Potrero" potreros={potreros} value={potreroId} onChange={setPotreroId} placeholder="Buscar potrero" />

          <SectionTitle>Gravedad</SectionTitle>
          <OptionChips
            options={GRAVEDADES}
            selected={gravedad}
            onSelect={(value) => setGravedad(value as SeveridadPlaga)}
          />

          <DateField label="Fecha" value={fecha} onPress={() => setDatePickerOpen(true)} />

          <SectionTitle>Observación</SectionTitle>
          <TextAreaField
            value={observacion}
            onChangeText={setObservacion}
            placeholder="Ej: aguada rota, alambrado caído, animal enfermo suelto..."
            Icon={AlertTriangle}
          />

          <SectionTitle>Ubicación del pin (opcional)</SectionTitle>
          <Pressable style={formKitStyles.addAnimalButton} onPress={captureLocation}>
            <MapPin size={16} color="#9FE870" strokeWidth={2.2} />
            <Text style={formKitStyles.addAnimalText}>Capturar ubicación GPS</Text>
          </Pressable>
          <View style={styles.locationHintRow}>
            <Bell size={13} color={coords ? '#9FE870' : '#A6B0CF'} strokeWidth={2} />
            <Text style={[styles.locationHint, coords && styles.locationHintActive]}>
              {coords
                ? `Ubicación capturada: ${coords.latitud}, ${coords.longitud}`
                : 'Sin ubicación (se usará el centro del potrero)'}
            </Text>
          </View>

          <Pressable
            style={[formKitStyles.submitButton, createAlerta.isPending && formKitStyles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createAlerta.isPending}
          >
            <View style={formKitStyles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={formKitStyles.submitText}>{createAlerta.isPending ? 'Guardando...' : 'Registrar alerta'}</Text>
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

const styles = StyleSheet.create({
  locationHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },
  locationHint: {
    flex: 1,
    color: '#A6B0CF',
    fontSize: 11,
    lineHeight: 15,
  },
  locationHintActive: {
    color: '#9FE870',
    fontWeight: '700',
  },
})
