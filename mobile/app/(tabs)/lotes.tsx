import { View, Text, FlatList, StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { useLotes } from '../../shared/hooks/useLotes'
import type { Lote } from '../../shared/types/agricola'

export default function LotesScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const { data: lotes, isLoading, refetch } = useLotes()

  const styles = createStyles(c)

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={lotes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isLoading}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Mis Lotes</Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => router.push('/lotes/nuevo')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>+ Nuevo</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay lotes registrados</Text>
          </View>
        }
        renderItem={({ item }: { item: Lote }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/lotes/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardNombre}>{item.nombre}</Text>
              <View style={[styles.badge, { backgroundColor: `${c.primary}18` }]}>
                <Text style={[styles.badgeText, { color: c.primary }]}>{item.cultivo}</Text>
              </View>
            </View>
            <View style={styles.cardStats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Superficie</Text>
                <Text style={styles.statValue}>{item.area} ha</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Temporada</Text>
                <Text style={styles.statValue}>{item.temporada}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

function createStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container:   { flex: 1, backgroundColor: c.background },
    center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    list:        { padding: 20, gap: 12 },
    header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title:       { fontSize: 24, fontWeight: '700', color: c.foreground },
    btnPrimary:  { backgroundColor: c.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    btnText:     { color: c.primaryForeground, fontSize: 14, fontWeight: '600' },
    empty:       { alignItems: 'center', paddingTop: 60 },
    emptyText:   { color: c.mutedForeground, fontSize: 16 },
    card: {
      backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder,
      borderRadius: 14, padding: 18,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    cardNombre:  { fontSize: 16, fontWeight: '600', color: c.foreground, flex: 1, marginRight: 8 },
    badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText:   { fontSize: 11, fontWeight: '600' },
    cardStats:   { flexDirection: 'row', gap: 24 },
    stat:        {},
    statLabel:   { fontSize: 11, color: c.mutedForeground },
    statValue:   { fontSize: 15, fontWeight: '600', color: c.foreground, marginTop: 2 },
  })
}
