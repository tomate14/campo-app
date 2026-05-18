import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Colors } from '@/constants/colors'

export default function TabsLayout() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarStyle:             { backgroundColor: c.background, borderTopColor: c.border },
        headerStyle:             { backgroundColor: c.background },
        headerTintColor:         c.foreground,
        headerTitleStyle:        { fontWeight: '600', fontSize: 18 },
      }}
    >
      <Tabs.Screen name="index"  options={{ title: 'Inicio',   tabBarLabel: 'Inicio' }} />
      <Tabs.Screen name="lotes"  options={{ title: 'Lotes',    tabBarLabel: 'Lotes' }} />
      <Tabs.Screen name="campo"  options={{ title: 'Campo',    tabBarLabel: 'Campo' }} />
    </Tabs>
  )
}
