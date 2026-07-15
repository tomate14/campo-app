import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAplicacion, createDiagnostico, createTratamiento, createVacuna, getVacunas } from '../api/ganaderia'

const VACUNAS_KEY = 'vacunas-catalogo'

export function useVacunas() {
  return useQuery({
    queryKey: [VACUNAS_KEY],
    queryFn: () => getVacunas(),
  })
}

export function useCreateVacuna() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVacuna,
    onSuccess: () => qc.invalidateQueries({ queryKey: [VACUNAS_KEY] }),
  })
}

export function useCreateAplicacion() {
  return useMutation({ mutationFn: createAplicacion })
}

export function useCreateTratamiento() {
  return useMutation({ mutationFn: createTratamiento })
}

export function useCreateDiagnostico() {
  return useMutation({ mutationFn: createDiagnostico })
}
