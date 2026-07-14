import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDieta, createPesaje, createRegistroAlimentacion, getDietas } from '../api/ganaderia'

const DIETAS_KEY = 'dietas'

export function useDietas() {
  return useQuery({
    queryKey: [DIETAS_KEY],
    queryFn: () => getDietas(),
  })
}

export function useCreateDieta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDieta,
    onSuccess: () => qc.invalidateQueries({ queryKey: [DIETAS_KEY] }),
  })
}

export function useCreateRegistroAlimentacion() {
  return useMutation({ mutationFn: createRegistroAlimentacion })
}

export function useCreatePesaje() {
  return useMutation({ mutationFn: createPesaje })
}
