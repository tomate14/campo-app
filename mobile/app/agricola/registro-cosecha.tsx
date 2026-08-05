import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { useLotes } from '../../shared/hooks/useLotes'
import { useCreateCosecha } from '../../shared/hooks/useCosecha'
import { useUtilidadOpciones } from '../../shared/hooks/useUtilidades'
import type { CalidadGrano } from '../../shared/types/agricola'

const CALIDADES: CalidadGrano[] = ['PREMIUM', 'ESTANDAR', 'DESCUENTO']

export default function RegistroCosechaScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const params = useLocalSearchParams<{ loteId?: string }>()
  const { data: lotes = [] } = useLotes()
  const { data: destinos = [] } = useUtilidadOpciones('DESTINO_COSECHA')
  const { data: tiposPerdida = [] } = useUtilidadOpciones('TIPO_PERDIDA_COSECHA')
  const createCosecha = useCreateCosecha()

  const [loteId, setLoteId] = useState(params.loteId ?? '')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [rendimientoKgHa, setRendimientoKgHa] = useState('')
  const [toneladasTotal, setToneladasTotal] = useState('')
  const [calidadGrano, setCalidadGrano] = useState<CalidadGrano>('ESTANDAR')
  const [humedad, setHumedad] = useState('')
  // Perdidas de cosecha y destino del dia (feature 60)
  const [areaRealCosechadaPct, setAreaRealCosechadaPct] = useState('')
  const [hectareasCosechadas, setHectareasCosechadas] = useState('')
  const [perdidaKgHa, setPerdidaKgHa] = useState('')
  const [granosPerdidosKg, setGranosPerdidosKg] = useState('')
  const [tipoPerdida, setTipoPerdida] = useState('')
  const [destino, setDestino] = useState('')
  const [destinoCantidadTn, setDestinoCantidadTn] = useState('')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (!loteId && lotes.length === 1) {
      setLoteId(lotes[0].id)
    }
  }, [loteId, lotes])

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, gap: 14 },
    title: { fontSize: 24, fontWeight: '700', color: c.foreground },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: c.foreground, marginTop: 6 },
    subtitle: { fontSize: 14, color: c.mutedForeground },
    label: { fontSize: 13, fontWeight: '600', color: c.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.foreground, fontWeight: '600' },
    chipTextActive: { color: c.primaryForeground },
    input: {
      height: 52, borderRadius: 12, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.card, paddingHorizontal: 14, color: c.foreground, fontSize: 15,
    },
    textarea: {
      minHeight: 100, borderRadius: 12, borderWidth: 1, borderColor: c.border,
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
    if (!loteId || !fecha || !rendimientoKgHa || !toneladasTotal) {
      Alert.alert('Error', 'Completa lote, fecha, rendimiento y toneladas.')
      return
    }

    try {
      await createCosecha.mutateAsync({
        loteId,
        fecha,
        rendimientoKgHa: Number(rendimientoKgHa),
        toneladasTotal: Number(toneladasTotal),
        calidadGrano,
        humedad: humedad ? Number(humedad) : undefined,
        areaRealCosechadaPct: areaRealCosechadaPct ? Number(areaRealCosechadaPct) : undefined,
        hectareasCosechadas: hectareasCosechadas ? Number(hectareasCosechadas) : undefined,
        perdidaKgHa: perdidaKgHa ? Number(perdidaKgHa) : undefined,
        granosPerdidosKg: granosPerdidosKg ? Number(granosPerdidosKg) : undefined,
        tipoPerdida: tipoPerdida || undefined,
        destino: destino || undefined,
        destinoCantidadTn: destinoCantidadTn ? Number(destinoCantidadTn) : undefined,
        observaciones: observaciones || undefined,
      })
      Alert.alert('Exito', 'Cosecha registrada correctamente.', [{ text: 'OK', onPress: () => router.back() }])
    } catch {
      Alert.alert('Error', 'No se pudo registrar la cosecha.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <Text style={styles.title}>Registrar cosecha</Text>
          <Text style={styles.subtitle}>Completa la captura productiva del lote.</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Lote</Text>
          <View style={styles.chips}>
            {lotes.map((lote) => (
              <TouchableOpacity key={lote.id} style={[styles.chip, loteId === lote.id && styles.chipActive]} onPress={() => setLoteId(lote.id)} activeOpacity={0.8}>
                <Text style={[styles.chipText, loteId === lote.id && styles.chipTextActive]}>{lote.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput value={fecha} onChangeText={setFecha} style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Rendimiento kg/ha</Text>
          <TextInput value={rendimientoKgHa} onChangeText={setRendimientoKgHa} style={styles.input} keyboardType="decimal-pad" placeholder="8500" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Toneladas totales</Text>
          <TextInput value={toneladasTotal} onChangeText={setToneladasTotal} style={styles.input} keyboardType="decimal-pad" placeholder="120.5" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Calidad de grano</Text>
          <View style={styles.chips}>
            {CALIDADES.map((calidad) => (
              <TouchableOpacity key={calidad} style={[styles.chip, calidadGrano === calidad && styles.chipActive]} onPress={() => setCalidadGrano(calidad)} activeOpacity={0.8}>
                <Text style={[styles.chipText, calidadGrano === calidad && styles.chipTextActive]}>{calidad}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Humedad</Text>
          <TextInput value={humedad} onChangeText={setHumedad} style={styles.input} keyboardType="decimal-pad" placeholder="14.2" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Perdidas de cosecha</Text>
          <Text style={styles.subtitle}>La cosechadora junta el rendimiento; la perdida es lo que queda en el campo.</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Area real cosechada (%)</Text>
          <TextInput value={areaRealCosechadaPct} onChangeText={setAreaRealCosechadaPct} style={styles.input} keyboardType="decimal-pad" placeholder="95" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Hectareas cosechadas</Text>
          <TextInput value={hectareasCosechadas} onChangeText={setHectareasCosechadas} style={styles.input} keyboardType="decimal-pad" placeholder="48.5" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Perdida kg/ha</Text>
          <TextInput value={perdidaKgHa} onChangeText={setPerdidaKgHa} style={styles.input} keyboardType="decimal-pad" placeholder="120" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Granos perdidos (kg)</Text>
          <TextInput value={granosPerdidosKg} onChangeText={setGranosPerdidosKg} style={styles.input} keyboardType="decimal-pad" placeholder="5800" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tipo de perdida</Text>
          {tiposPerdida.length > 0 ? (
            <View style={styles.chips}>
              {tiposPerdida.map((opcion) => (
                <TouchableOpacity key={opcion.id} style={[styles.chip, tipoPerdida === opcion.id && styles.chipActive]} onPress={() => setTipoPerdida(tipoPerdida === opcion.id ? '' : opcion.id)} activeOpacity={0.8}>
                  <Text style={[styles.chipText, tipoPerdida === opcion.id && styles.chipTextActive]}>{opcion.valor}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.subtitle}>No hay tipos de perdida configurados. Se administran desde Utilidades en la web.</Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Destino del dia</Text>
          <Text style={styles.subtitle}>A donde fue la cosecha del dia y la cantidad correspondiente.</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Destino</Text>
          {destinos.length > 0 ? (
            <View style={styles.chips}>
              {destinos.map((opcion) => (
                <TouchableOpacity key={opcion.id} style={[styles.chip, destino === opcion.id && styles.chipActive]} onPress={() => setDestino(destino === opcion.id ? '' : opcion.id)} activeOpacity={0.8}>
                  <Text style={[styles.chipText, destino === opcion.id && styles.chipTextActive]}>{opcion.valor}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.subtitle}>No hay destinos configurados. Se administran desde Utilidades en la web.</Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cantidad al destino (tn)</Text>
          <TextInput value={destinoCantidadTn} onChangeText={setDestinoCantidadTn} style={styles.input} keyboardType="decimal-pad" placeholder="60" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Observaciones</Text>
          <TextInput value={observaciones} onChangeText={setObservaciones} style={styles.textarea} multiline placeholder="Detalles de calidad, maquina o condiciones de cosecha" placeholderTextColor={c.mutedForeground} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.btnSecondaryText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSave} disabled={createCosecha.isPending} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>{createCosecha.isPending ? 'Guardando...' : 'Registrar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
