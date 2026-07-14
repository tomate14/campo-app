import { useQuery } from '@tanstack/react-query'
import { getAnimales } from '../api/ganaderia'

const ANIMALES_KEY = 'animales'

export function useAnimales(params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) {
  return useQuery({
    queryKey: [ANIMALES_KEY, params],
    queryFn: () => getAnimales(params),
  })
}
