import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'

let online = true
const listeners = new Set<(online: boolean) => void>()

// Conecta NetInfo con el onlineManager de React Query (pausa refetches offline)
// y expone el estado a la UI. Devuelve la funcion de desuscripcion.
export function initConnectivity(): () => void {
  return NetInfo.addEventListener((state) => {
    const next = Boolean(state.isConnected && state.isInternetReachable !== false)
    onlineManager.setOnline(next)
    if (next !== online) {
      online = next
      listeners.forEach((listener) => listener(next))
    }
  })
}

export function isOnline(): boolean {
  return online
}

export function subscribeConnectivity(listener: (online: boolean) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
