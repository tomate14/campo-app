import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { useLote } from '@/shared/hooks/useLotes'
import { useEventosByLote } from '@/shared/hooks/useSiembra'
import { useCosechasByLote, useRendimientoPromedio } from '@/shared/hooks/useCosecha'
import { useUltimoAnalisis } from '@/shared/hooks/useSuelo'
import { useRotacion } from '@/shared/hooks/useHistorial'

export default function LoteDetailScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const loteQuery = useLote(id)
  const eventosQuery = useEventosByLote(id)
  const cosechasQuery = useCosechasByLote(id)
  const promedioQuery = useRendimientoPromedio(id)
  const sueloQuery = useUltimoAnalisis(id)
  const rotacionQuery = useRotacion(id)

  const lote = loteQuery.data

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 12, backgroundColor: c.card,
      borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center',
    },
    backText: { color: c.foreground, fontSize: 18, fontWeight: '700' },
    title: { fontSize: 24, fontWeight: '700', color: c.foreground },
    subtitle: { color: c.mutedForeground, marginTop: 2 },
    content: { padding: 20, gap: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
      backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder,
      padding: 16,
    },
    metricCard: {
      width: '47%', backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder,
      padding: 16,
    },
    label: { color: c.mutedForeground, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
    value: { color: c.foreground, fontSize: 18, fontWeight: '700', marginTop: 6 },
    sectionTitle: { color: c.foreground, fontSize: 18, fontWeight: '700' },
    actions: { gap: 10 },
    actionBtn: {
      backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border,
      paddingHorizontal: 14, paddingVertical: 14,
    },
    actionPrimary: { backgroundColor: c.primary, borderColor: c.primary },
    actionText: { color: c.foreground, fontWeight: '600' },
    actionTextPrimary: { color: c.primaryForeground, fontWeight: '700' },
    helper: { color: c.mutedForeground, marginTop: 8, fontSize: 13 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  })

  if (loteQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    )
  }

  if (!lote) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.sectionTitle}>No se encontro el lote.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>?</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{lote.nombre}</Text>
          <Text style={styles.subtitle}>{lote.cultivo} · {lote.temporada}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {
          void loteQuery.refetch()
          void eventosQuery.refetch()
          void cosechasQuery.refetch()
          void promedioQuery.refetch()
          void sueloQuery.refetch()
          void rotacionQuery.refetch()
        }} tintColor={c.primary} />}
      >
        <View style={styles.grid}>
          <View style={styles.metricCard}><Text style={styles.label}>Area</Text><Text style={styles.value}>{lote.area} ha</Text></View>
          <View style={styles.metricCard}><Text style={styles.label}>Eventos</Text><Text style={styles.value}>{eventosQuery.data?.length ?? 0}</Text></View>
          <View style={styles.metricCard}><Text style={styles.label}>Cosechas</Text><Text style={styles.value}>{cosechasQuery.data?.length ?? 0}</Text></View>
          <View style={styles.metricCard}><Text style={styles.label}>Rendimiento promedio</Text><Text style={styles.value}>{promedioQuery.data?.rendimientoPromedioKgHa ?? 0} kg/ha</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumen operativo</Text>
          <Text style={styles.helper}>Ultimo pH: {sueloQuery.data?.ph ?? 'Sin analisis'}</Text>
          <Text style={styles.helper}>Rotacion: {rotacionQuery.data?.razon ?? 'Sin recomendacion disponible'}</Text>
          <Text style={styles.helper}>Coordenadas: {lote.latitud ?? '-'} / {lote.longitud ?? '-'}</Text>
          <Text style={styles.helper}>Poligono: {lote.poligono ? 'Disponible' : 'No cargado'}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            onPress={() => router.push({ pathname: '/agricola/nueva-siembra', params: { loteId: lote.id } })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTextPrimary}>Registrar evento de siembra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            onPress={() => router.push({ pathname: '/agricola/registro-cosecha', params: { loteId: lote.id } })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTextPrimary}>Registrar cosecha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/agricola/suelo/[loteId]', params: { loteId: lote.id, loteNombre: lote.nombre } })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>Ver analisis de suelo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/agricola/historial/[loteId]', params: { loteId: lote.id, loteNombre: lote.nombre } })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>Ver historial de cultivos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/clima/[loteId]', params: { loteId: lote.id, loteNombre: lote.nombre } })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>Abrir clima del lote</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
