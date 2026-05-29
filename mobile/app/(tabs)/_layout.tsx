import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { Colors } from '../../constants/colors'

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  return (
    <View style={{
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: active ? Colors.dark.primary : 'transparent',
      borderWidth: active ? 1 : 0,
      borderColor: 'rgba(159, 232, 112, 0.34)',
    }}>
      <Text style={{ fontSize: 14, color: active ? Colors.dark.primaryForeground : Colors.dark.mutedForeground }}>{icon}</Text>
    </View>
  )
}

export default function TabsLayout() {
  const c = Colors.dark

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 12,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          borderRadius: 24,
          backgroundColor: 'rgba(6, 16, 31, 0.94)',
          borderWidth: 1,
          borderColor: c.border,
          shadowColor: '#000',
          shadowOpacity: 0.36,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 14 },
          elevation: 16,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarLabel: 'Inicio', tabBarIcon: ({ focused }) => <TabIcon icon="◆" active={focused} />, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="lotes" options={{ title: 'Lotes', tabBarLabel: 'Lotes', tabBarIcon: ({ focused }) => <TabIcon icon="◎" active={focused} /> }} />
    </Tabs>
  )
}
