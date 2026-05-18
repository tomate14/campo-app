import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
})

export default function RootLayout() {
  const colorScheme = useColorScheme()

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
