import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCosechasByLote, createCosecha, updateCosecha, deleteCosecha, getRendimientoPromedio } from '../../../frontend/src/lib/api/agricola'
import type { RegistroCosechaRequest } from '../../../frontend/src/lib/types/agricola'

const COSECHAS_KEY = 'cosechas'

export function useCosechasByLote(loteId: string) {
  return useQuery({
    queryKey: [COSECHAS_KEY, loteId],
    queryFn: () => getCosechasByLote(loteId),
    enabled: !!loteId,
  })
}

export function useRendimientoPromedio(loteId: string) {
  return useQuery({
    queryKey: [COSECHAS_KEY, loteId, 'promedio'],
    queryFn: () => getRendimientoPromedio(loteId),
    enabled: !!loteId,
  })
}

export function useCreateCosecha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegistroCosechaRequest) => createCosecha(data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [COSECHAS_KEY, vars.loteId] }),
  })
}

export function useUpdateCosecha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegistroCosechaRequest }) => updateCosecha(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COSECHAS_KEY] }),
  })
}

export function useDeleteCosecha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCosecha(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COSECHAS_KEY] }),
  })
}
