import { useQuery } from '@tanstack/react-query'
import { getUtilidadOpciones } from '../api/agricola'

// Query key estable del catalogo de Utilidades por categoria (feature 60).
// Se exporta para que syncDown replique la misma key sin duplicar strings.
export const UTILIDAD_OPCIONES_KEY = 'utilidad-opciones'

export function useUtilidadOpciones(categoria: string) {
  return useQuery({
    queryKey: [UTILIDAD_OPCIONES_KEY, categoria],
    queryFn: () => getUtilidadOpciones(categoria),
    enabled: !!categoria,
  })
}
