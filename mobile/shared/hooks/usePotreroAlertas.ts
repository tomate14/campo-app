import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAlertaPotrero, getAlertasPotreros, resolverAlertaPotrero } from '../api/ganaderia'
import type { AlertaPotreroRequest } from '../types/ganaderia'

const ALERTAS_KEY = 'potreros-alertas'

// Alertas abiertas de potreros (feature 47). La query key debe coincidir
// exactamente con el dataset de syncDown para que los pins funcionen offline.
export function usePotreroAlertas() {
  return useQuery({
    queryKey: [ALERTAS_KEY, { estado: 'ABIERTA' }],
    queryFn: () => getAlertasPotreros({ estado: 'ABIERTA' }),
  })
}

export function useCreateAlertaPotrero() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AlertaPotreroRequest) => createAlertaPotrero(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ALERTAS_KEY] }),
  })
}

export function useResolverAlertaPotrero() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resolverAlertaPotrero(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ALERTAS_KEY] }),
  })
}
