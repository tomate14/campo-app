import { useQuery } from '@tanstack/react-query'
import { getPotrero, getPotrerosMapa } from '../api/ganaderia'

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
