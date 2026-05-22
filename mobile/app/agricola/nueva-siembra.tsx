import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, useColorScheme, TouchableOpacity, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { useLotes } from '@/shared/hooks/useLotes'
import { useCreateEvento } from '@/shared/hooks/useSiembra'
import type { TipoEvento } from '@/shared/types/agricola'

const TIPOS: { value: TipoEvento; label: string }[] = [
  { value: 'SIEMBRA',              label: 'Siembra' },
  { value: 'MONITOREO_FENOLOGICO', label: 'Monitoreo Fenológico' },
  { value: 'ALERTA',               label: 'Alerta' },
  { value: 'TRATAMIENTO',          label: 'Tratamiento' },
]

const ESTADOS = ['VE','V1','V2','V3','V4','V5','V6','V8','VT','R1','R2','R3','R4','R5','R6']

export default function NuevaSiembraScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const params = useLocalSearchParams<{ loteId?: string }>()

  const { data: lotes } = useLotes()
  const createEvento = useCreateEvento()

  const [loteId, setLoteId]                         = useState(params.loteId ?? '')
  const [tipoEvento, setTipoEvento]                 = useState<TipoEvento>('SIEMBRA')
  const [estadoFenologico, setEstadoFenologico]     = useState('')
  const [descripcion, setDescripcion]               = useState('')
  const [fecha, setFecha]                           = useState(new Date().toISOString().split('T')[0])

  const styles = createStyles(c)

  const handleSubmit = async () => {
    if (!loteId) { Alert.alert('Error', 'Seleccioná un lote'); return }
    try {
      await createEvento.mutateAsync({ loteId, tipoEvento, estadoFenologico: estadoFenologico || undefined, descripcion: descripcion || undefined, fecha })
      Alert.alert('Éxito', 'Evento registrado correctamente', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo registrar el evento')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Lote</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {lotes?.map(l => (
            <TouchableOpacity
              key={l.id}
              style={[styles.chip, loteId === l.id && styles.chipActive]}
              onPress={() => setLoteId(l.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, loteId === l.id && styles.chipTextActive]}>{l.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Tipo de evento</Text>
        <View style={styles.tiposGrid}>
          {TIPOS.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.tipoBtn, tipoEvento === t.value && styles.tipoBtnActive]}
              onPress={() => setTipoEvento(t.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tipoBtnText, tipoEvento === t.value && styles.tipoBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tipoEvento === 'MONITOREO_FENOLOGICO' && (
          <>
            <Text style={styles.sectionLabel}>Estado fenológico</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {ESTADOS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.chip, styles.chipSmall, estadoFenologico === e && styles.chipActive]}
                  onPress={() => setEstadoFenologico(e)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, estadoFenologico === e && styles.chipTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionLabel}>Fecha</Text>
        <TextInput
          value={fecha}
          onChangeText={setFecha}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={c.mutedForeground}
          keyboardType="numeric"
        />

        <Text style={styles.sectionLabel}>Descripción (opcional)</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          style={[styles.input, styles.inputMultiline]}
          placeholder="Observaciones del evento..."
          placeholderTextColor={c.mutedForeground}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.btnSubmit, createEvento.isPending && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={createEvento.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSubmitText}>
            {createEvento.isPending ? 'Guardando...' : 'Registrar evento'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: c.background },
    scroll:           { padding: 20, gap: 8 },
    sectionLabel:     { fontSize: 13, fontWeight: '600', color: c.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
    chipScroll:       { marginHorizontal: -4 },
    chip:             { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginHorizontal: 4 },
    chipActive:       { backgroundColor: c.primary, borderColor: c.primary },
    chipSmall:        { paddingHorizontal: 12, paddingVertical: 6 },
    chipText:         { fontSize: 13, color: c.foreground, fontWeight: '500' },
    chipTextActive:   { color: c.primaryForeground },
    tiposGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tipoBtn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    tipoBtnActive:    { backgroundColor: c.primary, borderColor: c.primary },
    tipoBtnText:      { fontSize: 13, color: c.foreground, fontWeight: '500' },
    tipoBtnTextActive:{ color: c.primaryForeground },
    input: {
      height: 52, backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
      borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: c.foreground,
    },
    inputMultiline:   { height: 90, paddingTop: 14, textAlignVertical: 'top' },
    btnSubmit: {
      height: 52, backgroundColor: c.primary, borderRadius: 14,
      justifyContent: 'center', alignItems: 'center', marginTop: 24,
      shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    btnDisabled:      { opacity: 0.6 },
    btnSubmitText:    { color: c.primaryForeground, fontSize: 16, fontWeight: '700' },
  })
}
