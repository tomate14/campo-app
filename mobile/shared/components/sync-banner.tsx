import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CloudOff, RefreshCw, UploadCloud } from 'lucide-react-native'
import { useSyncStatus } from '../sync/SyncProvider'

// Pildora global de estado de sincronizacion (feature 24). Solo aparece cuando
// hay algo que comunicar: sin conexion, items pendientes/errores o sync en curso.
export function SyncBanner() {
  const { online, pendingCount, errorCount, syncing } = useSyncStatus()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const total = pendingCount + errorCount
  if (online && total === 0 && !syncing) return null

  const { Icon, text, accent } = bannerContent(online, total, errorCount, syncing)

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 6 }]}>
      <Pressable
        style={[styles.pill, { borderColor: `${accent}55`, shadowColor: accent }]}
        onPress={() => router.push('/sync/pendientes' as never)}
      >
        <Icon size={14} color={accent} strokeWidth={2.2} />
        <Text style={styles.text}>{text}</Text>
        {total > 0 && (
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{total}</Text>
          </View>
        )}
      </Pressable>
    </View>
  )
}

function bannerContent(online: boolean, total: number, errors: number, syncing: boolean) {
  if (!online) {
    return {
      Icon: CloudOff,
      text: total > 0 ? 'Sin conexion · registros en cola' : 'Sin conexion · modo offline',
      accent: '#FFB84D',
    }
  }
  if (errors > 0) {
    return { Icon: UploadCloud, text: 'Registros con error de sincronizacion', accent: '#FF6B6B' }
  }
  if (total > 0) {
    return { Icon: UploadCloud, text: 'Sincronizando registros pendientes', accent: '#6EA8FF' }
  }
  return { Icon: RefreshCw, text: 'Sincronizando datos del campo...', accent: '#9FE870' }
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 12000,
    elevation: 12000,
  },
  pill: {
    maxWidth: '86%',
    minHeight: 34,
    paddingHorizontal: 13,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8, 18, 37, 0.94)',
    borderWidth: 1,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  text: {
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '700',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#081225',
    fontSize: 10,
    fontWeight: '900',
  },
})
