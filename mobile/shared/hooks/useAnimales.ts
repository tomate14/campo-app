import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAnimal, getAnimales } from '../api/ganaderia'
import type { AnimalRequest } from '../types/ganaderia'

const ANIMALES_KEY = 'animales'

export function useAnimales(params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) {
  return useQuery({
    queryKey: [ANIMALES_KEY, params],
    queryFn: () => getAnimales(params),
  })
}

export function useCreateAnimal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AnimalRequest) => createAnimal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANIMALES_KEY] }),
  })
}
