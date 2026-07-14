import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createControlPrenez, createIndiceGenetico, createInseminacion, createMonta, createParto } from '../api/ganaderia'
import type { ControlPrenezRequest, IndiceGeneticoRequest, InseminacionRequest, MontaRequest, PartoRequest } from '../types/ganaderia'

const ANIMALES_KEY = 'animales'

export function useCreateMonta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MontaRequest) => createMonta(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANIMALES_KEY] }),
  })
}

export function useCreateInseminacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: InseminacionRequest) => createInseminacion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANIMALES_KEY] }),
  })
}

export function useCreateControlPrenez() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ControlPrenezRequest) => createControlPrenez(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANIMALES_KEY] }),
  })
}

export function useCreateParto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PartoRequest) => createParto(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANIMALES_KEY] }),
  })
}

export function useCreateIndiceGenetico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: IndiceGeneticoRequest) => createIndiceGenetico(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANIMALES_KEY] }),
  })
}
