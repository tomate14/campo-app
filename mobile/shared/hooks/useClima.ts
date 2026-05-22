import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClimaActual, getPronostico, getHistoricoClima,
  getAlertasClima, marcarAlertaLeida, getRecomendaciones, sincronizarClima,
} from '../api/clima'

export const useClimaActual = (loteId: string) =>
  useQuery({
    queryKey: ['clima-actual', loteId],
    queryFn: () => getClimaActual(loteId),
    enabled: !!loteId,
    staleTime: 5 * 60 * 1000,
  })

export const usePronostico = (loteId: string) =>
  useQuery({
    queryKey: ['clima-pronostico', loteId],
    queryFn: () => getPronostico(loteId),
    enabled: !!loteId,
    staleTime: 30 * 60 * 1000,
  })

export const useHistoricoClima = (loteId: string, dias = 7) =>
  useQuery({
    queryKey: ['clima-historico', loteId, dias],
    queryFn: () => getHistoricoClima(loteId, dias),
    enabled: !!loteId,
  })

export const useAlertasClima = (loteId: string, soloActivas = true) =>
  useQuery({
    queryKey: ['clima-alertas', loteId, soloActivas],
    queryFn: () => getAlertasClima(loteId, soloActivas),
    enabled: !!loteId,
  })

export const useRecomendaciones = (loteId: string) =>
  useQuery({
    queryKey: ['clima-recomendaciones', loteId],
    queryFn: () => getRecomendaciones(loteId),
    enabled: !!loteId,
    staleTime: 10 * 60 * 1000,
  })

export const useMarcarAlertaLeida = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (alertaId: string) => marcarAlertaLeida(alertaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clima-alertas', loteId] }),
  })
}

export const useSincronizarClima = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => sincronizarClima(loteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clima-actual', loteId] })
      qc.invalidateQueries({ queryKey: ['clima-pronostico', loteId] })
      qc.invalidateQueries({ queryKey: ['clima-alertas', loteId] })
      qc.invalidateQueries({ queryKey: ['clima-recomendaciones', loteId] })
    },
  })
}
