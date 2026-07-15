import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CloudOff, CloudUpload, RefreshCw, RotateCcw, Trash2, UploadCloud } from 'lucide-react-native'
import { listOutbox, removeOutboxItem, subscribeOutbox, type OutboxItem } from '../../shared/sync/outbox'
import { retryOutboxItem } from '../../shared/sync/syncUp'
import { useSyncStatus } from '../../shared/sync/SyncProvider'

// Bandeja de sincronizacion (feature 24): estado de la cola offline con
// reintento/descarte por item y sincronizacion manual.
export default function SyncPendientesScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { online, lastSyncAt, syncing, syncNow } = useSyncStatus()
  const [items, setItems] = useState<OutboxItem[]>([])

  const refresh = useCallback(() => {
    void listOutbox().then(setItems)
  }, [])

  useEffect(() => {
    refresh()
    return subscribeOutbox(refresh)
  }, [refresh])

  const handleDiscard = (item: OutboxItem) => {
    Alert.alert('Descartar registro', `¿Seguro que querés descartar "${item.entityLabel}"? Este registro no se enviará al servidor.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => void removeOutboxItem(item.opId) },
    ])
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Sincronización</Text>
          <Text style={styles.subtitle}>
            {lastSyncAt ? `Última sincronización: ${formatDateTime(lastSyncAt)}` : 'Sin sincronizaciones todavía'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusCard, !online && styles.statusCardOffline]}>
          {online ? (
            <CloudUpload size={20} color="#9FE870" strokeWidth={2} />
          ) : (
            <CloudOff size={20} color="#FFB84D" strokeWidth={2} />
          )}
          <Text style={styles.statusText}>
            {online ? 'Con conexión. Los registros pendientes se envían automáticamente.' : 'Sin conexión. Los registros quedan en cola y se envían al recuperar señal.'}
          </Text>
        </View>

        <Pressable
          style={[styles.syncButton, (!online || syncing) && styles.syncButtonDisabled]}
          disabled={!online || syncing}
          onPress={() => void syncNow()}
        >
          <RefreshCw size={16} color="#081225" strokeWidth={2.4} />
          <Text style={styles.syncButtonText}>{syncing ? 'Sincronizando...' : 'Sincronizar ahora'}</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Registros en cola</Text>

        {items.length === 0 && (
          <View style={styles.emptyBox}>
            <UploadCloud size={26} color="#A6B0CF" strokeWidth={1.8} />
            <Text style={styles.emptyText}>No hay registros pendientes de sincronizar.</Text>
          </View>
        )}

        {items.map((item) => {
          const isError = item.status === 'ERROR'
          return (
            <View key={item.opId} style={[styles.itemCard, isError && styles.itemCardError]}>
              <View style={styles.itemHead}>
                <Text style={styles.itemLabel}>{item.entityLabel}</Text>
                <View style={[styles.itemBadge, isError ? styles.itemBadgeError : styles.itemBadgePending]}>
                  <Text style={[styles.itemBadgeText, { color: isError ? '#FF6B6B' : '#6EA8FF' }]}>
                    {isError ? 'ERROR' : 'PENDIENTE'}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemDetail}>Creado: {formatDateTime(item.createdAt)}</Text>
              {item.attempts > 0 && <Text style={styles.itemDetail}>Intentos: {item.attempts}</Text>}
              {isError && !!item.errorMessage && <Text style={styles.itemError}>{item.errorMessage}</Text>}

              <View style={styles.itemActions}>
                {isError && (
                  <Pressable style={styles.itemActionButton} onPress={() => void retryOutboxItem(item.opId, queryClient)}>
                    <RotateCcw size={14} color="#9FE870" strokeWidth={2.2} />
                    <Text style={styles.itemActionText}>Reintentar</Text>
                  </Pressable>
                )}
                <Pressable style={styles.itemActionButton} onPress={() => handleDiscard(item)}>
                  <Trash2 size={14} color="#FF6B6B" strokeWidth={2.2} />
                  <Text style={[styles.itemActionText, { color: '#FF6B6B' }]}>Descartar</Text>
                </Pressable>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#081225' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 14 },
  backButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 22, lineHeight: 27, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: '#A6B0CF', fontSize: 13, marginTop: 3 },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18,
    backgroundColor: 'rgba(11, 23, 48, 0.92)', borderWidth: 1, borderColor: 'rgba(159,232,112,0.18)',
  },
  statusCardOffline: { borderColor: 'rgba(255,184,77,0.30)' },
  statusText: { flex: 1, color: '#DCE8F8', fontSize: 12, lineHeight: 17 },
  syncButton: {
    height: 46, marginTop: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    backgroundColor: '#9FE870', shadowColor: '#9FE870', shadowOpacity: 0.32, shadowRadius: 18, shadowOffset: { width: 0, height: 10 },
  },
  syncButtonDisabled: { opacity: 0.55 },
  syncButtonText: { color: '#081225', fontSize: 13, fontWeight: '900' },
  sectionTitle: {
    color: '#A6B0CF', fontSize: 12, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase',
    marginTop: 22, marginBottom: 12,
  },
  emptyBox: {
    alignItems: 'center', gap: 10, paddingVertical: 34, borderRadius: 18,
    backgroundColor: 'rgba(11, 23, 48, 0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: { color: '#A6B0CF', fontSize: 12 },
  itemCard: {
    padding: 14, borderRadius: 18, marginBottom: 10,
    backgroundColor: 'rgba(11, 23, 48, 0.92)', borderWidth: 1, borderColor: 'rgba(110,168,255,0.20)',
  },
  itemCardError: { borderColor: 'rgba(255,107,107,0.30)' },
  itemHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  itemBadge: { height: 24, paddingHorizontal: 10, borderRadius: 12, justifyContent: 'center', borderWidth: 1 },
  itemBadgePending: { borderColor: 'rgba(110,168,255,0.4)', backgroundColor: 'rgba(110,168,255,0.10)' },
  itemBadgeError: { borderColor: 'rgba(255,107,107,0.4)', backgroundColor: 'rgba(255,107,107,0.10)' },
  itemBadgeText: { fontSize: 10, fontWeight: '900' },
  itemDetail: { color: '#A6B0CF', fontSize: 11, marginTop: 5 },
  itemError: { color: '#FF9B9B', fontSize: 11, lineHeight: 15, marginTop: 7 },
  itemActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  itemActionButton: {
    height: 34, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  itemActionText: { color: '#9FE870', fontSize: 11, fontWeight: '800' },
})
