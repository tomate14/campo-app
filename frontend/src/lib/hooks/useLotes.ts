import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLotes, getLote, createLote, updateLote, deleteLote } from '../api/agricola'
import type { LoteRequest } from '../types/agricola'

const LOTES_KEY = 'lotes'

export function useLotes(params?: { temporada?: string; cultivo?: string }) {
  return useQuery({
    queryKey: [LOTES_KEY, params],
    queryFn: () => getLotes(params),
  })
}

export function useLote(id: string) {
  return useQuery({
    queryKey: [LOTES_KEY, id],
    queryFn: () => getLote(id),
    enabled: !!id,
  })
}

export function useCreateLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LoteRequest) => createLote(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LOTES_KEY] }),
  })
}

export function useUpdateLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LoteRequest }) => updateLote(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LOTES_KEY] }),
  })
}

export function useDeleteLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LOTES_KEY] }),
  })
}
