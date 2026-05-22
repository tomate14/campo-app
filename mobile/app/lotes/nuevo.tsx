import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { useCreateLote } from '../../shared/hooks/useLotes'

export default function NuevoLoteScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const createLote = useCreateLote()

  const [nombre, setNombre] = useState('')
  const [area, setArea] = useState('')
  const [cultivo, setCultivo] = useState('')
  const [temporada, setTemporada] = useState(new Date().getFullYear().toString())
  const [latitud, setLatitud] = useState('')
  const [longitud, setLongitud] = useState('')
  const [poligono, setPoligono] = useState('')

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, gap: 14 },
    title: { fontSize: 24, fontWeight: '700', color: c.foreground },
    subtitle: { fontSize: 14, color: c.mutedForeground },
    label: { fontSize: 13, fontWeight: '600', color: c.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.4 },
    input: {
      height: 52, borderRadius: 12, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.card, paddingHorizontal: 14, color: c.foreground, fontSize: 15,
    },
    textarea: {
      minHeight: 140, borderRadius: 12, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.card, paddingHorizontal: 14, paddingVertical: 14, color: c.foreground,
      fontSize: 14, textAlignVertical: 'top',
    },
    row: { gap: 8 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
    btnPrimary: {
      flex: 1, height: 52, borderRadius: 14, backgroundColor: c.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    btnSecondary: {
      flex: 1, height: 52, borderRadius: 14, backgroundColor: c.card,
      borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center',
    },
    btnPrimaryText: { color: c.primaryForeground, fontWeight: '700', fontSize: 15 },
    btnSecondaryText: { color: c.foreground, fontWeight: '700', fontSize: 15 },
  })

  async function handleSave() {
    if (!nombre.trim() || !area.trim() || !cultivo.trim() || !temporada.trim()) {
      Alert.alert('Error', 'Completa nombre, area, cultivo y temporada.')
      return
    }

    try {
      await createLote.mutateAsync({
        nombre: nombre.trim(),
        area: Number(area),
        cultivo: cultivo.trim().toUpperCase(),
        temporada: temporada.trim(),
        latitud: latitud.trim() ? Number(latitud) : undefined,
        longitud: longitud.trim() ? Number(longitud) : undefined,
        poligono: poligono.trim() || undefined,
      })
      Alert.alert('Exito', 'Lote creado correctamente.', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo crear el lote.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <Text style={styles.title}>Nuevo lote</Text>
          <Text style={styles.subtitle}>Carga manual rapida para mobile. El poligono GeoJSON es opcional.</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput value={nombre} onChangeText={setNombre} style={styles.input} placeholder="Lote 12" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cultivo</Text>
          <TextInput value={cultivo} onChangeText={setCultivo} style={styles.input} placeholder="MAIZ" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Temporada</Text>
          <TextInput value={temporada} onChangeText={setTemporada} style={styles.input} placeholder="2026" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Area (ha)</Text>
          <TextInput value={area} onChangeText={setArea} style={styles.input} placeholder="150.50" placeholderTextColor={c.mutedForeground} keyboardType="decimal-pad" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Latitud</Text>
          <TextInput value={latitud} onChangeText={setLatitud} style={styles.input} placeholder="-36.19" placeholderTextColor={c.mutedForeground} keyboardType="decimal-pad" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Longitud</Text>
          <TextInput value={longitud} onChangeText={setLongitud} style={styles.input} placeholder="-60.67" placeholderTextColor={c.mutedForeground} keyboardType="decimal-pad" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Poligono GeoJSON</Text>
          <TextInput value={poligono} onChangeText={setPoligono} style={styles.textarea} multiline placeholder='{"type":"Polygon","coordinates":[...]}' placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.btnSecondaryText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSave} disabled={createLote.isPending} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>{createLote.isPending ? 'Guardando...' : 'Guardar lote'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
