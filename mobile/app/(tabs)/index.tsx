import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Colors } from '../../constants/colors'
import { clearSession } from '../../shared/auth/session'
import { useLotes } from '../../shared/hooks/useLotes'

const c = Colors.dark

const menuSections = [
  {
    title: 'AGRICULTURA',
    items: [
      { label: 'Lotes', icon: '🌱', active: true, route: '/lotes' },
      { label: 'Ciclo agrícola', icon: '📈', route: '/agricola/nueva-siembra' },
      { label: 'Analytics', icon: '📊' },
      { label: 'Plagas', icon: '🐛', route: '/agricola/plagas' },
      { label: 'Clima', icon: '🌦' },
    ],
  },
  {
    title: 'GANADERÍA',
    items: [
      { label: 'Trazabilidad', icon: '🐄' },
      { label: 'Sanidad', icon: '🛡' },
      { label: 'Reproducción', icon: '🧬' },
      { label: 'Alimentación', icon: '🌾' },
    ],
  },
  {
    title: 'MAQUINARIA',
    items: [
      { label: 'Inventario', icon: '🚜' },
      { label: 'Mantenimiento', icon: '🔧' },
    ],
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const { data: lotes, isLoading } = useLotes()
  const [collapsed, setCollapsed] = useState(false)
  const lotesCount = isLoading ? '...' : String(lotes?.length ?? 0)

  const goTo = (route?: string) => {
    if (route) {
      router.push(route as never)
    }
  }

  const logout = async () => {
    await clearSession()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.backgroundPanel, collapsed && styles.backgroundPanelCollapsed]}>
        <View style={styles.appHeader}>
          <Pressable style={styles.menuButton} onPress={() => setCollapsed(false)}><Text style={styles.menuButtonText}>☰</Text></Pressable>
          <View style={styles.headerActions}>
            <Text style={styles.bell}>◌</Text>
            <View style={styles.avatar}><Text style={styles.avatarText}>JS</Text></View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.dashboard} showsVerticalScrollIndicator={false}>
          <Text style={styles.greeting}>¡Hola, Juan!</Text>
          <Text style={styles.subtitle}>Este es el panorama de tu operación hoy.</Text>

          <View style={styles.dashboardCard}>
            <Text style={styles.cardLabel}>Clima actual</Text>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherIcon}>🌧</Text>
              <Text style={styles.weatherTemp}>18°C</Text>
            </View>
            <Text style={styles.cardMuted}>Lluvia · 20%</Text>
            <Text style={styles.cardLink}>Ver pronóstico ›</Text>
          </View>

          <View style={styles.dashboardCard}>
            <Text style={styles.cardLabel}>Lotes activos</Text>
            <Text style={styles.cardValue}>{lotesCount}</Text>
            <Text style={styles.alertText}>4 alertas</Text>
            <Text style={styles.cardMuted}>3 monitoreos pendientes</Text>
            <Text style={styles.cardLink}>Ver lotes ›</Text>
          </View>

          <View style={styles.dashboardCard}>
            <Text style={styles.cardLabel}>Animales</Text>
            <Text style={styles.cardValue}>1.248</Text>
            <Text style={styles.alertText}>2 próximos partos</Text>
            <Text style={styles.cardMuted}>4 vacunas pendientes</Text>
            <Text style={styles.cardLink}>Ver animales ›</Text>
          </View>
        </ScrollView>
      </View>

      {!collapsed && <View style={styles.depthOverlay} />}

      <View style={[styles.drawer, collapsed && styles.drawerCollapsed]}>
        <View style={styles.drawerHeader}>
          <View style={styles.logoMark}><Text style={styles.logoIcon}>↟</Text></View>
          {!collapsed && <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Campo <Text style={styles.brandAccent}>App</Text></Text>
            <Text style={styles.brandSubtitle}>AgroERP</Text>
          </View>}
          <Pressable style={styles.closeButton} onPress={() => setCollapsed((value) => !value)}><Text style={styles.closeText}>{collapsed ? '›' : '‹'}</Text></Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScroll}>
          {menuSections.map((section, index) => (
            <View key={section.title} style={[styles.menuSection, index > 0 && styles.menuSectionBorder]}>
              {!collapsed && <Text style={styles.sectionTitle}>{section.title}</Text>}
              {section.items.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => goTo(item.route)}
                  style={[styles.menuItem, item.active && styles.menuItemActive]}
                >
                  <Text style={[styles.menuIcon, item.active && styles.menuIconActive]}>{item.icon}</Text>
                  {!collapsed && <Text style={[styles.menuLabel, item.active && styles.menuLabelActive]}>{item.label}</Text>}
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.drawerFooter}>
          <Pressable style={styles.footerButton} onPress={() => setCollapsed((value) => !value)}><Text style={styles.footerIcon}>{collapsed ? '›' : '‹'}</Text>{!collapsed && <Text style={styles.footerText}>Colapsar</Text>}</Pressable>
          <Pressable style={styles.footerButton}><Text style={styles.footerIcon}>?</Text>{!collapsed && <Text style={styles.footerText}>Centro de ayuda</Text>}</Pressable>
          <Pressable style={styles.footerButton} onPress={logout}><Text style={styles.footerIcon}>→</Text>{!collapsed && <Text style={styles.footerText}>Salir</Text>}</Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.background,
    overflow: 'hidden',
  },
  backgroundPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    paddingLeft: '54%',
    backgroundColor: c.background,
  },
  backgroundPanelCollapsed: {
    paddingLeft: 94,
  },
  appHeader: {
    height: 76,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#B8C7DE',
    fontSize: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bell: {
    color: c.primary,
    fontSize: 20,
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
    paddingBottom: 110,
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
    opacity: 0.58,
  },
  cardLabel: {
    color: '#B6C6DE',
    fontSize: 12,
    fontWeight: '700',
  },
  weatherRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherIcon: {
    fontSize: 30,
  },
  weatherTemp: {
    color: c.foreground,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  cardValue: {
    marginTop: 10,
    color: c.foreground,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.4,
  },
  alertText: {
    marginTop: 4,
    color: c.orange,
    fontSize: 12,
    fontWeight: '800',
  },
  cardMuted: {
    marginTop: 4,
    color: c.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
  },
  cardLink: {
    marginTop: 16,
    color: c.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  depthOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(2, 8, 23, 0.28)',
  },
  drawer: {
    width: '65%',
    height: '100%',
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: 'rgba(6, 16, 31, 0.98)',
    borderRightWidth: 1,
    borderColor: 'rgba(110, 168, 255, 0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.48,
    shadowRadius: 34,
    shadowOffset: { width: 16, height: 0 },
    elevation: 24,
  },
  drawerCollapsed: {
    width: 86,
    paddingHorizontal: 12,
  },
  drawerHeader: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(110, 168, 255, 0.1)',
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159, 232, 112, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(159, 232, 112, 0.18)',
    shadowColor: c.primary,
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  logoIcon: {
    color: c.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  brandCopy: {
    flex: 1,
    marginLeft: 12,
  },
  brandTitle: {
    color: c.foreground,
    fontSize: 16,
    fontWeight: '800',
  },
  brandAccent: {
    color: c.primary,
  },
  brandSubtitle: {
    marginTop: 2,
    color: c.mutedForeground,
    fontSize: 11,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(110, 168, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(110, 168, 255, 0.18)',
  },
  closeText: {
    color: c.secondary,
    fontSize: 22,
    lineHeight: 22,
  },
  menuScroll: {
    paddingTop: 18,
    paddingBottom: 20,
  },
  menuSection: {
    paddingVertical: 12,
  },
  menuSectionBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(110, 168, 255, 0.08)',
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#72839E',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  menuItem: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: 'rgba(159, 232, 112, 0.08)',
    borderColor: 'rgba(159, 232, 112, 0.22)',
    shadowColor: c.primary,
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  menuIcon: {
    width: 24,
    color: c.mutedForeground,
    fontSize: 16,
  },
  menuIconActive: {
    color: c.primary,
  },
  menuLabel: {
    color: '#B7C6DC',
    fontSize: 13,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: c.foreground,
  },
  drawerFooter: {
    gap: 10,
  },
  footerButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(110, 168, 255, 0.1)',
    backgroundColor: 'rgba(7, 15, 31, 0.42)',
  },
  footerIcon: {
    width: 18,
    color: '#B5C5DB',
    fontSize: 14,
  },
  footerText: {
    color: '#AABAD2',
    fontSize: 12,
    fontWeight: '600',
  },
})
