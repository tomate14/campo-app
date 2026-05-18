'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHistorialByLote, getRotacion, getHistorico,
  createHistorico, updateHistorico, deleteHistorico,
} from '../api/agricola'
import type { HistoricoCultivoRequest } from '../types/agricola'

export const useHistorialByLote = (loteId: string) =>
  useQuery({
    queryKey: ['historial', loteId],
    queryFn: () => getHistorialByLote(loteId),
    enabled: !!loteId,
  })

export const useRotacion = (loteId: string) =>
  useQuery({
    queryKey: ['rotacion', loteId],
    queryFn: () => getRotacion(loteId),
    enabled: !!loteId,
  })

export const useHistorico = (id: string) =>
  useQuery({
    queryKey: ['historial-item', id],
    queryFn: () => getHistorico(id),
    enabled: !!id,
  })

export const useCreateHistorico = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: HistoricoCultivoRequest) => createHistorico(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historial', loteId] })
      qc.invalidateQueries({ queryKey: ['rotacion', loteId] })
    },
  })
}

export const useUpdateHistorico = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HistoricoCultivoRequest }) => updateHistorico(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historial', loteId] })
      qc.invalidateQueries({ queryKey: ['rotacion', loteId] })
    },
  })
}

export const useDeleteHistorico = (loteId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteHistorico(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historial', loteId] })
      qc.invalidateQueries({ queryKey: ['rotacion', loteId] })
    },
  })
}
