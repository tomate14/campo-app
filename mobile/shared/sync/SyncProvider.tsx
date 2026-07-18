import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AppState } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { initConnectivity, isOnline, subscribeConnectivity } from './connectivity'
import { setOnOfflineEnqueued, setupOfflineOutbox } from './offlineInterceptor'
import { outboxCounts, subscribeOutbox } from './outbox'
import { getLastSyncAt, isSyncingDown, runSyncDown, subscribeSyncDown } from './syncDown'
import { drainOutbox } from './syncUp'

type SyncStatus = {
  online: boolean
  pendingCount: number
  errorCount: number
  lastSyncAt: string | null
  syncing: boolean
  syncNow: () => Promise<void>
}

const SyncContext = createContext<SyncStatus>({
  online: true,
  pendingCount: 0,
  errorCount: 0,
  lastSyncAt: null,
  syncing: false,
  syncNow: async () => undefined,
})

export function useSyncStatus() {
  return useContext(SyncContext)
}

// Orquestador de la feature 24: registra el interceptor de encolado, conecta
// NetInfo, y dispara subida (outbox) + bajada (replica local) en cada ventana
// de conectividad: ingreso a la app, reconexion y regreso al foreground.
export function SyncProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [online, setOnline] = useState(isOnline())
  const [pendingCount, setPendingCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const refreshCounts = useCallback(() => {
    void outboxCounts().then(({ pending, errors }) => {
      setPendingCount(pending)
      setErrorCount(errors)
    })
  }, [])

  const syncNow = useCallback(async () => {
    await drainOutbox(queryClient)
    await runSyncDown(queryClient)
    setLastSyncAt(await getLastSyncAt())
  }, [queryClient])

  useEffect(() => {
    setupOfflineOutbox()
    setOnOfflineEnqueued(refreshCounts)
    return () => setOnOfflineEnqueued(null)
  }, [refreshCounts])

  useEffect(() => {
    const unsubscribeNetInfo = initConnectivity()
    const unsubscribeConnectivity = subscribeConnectivity((next) => {
      setOnline(next)
      if (next) void syncNow()
    })
    const unsubscribeOutbox = subscribeOutbox(refreshCounts)
    const unsubscribeSyncDown = subscribeSyncDown(() => {
      setSyncing(isSyncingDown())
      void getLastSyncAt().then(setLastSyncAt)
    })

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isOnline()) void syncNow()
    })

    refreshCounts()
    void getLastSyncAt().then(setLastSyncAt)
    void syncNow()

    return () => {
      unsubscribeNetInfo()
      unsubscribeConnectivity()
      unsubscribeOutbox()
      unsubscribeSyncDown()
      appStateSubscription.remove()
    }
  }, [queryClient, refreshCounts, syncNow])

  const value = useMemo(
    () => ({ online, pendingCount, errorCount, lastSyncAt, syncing, syncNow }),
    [online, pendingCount, errorCount, lastSyncAt, syncing, syncNow]
  )

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}
