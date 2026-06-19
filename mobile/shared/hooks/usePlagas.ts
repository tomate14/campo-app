import { useQuery } from '@tanstack/react-query'
import { getAplicacionesFitosanitarias, getDeteccionesPlaga, getSeguimientosPlaga } from '../api/agricola'

export const PLAGAS_DETECCIONES_KEY = 'plagas-detecciones'
export const PLAGAS_APLICACIONES_KEY = 'plagas-aplicaciones'
export const PLAGAS_SEGUIMIENTOS_KEY = 'plagas-seguimientos'

export function useDeteccionesPlaga() {
  return useQuery({
    queryKey: [PLAGAS_DETECCIONES_KEY],
    queryFn: getDeteccionesPlaga,
  })
}

export function useAplicacionesFitosanitarias() {
  return useQuery({
    queryKey: [PLAGAS_APLICACIONES_KEY],
    queryFn: getAplicacionesFitosanitarias,
  })
}

export function useSeguimientosPlaga() {
  return useQuery({
    queryKey: [PLAGAS_SEGUIMIENTOS_KEY],
    queryFn: getSeguimientosPlaga,
  })
}
