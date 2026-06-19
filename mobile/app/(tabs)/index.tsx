import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { Bell, CloudRain, Map, Menu, ShieldPlus } from 'lucide-react-native'
import { Colors } from '../../constants/colors'
import { useLotes } from '../../shared/hooks/useLotes'

const c = Colors.dark

export default function HomeScreen() {
  const navigation = useNavigation()
  const { data: lotes, isLoading } = useLotes()
  const lotesCount = isLoading ? '...' : String(lotes?.length ?? 0)

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.appHeader}>
        <Pressable style={styles.menuButton} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Menu size={19} color="#DCE8F8" strokeWidth={2} />
        </Pressable>
        <View style={styles.headerActions}>
          <Bell size={19} color="#9FE870" strokeWidth={2} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.dashboard} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>¡Hola, Juan!</Text>
        <Text style={styles.subtitle}>Este es el panorama de tu operación hoy.</Text>

        <View style={styles.dashboardCard}>
          <View style={styles.cardIcon}><CloudRain size={22} color="#6EA8FF" strokeWidth={2} /></View>
          <Text style={styles.cardLabel}>Clima actual</Text>
          <Text style={styles.weatherTemp}>18°C</Text>
          <Text style={styles.cardMuted}>Lluvia · 20%</Text>
          <Text style={styles.cardLink}>Ver pronóstico</Text>
        </View>

        <View style={styles.dashboardCard}>
          <View style={styles.cardIcon}><Map size={22} color="#9FE870" strokeWidth={2} /></View>
          <Text style={styles.cardLabel}>Lotes activos</Text>
          <Text style={styles.cardValue}>{lotesCount}</Text>
          <Text style={styles.alertText}>4 alertas</Text>
          <Text style={styles.cardMuted}>3 monitoreos pendientes</Text>
          <Text style={styles.cardLink}>Ver lotes</Text>
        </View>

        <View style={styles.dashboardCard}>
          <View style={styles.cardIcon}><ShieldPlus size={22} color="#9FE870" strokeWidth={2} /></View>
          <Text style={styles.cardLabel}>Animales</Text>
          <Text style={styles.cardValue}>1.248</Text>
          <Text style={styles.alertText}>2 próximos partos</Text>
          <Text style={styles.cardMuted}>4 vacunas pendientes</Text>
          <Text style={styles.cardLink}>Ver animales</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.background,
  },
  appHeader: {
    height: 76,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 23, 48, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(110, 168, 255, 0.14)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159, 232, 112, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(159, 232, 112, 0.18)',
  },
  avatarText: {
    color: c.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  dashboard: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  greeting: {
    color: c.foreground,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 6,
    color: c.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
  },
  dashboardCard: {
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(11, 23, 48, 0.74)',
    borderWidth: 1,
    borderColor: 'rgba(110, 168, 255, 0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  cardLabel: {
    color: '#B6C6DE',
    fontSize: 12,
    fontWeight: '500',
  },
  weatherTemp: {
    color: c.foreground,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 10,
  },
  cardValue: {
    marginTop: 8,
    color: c.foreground,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  cardMuted: {
    marginTop: 4,
    color: c.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
  },
  cardLink: {
    marginTop: 12,
    color: '#6EA8FF',
    fontSize: 12,
    fontWeight: '500',
  },
  alertText: {
    marginTop: 6,
    color: '#FFB84D',
    fontSize: 12,
    fontWeight: '600',
  },
})
