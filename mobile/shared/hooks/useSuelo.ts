import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSueloByLote, getUltimoAnalisis, getSuelo,
  createSuelo, updateSuelo, deleteSuelo,
} from '../api/agricola'
import type { PropiedadSueloRequest } from '../types/agricola'

export const useSueloByLote = (loteId: string) =>
  useQuery({
    queryKey: ['suelo', loteId],
    queryFn: () => getSueloByLote(loteId),
    enabled: !!loteId,
  })

export const useUltimoAnalisis = (loteId: string) =>
  useQuery({
    queryKey: ['suelo-ultimo', loteId],
    queryFn: () => getUltimoAnalisis(loteId),
    enabled: !!loteId,
  })

export const useSuelo = (id: string) =>
  useQuery({
    queryKey: ['suelo-item', id],
    queryFn: () => getSuelo(id),
    enabled: !!id,
  })

export const useCreateSuelo = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PropiedadSueloRequest) => createSuelo(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suelo', loteId] })
      qc.invalidateQueries({ queryKey: ['suelo-ultimo', loteId] })
    },
  })
}

export const useUpdateSuelo = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PropiedadSueloRequest }) => updateSuelo(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suelo', loteId] })
      qc.invalidateQueries({ queryKey: ['suelo-ultimo', loteId] })
    },
  })
}

export const useDeleteSuelo = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSuelo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suelo', loteId] })
      qc.invalidateQueries({ queryKey: ['suelo-ultimo', loteId] })
    },
  })
}
