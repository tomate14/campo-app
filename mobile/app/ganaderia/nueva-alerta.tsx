import { useEffect, useRef, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { AlertTriangle, ArrowLeft, Bell, Camera, Images, MapPin, Plus, Trash2 } from 'lucide-react-native'
import { usePotrerosList } from '../../shared/hooks/usePotreros'
import { useCreateAlertaPotrero, useCreateAlertaPotreroConFoto } from '../../shared/hooks/usePotreroAlertas'
import {
  DateField,
  DatePickerSheet,
  OptionChips,
  PotreroSelect,
  SectionTitle,
  TextAreaField,
  formKitStyles,
} from '../../shared/components/ganaderia-form-kit'
import type { PlagaImageAsset } from '../../shared/api/agricola'
import type { SeveridadPlaga } from '../../shared/types/agricola'

const GRAVEDADES: Array<{ value: SeveridadPlaga; label: string }> = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Crítica' },
]

// Captura una foto (camara o galeria) pidiendo permiso; devuelve el asset o null si se
// canceló o no hubo permiso (feature 79: la foto siempre es opcional).
async function pickImageAsset(source: 'camera' | 'library'): Promise<PlagaImageAsset | null> {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
    Alert.alert('Permiso requerido', source === 'camera' ? 'No se otorgó permiso para usar la cámara.' : 'No se otorgó permiso para acceder a la galería.')
    return null
  }
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
  if (result.canceled || !result.assets?.[0]) return null
  const asset = result.assets[0]
  return { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType }
}

export default function NuevaAlertaScreen() {
  const router = useRouter()
  const { data: potreros = [] } = usePotrerosList()
  const createAlerta = useCreateAlertaPotrero()
  const createAlertaConFoto = useCreateAlertaPotreroConFoto()

  const [potreroId, setPotreroId] = useState('')
  const [gravedad, setGravedad] = useState<SeveridadPlaga>('MEDIA')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [observacion, setObservacion] = useState('')
  const [coords, setCoords] = useState<{ latitud: number; longitud: number } | null>(null)
  // Foto de la alerta (feature 79): captura previa cámara-primero, opcional.
  const [foto, setFoto] = useState<PlagaImageAsset | null>(null)
  // Flag para abrir la cámara una sola vez al entrar a la pantalla.
  const cameraAutoTriedRef = useRef(false)

  // Camara-primero (feature 79): al abrir la pantalla sin foto, lanzar la camara una
  // sola vez. Si el usuario cancela, sigue el flujo sin foto.
  useEffect(() => {
    if (cameraAutoTriedRef.current || foto) return
    cameraAutoTriedRef.current = true
    pickFoto('camera')
  }, [])

  const pickFoto = async (source: 'camera' | 'library') => {
    const asset = await pickImageAsset(source)
    if (asset) setFoto(asset)
  }

  const submitting = createAlerta.isPending || createAlertaConFoto.isPending

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

    const data = {
      potreroId,
      fecha,
      gravedad,
      observacion: observacion.trim(),
      latitud: coords?.latitud,
      longitud: coords?.longitud,
    }

    try {
      if (foto) {
        await createAlertaConFoto.mutateAsync({ data, asset: foto })
      } else {
        await createAlerta.mutateAsync(data)
      }
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
          <SectionTitle>Foto (opcional)</SectionTitle>
          {foto ? (
            <View style={styles.heroWrap}>
              <Image source={{ uri: foto.uri }} style={styles.heroImage} contentFit="cover" transition={200} />
              <Pressable style={styles.imageDelete} onPress={() => setFoto(null)} accessibilityRole="button" accessibilityLabel="Quitar foto">
                <Trash2 size={18} color="#FF6B6B" strokeWidth={2.2} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Camera size={38} color="#3A4A6B" strokeWidth={2} />
              <Text style={styles.heroPlaceholderText}>Sin foto (opcional)</Text>
            </View>
          )}
          <View style={styles.fotoRow}>
            <Pressable style={styles.fotoButton} onPress={() => pickFoto('camera')} accessibilityRole="button">
              <Camera size={18} color="#9FE870" strokeWidth={2.2} />
              <Text style={styles.fotoButtonText}>{foto ? 'Reintentar' : 'Tomar foto'}</Text>
            </Pressable>
            <Pressable style={styles.fotoButton} onPress={() => pickFoto('library')} accessibilityRole="button">
              <Images size={18} color="#9FE870" strokeWidth={2.2} />
              <Text style={styles.fotoButtonText}>Galería</Text>
            </Pressable>
          </View>

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
            style={[formKitStyles.submitButton, submitting && formKitStyles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <View style={formKitStyles.submitIcon}>
              <Plus size={21} color="#081225" strokeWidth={2.2} />
            </View>
            <Text style={formKitStyles.submitText}>{submitting ? 'Guardando...' : 'Registrar alerta'}</Text>
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
  // Card de foto (feature 79): preview con hero + acciones, mismo lenguaje premium dark.
  heroWrap: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#081225',
  },
  imageDelete: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,18,37,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.35)',
  },
  heroPlaceholder: {
    height: 160,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#081225',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroPlaceholderText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  fotoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fotoButton: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(159,232,112,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.32)',
  },
  fotoButtonText: {
    color: '#9FE870',
    fontSize: 13,
    fontWeight: '800',
  },
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
