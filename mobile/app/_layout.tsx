import 'react-native-gesture-handler'
import { Stack, useRootNavigationState } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, View, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { useRouter, useSegments } from 'expo-router'
import { Colors } from '../constants/colors'
import { clearSession, persistAccessToken, readAccessToken, readCurrentUser, readRefreshToken } from '../shared/auth/session'
import { refreshAccessToken } from '../shared/api/auth'
import { configureApiClient } from '../shared/api/client'
import { SyncProvider } from '../shared/sync/SyncProvider'
import { SyncBanner } from '../shared/components/sync-banner'

const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7 // 7 dias: replica local para operar offline

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      // El cache debe vivir al menos lo que dura la persistencia para que la
      // replica offline no se recolecte al hidratar.
      gcTime: CACHE_MAX_AGE_MS,
    },
    // Las mutaciones siempre se ejecutan: el interceptor de outbox decide que
    // hacer ante la falta de red (feature 24).
    mutations: { networkMode: 'always' },
  },
})

const cachePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'campo-app-query-cache-v1',
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
      // Renueva la sesion ante un 401 (access token vencido): sin esto la app
      // quedaba muda al expirar el token y los historiales aparecian vacios.
      refreshSession: async () => {
        const refreshToken = await readRefreshToken()
        if (!refreshToken) return null
        try {
          const newAccessToken = await refreshAccessToken(refreshToken)
          await persistAccessToken(newAccessToken)
          return newAccessToken
        } catch {
          // Refresh vencido o revocado: se limpia la sesion y el guard de
          // navegacion redirige al login en la proxima interaccion.
          await clearSession()
          return null
        }
      },
    })
  }, [])

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return
    }

    let cancelled = false

    async function syncNavigation() {
      const token = await readAccessToken()
      // Feature 39: con sesion persistida se relee el usuario para saber si el
      // cambio de contrasena inicial sigue pendiente y bloquear el resto de la app
      const user = token ? await readCurrentUser() : null
      const inAuthGroup = segments[0] === '(auth)'
      // Cast necesario: los tipos generados de expo-router se actualizan recien al correr el dev server
      const inChangePassword = inAuthGroup && (segments[1] as string) === 'cambiar-password'
      const mustChangePassword = user?.mustChangePassword === true

      if (cancelled) {
        return
      }

      if (!token && !inAuthGroup) {
        router.replace('/(auth)/login')
      } else if (token && mustChangePassword && !inChangePassword) {
        router.replace('/(auth)/cambiar-password' as never)
      } else if (token && !mustChangePassword && inAuthGroup) {
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: cachePersister, maxAge: CACHE_MAX_AGE_MS }}
    >
      <SyncProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="lotes/nuevo" options={{ presentation: 'modal', headerShown: true, title: 'Nuevo lote' }} />
          <Stack.Screen name="lotes/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="ndvi/[loteId]" options={{ headerShown: false }} />
          <Stack.Screen name="agricola/nueva-siembra" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="agricola/registro-cosecha" options={{ presentation: 'modal', headerShown: true, title: 'Registrar cosecha' }} />
          <Stack.Screen name="agricola/plagas" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="agricola/ordenes-aplicacion" options={{ headerShown: true, title: 'Órdenes de aplicación' }} />
          <Stack.Screen name="ganaderia/potrero-form" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/nueva-reproduccion" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/nueva-trazabilidad" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/nueva-sanidad" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/nueva-alimentacion" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/nueva-alerta" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ganaderia/animal-historial" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="sync/pendientes" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>

        <SyncBanner />

        {isBootstrapping && (
          <View style={[styles.bootstrapOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </SyncProvider>
    </PersistQueryClientProvider>
  )
}

const styles = StyleSheet.create({
  bootstrapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
