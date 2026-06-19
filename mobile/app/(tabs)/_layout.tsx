import { Drawer } from 'expo-router/drawer'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import {
  CalendarDays,
  CloudSun,
  Home,
  LogOut,
  Map,
  ScanLine,
  ShieldPlus,
  Sprout,
  Tractor,
  Wheat,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native'
import { Colors } from '../../constants/colors'
import { clearSession } from '../../shared/auth/session'

const c = Colors.dark

type DrawerRoute = {
  label: string
  route?: string
  Icon: LucideIcon
}

type DrawerSection = {
  title: string
  items: DrawerRoute[]
}

const sections: DrawerSection[] = [
  {
    title: 'DASHBOARD',
    items: [{ label: 'Inicio', route: '/(tabs)', Icon: Home }],
  },
  {
    title: 'AGRICULTURA',
    items: [
      { label: 'Lotes', route: '/(tabs)/lotes', Icon: Map },
      { label: 'Ciclo agrícola', route: '/agricola/nueva-siembra', Icon: Sprout },
      { label: 'Clima', Icon: CloudSun },
    ],
  },
  {
    title: 'GANADERÍA',
    items: [
      { label: 'Trazabilidad', Icon: ScanLine },
      { label: 'Sanidad', Icon: ShieldPlus },
      { label: 'Alimentación', Icon: Wheat },
    ],
  },
  {
    title: 'MAQUINARIA',
    items: [
      { label: 'Inventario', Icon: Tractor },
      { label: 'Mantenimiento', Icon: Wrench },
    ],
  },
  {
    title: 'OPERACIONES',
    items: [{ label: 'Calendario', Icon: CalendarDays }],
  },
]

function CampoDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter()

  const goTo = (route?: string) => {
    if (!route) return
    router.push(route as never)
  }

  const logout = async () => {
    await clearSession()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.drawerShell}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}><Sprout size={22} color="#9FE870" strokeWidth={2} /></View>
          <View>
            <Text style={styles.brandTitle}>Campo <Text style={styles.brandAccent}>App</Text></Text>
            <Text style={styles.brandSubtitle}>AgroERP</Text>
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(({ label, route, Icon }) => (
              <DrawerItem
                key={label}
                label={label}
                onPress={() => goTo(route)}
                labelStyle={styles.drawerLabel}
                inactiveTintColor="#DCE8F8"
                activeTintColor="#9FE870"
                style={styles.drawerItem}
                icon={({ color }) => <Icon size={20} color={route ? color : '#6D7892'} strokeWidth={2} />}
              />
            ))}
          </View>
        ))}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <DrawerItem
          label="Salir"
          onPress={logout}
          labelStyle={styles.drawerLabel}
          inactiveTintColor="#DCE8F8"
          style={styles.drawerItem}
          icon={() => <LogOut size={20} color="#A6B0CF" strokeWidth={2} />}
        />
      </View>
    </View>
  )
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CampoDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: styles.drawer,
        overlayColor: 'rgba(0, 0, 0, 0.48)',
        swipeEnabled: true,
        drawerActiveTintColor: '#9FE870',
        drawerInactiveTintColor: '#DCE8F8',
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Inicio' }} />
      <Drawer.Screen name="lotes" options={{ title: 'Lotes' }} />
    </Drawer>
  )
}

const styles = StyleSheet.create({
  drawer: {
    width: '74%',
    backgroundColor: '#081225',
    borderRightWidth: 1,
    borderRightColor: 'rgba(159,232,112,0.12)',
  },
  drawerShell: {
    flex: 1,
    backgroundColor: '#081225',
  },
  drawerContent: {
    paddingTop: 14,
    paddingHorizontal: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,232,112,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(159,232,112,0.26)',
  },
  brandTitle: {
    color: c.foreground,
    fontSize: 15,
    fontWeight: '800',
  },
  brandAccent: {
    color: '#9FE870',
  },
  brandSubtitle: {
    color: '#A6B0CF',
    fontSize: 11,
    marginTop: 1,
  },
  section: {
    paddingTop: 12,
  },
  sectionTitle: {
    color: '#6EA8FF',
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '800',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  drawerItem: {
    borderRadius: 16,
    marginHorizontal: 0,
    marginVertical: 2,
  },
  drawerLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: -14,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
})
