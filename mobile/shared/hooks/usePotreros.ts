import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPotrero, deletePotrero, getPotrero, getPotrerosMapa, updatePotrero } from '../api/ganaderia'
import type { PotreroRequest } from '../types/ganaderia'

const POTREROS_KEY = 'potreros'

export function usePotrerosMapa() {
  return useQuery({
    queryKey: [POTREROS_KEY, 'mapa'],
    queryFn: getPotrerosMapa,
  })
}

export function usePotrero(id: string) {
  return useQuery({
    queryKey: [POTREROS_KEY, id],
    queryFn: () => getPotrero(id),
    enabled: Boolean(id),
  })
}

export function useCreatePotrero() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PotreroRequest) => createPotrero(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POTREROS_KEY] }),
  })
}

export function useUpdatePotrero() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PotreroRequest }) => updatePotrero(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POTREROS_KEY] }),
  })
}

export function useDeletePotrero() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePotrero(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POTREROS_KEY] }),
  })
}
