import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAlertaPotrero, createAlertaPotreroConFoto, getAlertasPotreros, resolverAlertaPotrero } from '../api/ganaderia'
import type { PlagaImageAsset } from '../api/agricola'
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

// Alta de alerta con foto (feature 79): multipart online. Invalida la misma key
// que el alta JSON para refrescar los pins del mapa.
export function useCreateAlertaPotreroConFoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ data, asset }: { data: AlertaPotreroRequest; asset: PlagaImageAsset }) =>
      createAlertaPotreroConFoto(data, asset),
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
