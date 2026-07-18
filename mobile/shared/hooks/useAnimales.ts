import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAnimal, getAnimales, getAnimalesPage } from '../api/ganaderia'
import type { AnimalRequest } from '../types/ganaderia'

const ANIMALES_KEY = 'animales'

export function useAnimales(params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) {
  return useQuery({
    queryKey: [ANIMALES_KEY, params],
    queryFn: () => getAnimales(params),
  })
}

// Listado paginado server-side; placeholderData mantiene la pagina anterior visible mientras carga la nueva.
export function useAnimalesPage(params?: { caravana?: string; potreroId?: string; estado?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: [ANIMALES_KEY, 'page', params],
    queryFn: () => getAnimalesPage(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateAnimal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AnimalRequest) => createAnimal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANIMALES_KEY] }),
  })
}
