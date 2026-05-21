import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEventosByLote, createEvento, updateEvento, deleteEvento } from '../../../frontend/src/lib/api/agricola'
import type { EventoSiembraRequest, TipoEvento } from '../../../frontend/src/lib/types/agricola'

const EVENTOS_KEY = 'eventos-siembra'

export function useEventosByLote(loteId: string, tipo?: TipoEvento) {
  return useQuery({
    queryKey: [EVENTOS_KEY, loteId, tipo],
    queryFn: () => getEventosByLote(loteId, tipo),
    enabled: !!loteId,
  })
}

export function useCreateEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EventoSiembraRequest) => createEvento(data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [EVENTOS_KEY, vars.loteId] }),
  })
}

export function useUpdateEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventoSiembraRequest }) => updateEvento(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTOS_KEY] }),
  })
}

export function useDeleteEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTOS_KEY] }),
  })
}
