import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, View, useColorScheme } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter, useSegments } from 'expo-router'
import { Colors } from '@/constants/colors'
import { readAccessToken } from '@/shared/auth/session'
import { configureApiClient } from '../../frontend/src/lib/api/client'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
})

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const segments = useSegments()
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const colors = Colors[colorScheme ?? 'light']

  useEffect(() => {
    configureApiClient({
      baseURL: process.env.EXPO_PUBLIC_API_URL ?? (
        Platform.OS === 'android'
          ? 'http://10.0.2.2:8080/api/v1'
          : 'http://localhost:8080/api/v1'
      ),
      getAccessToken: () => readAccessToken(),
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function syncNavigation() {
      const token = await readAccessToken()
      const inAuthGroup = segments[0] === '(auth)'

      if (cancelled) {
        return
      }

      if (!token && !inAuthGroup) {
        router.replace('/(auth)/login')
      } else if (token && inAuthGroup) {
        router.replace('/(tabs)')
      }

      setIsBootstrapping(false)
    }

    void syncNavigation()

    return () => {
      cancelled = true
    }
  }, [router, segments])

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="agricola/nueva-siembra" options={{ presentation: 'modal', headerShown: true, title: 'Registrar evento' }} />
        <Stack.Screen name="agricola/registro-cosecha" options={{ presentation: 'modal', headerShown: true, title: 'Registrar cosecha' }} />
      </Stack>
    </QueryClientProvider>
  )
}
