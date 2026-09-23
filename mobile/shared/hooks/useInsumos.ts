import { useQuery } from '@tanstack/react-query'
import { getInsumosActivos } from '../api/agricola'

// Feature 84: catalogo de insumos agricolas activos para el selector de la orden
// de aplicacion. La misma query key se replica en syncDown para uso offline.
export const INSUMOS_ACTIVOS_KEY = 'insumos-activos'

export function useInsumosActivos() {
  return useQuery({
    queryKey: [INSUMOS_ACTIVOS_KEY],
    queryFn: () => getInsumosActivos(),
  })
}
