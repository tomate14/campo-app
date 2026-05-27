import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { createDeteccionPlaga, getCatalogoPlagas, getLotes } from '@/shared/api/agricola'
import type { CatalogoPlaga, DeteccionPlagaRequest, Lote, SeveridadPlaga } from '@/shared/types/agricola'

const severityOptions: SeveridadPlaga[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']

export default function PlagasMobilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lotes, setLotes] = useState<Lote[]>([])
  const [catalogo, setCatalogo] = useState<CatalogoPlaga[]>([])
  const [form, setForm] = useState<DeteccionPlagaRequest>({ loteId: '', catalogoPlagaId: '', severidad: 'MEDIA', estado: 'ABIERTA', origenGeolocalizacion: 'MOBILE_GPS', fechaDeteccion: new Date().toISOString().slice(0, 16) })

  useEffect(() => {
    Promise.all([getLotes(), getCatalogoPlagas()])
      .then(([lotesData, catalogoData]) => {
        setLotes(lotesData)
        setCatalogo(catalogoData)
        setForm((current) => ({ ...current, loteId: lotesData[0]?.id ?? '', catalogoPlagaId: catalogoData[0]?.id ?? '', cultivo: lotesData[0]?.cultivo }))
      })
      .catch(() => Alert.alert('Control de plagas', 'No se pudieron cargar los datos iniciales.'))
      .finally(() => setLoading(false))
  }, [])

  const captureLocation = () => {
    const geolocation = (globalThis as any).navigator?.geolocation
    if (!geolocation) {
      Alert.alert('Ubicacion', 'El dispositivo no expone geolocalizacion en este runtime. Podes cargar las coordenadas manualmente.')
      return
    }
    geolocation.getCurrentPosition(
      (position) => setForm((current) => ({ ...current, latitud: Number(position.coords.latitude.toFixed(7)), longitud: Number(position.coords.longitude.toFixed(7)), precisionMetros: Math.round(position.coords.accuracy ?? 0), origenGeolocalizacion: 'MOBILE_GPS' })),
      () => Alert.alert('Ubicacion', 'No se pudo obtener la ubicacion del dispositivo.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  const save = () => {
    if (!form.loteId || !form.catalogoPlagaId) {
      Alert.alert('Control de plagas', 'Selecciona lote y plaga antes de guardar.')
      return
    }
    setSaving(true)
    createDeteccionPlaga(form)
      .then(() => {
        Alert.alert('Control de plagas', 'Deteccion registrada correctamente.')
        router.back()
      })
      .catch(() => Alert.alert('Control de plagas', 'No se pudo guardar la deteccion.'))
      .finally(() => setSaving(false))
  }

  if (loading) {
    return <SafeAreaView style={styles.safe}><ActivityIndicator color={Colors.light.primary} /></SafeAreaView>
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Campo App · Agricultura</Text>
          <Text style={styles.title}>Registrar plaga</Text>
          <Text style={styles.subtitle}>Captura coordenadas del dispositivo y carga la deteccion del lote.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Lote</Text>
          {lotes.map((lote) => <Pressable key={lote.id} style={[styles.option, form.loteId === lote.id && styles.optionActive]} onPress={() => setForm((current) => ({ ...current, loteId: lote.id, cultivo: lote.cultivo }))}><Text style={styles.optionText}>{lote.nombre}</Text></Pressable>)}

          <Text style={styles.label}>Plaga / enfermedad</Text>
          {catalogo.map((item) => <Pressable key={item.id} style={[styles.option, form.catalogoPlagaId === item.id && styles.optionActive]} onPress={() => setForm((current) => ({ ...current, catalogoPlagaId: item.id }))}><Text style={styles.optionText}>{item.nombreComun}</Text></Pressable>)}

          <Text style={styles.label}>Severidad</Text>
          <View style={styles.inline}>{severityOptions.map((item) => <Pressable key={item} style={[styles.chip, form.severidad === item && styles.chipActive]} onPress={() => setForm((current) => ({ ...current, severidad: item }))}><Text style={styles.chipText}>{item}</Text></Pressable>)}</View>

          <Pressable style={styles.secondaryButton} onPress={captureLocation}><Text style={styles.secondaryButtonText}>Tomar coordenadas del dispositivo</Text></Pressable>
          <View style={styles.coords}><Text style={styles.coordText}>Lat: {form.latitud ?? '-'}</Text><Text style={styles.coordText}>Lng: {form.longitud ?? '-'}</Text></View>

          <Text style={styles.label}>Area afectada ha</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={form.areaAfectadaHa?.toString() ?? ''} onChangeText={(value) => setForm((current) => ({ ...current, areaAfectadaHa: value ? Number(value) : undefined }))} />
          <Text style={styles.label}>Responsable</Text>
          <TextInput style={styles.input} value={form.responsable ?? ''} onChangeText={(value) => setForm((current) => ({ ...current, responsable: value }))} />
          <Text style={styles.label}>Descripcion</Text>
          <TextInput style={[styles.input, styles.textarea]} multiline value={form.descripcion ?? ''} onChangeText={(value) => setForm((current) => ({ ...current, descripcion: value }))} />

          <Pressable style={styles.primaryButton} disabled={saving} onPress={save}><Text style={styles.primaryButtonText}>{saving ? 'Guardando...' : 'Guardar deteccion'}</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#081225' },
  container: { padding: 18, gap: 16 },
  header: { gap: 6 },
  eyebrow: { color: '#9FE870', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: '#F8FBFF', fontSize: 34, fontWeight: '800' },
  subtitle: { color: '#9BB0CC', fontSize: 14, lineHeight: 20 },
  card: { borderWidth: 1, borderColor: 'rgba(110,168,255,.18)', borderRadius: 24, backgroundColor: '#0B1730', padding: 16, gap: 10 },
  label: { color: '#9BB0CC', fontSize: 12, marginTop: 8 },
  option: { minHeight: 42, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(148,163,184,.16)', borderRadius: 14, paddingHorizontal: 12, backgroundColor: 'rgba(7,15,31,.46)' },
  optionActive: { borderColor: '#9FE870', backgroundColor: 'rgba(159,232,112,.10)' },
  optionText: { color: '#F8FBFF', fontWeight: '700' },
  inline: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: 'rgba(148,163,184,.16)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  chipActive: { borderColor: '#9FE870', backgroundColor: 'rgba(159,232,112,.10)' },
  chipText: { color: '#DCE8F7', fontSize: 12, fontWeight: '700' },
  input: { minHeight: 44, borderWidth: 1, borderColor: 'rgba(148,163,184,.16)', borderRadius: 14, color: '#F8FBFF', paddingHorizontal: 12, backgroundColor: 'rgba(7,15,31,.46)' },
  textarea: { minHeight: 94, paddingTop: 10, textAlignVertical: 'top' },
  secondaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(110,168,255,.22)', borderRadius: 14, marginTop: 8 },
  secondaryButtonText: { color: '#DCE8F7', fontWeight: '800' },
  primaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#4D7C0F', marginTop: 12 },
  primaryButtonText: { color: '#FFF', fontWeight: '900' },
  coords: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  coordText: { color: '#9FE870', fontSize: 12 },
})
