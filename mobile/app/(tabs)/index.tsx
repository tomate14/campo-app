import { View, Text, ScrollView, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { useLotes } from '@/shared/hooks/useLotes'

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const { data: lotes, isLoading } = useLotes()

  const styles = createStyles(c)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Buenos días</Text>
          <Text style={styles.title}>Campo App</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.card, styles.cardPrimary]} onPress={() => router.push('/lotes')} activeOpacity={0.8}>
            <Text style={styles.cardLabel}>Lotes activos</Text>
            <Text style={styles.cardValue}>{isLoading ? '...' : lotes?.length ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/agricola/nueva-siembra')} activeOpacity={0.8}>
            <Text style={[styles.cardLabel, { color: c.mutedForeground }]}>Registrar evento</Text>
            <Text style={[styles.cardValue, { color: c.foreground }]}>+ Siembra</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/agricola/registro-cosecha')} activeOpacity={0.8}>
            <Text style={[styles.cardLabel, { color: c.mutedForeground }]}>Registrar</Text>
            <Text style={[styles.cardValue, { color: c.foreground }]}>+ Cosecha</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Últimos lotes</Text>
        {lotes?.slice(0, 3).map(lote => (
          <TouchableOpacity
            key={lote.id}
            style={styles.loteRow}
            onPress={() => router.push(`/lotes/${lote.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.loteInfo}>
              <Text style={styles.loteNombre}>{lote.nombre}</Text>
              <Text style={styles.loteDetalle}>{lote.cultivo} · {lote.area} ha · {lote.temporada}</Text>
            </View>
            <Text style={[styles.arrow, { color: c.mutedForeground }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: c.background },
    scroll:       { padding: 20 },
    header:       { marginBottom: 24 },
    greeting:     { fontSize: 14, color: c.mutedForeground },
    title:        { fontSize: 28, fontWeight: '700', color: c.foreground, marginTop: 2 },
    grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
    card: {
      flex: 1, minWidth: '45%',
      backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder,
      borderRadius: 14, padding: 20,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    cardPrimary:  { backgroundColor: c.primary, borderColor: c.primary },
    cardLabel:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
    cardValue:    { fontSize: 28, fontWeight: '700', color: '#FFF', marginTop: 6 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.foreground, marginBottom: 12 },
    loteRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder,
      borderRadius: 12, padding: 16, marginBottom: 8,
    },
    loteInfo:     { flex: 1 },
    loteNombre:   { fontSize: 15, fontWeight: '600', color: c.foreground },
    loteDetalle:  { fontSize: 12, color: c.mutedForeground, marginTop: 2 },
    arrow:        { fontSize: 22, fontWeight: '300' },
  })
}
