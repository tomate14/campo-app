import 'react-native-gesture-handler'
import { Stack, useRootNavigationState } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, View, useColorScheme } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter, useSegments } from 'expo-router'
import { Colors } from '../constants/colors'
import { readAccessToken } from '../shared/auth/session'
import { configureApiClient } from '../shared/api/client'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
})

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const segments = useSegments()
  const rootNavigationState = useRootNavigationState()
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
    if (!rootNavigationState?.key) {
      return
    }

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
  }, [router, rootNavigationState?.key, segments])

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="lotes/nuevo" options={{ presentation: 'modal', headerShown: true, title: 'Nuevo lote' }} />
          <Stack.Screen name="lotes/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="agricola/nueva-siembra" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="agricola/registro-cosecha" options={{ presentation: 'modal', headerShown: true, title: 'Registrar cosecha' }} />
          <Stack.Screen name="agricola/plagas" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/potrero-form" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/nueva-reproduccion" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>

        {isBootstrapping && (
          <View style={[styles.bootstrapOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  bootstrapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
