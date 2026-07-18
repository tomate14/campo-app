import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getAplicaciones,
  getDiagnosticos,
  getHistorialMedico,
  getMovimientos,
  getPesajes,
  getTratamientos,
} from '../api/ganaderia'
import type {
  AplicacionVacunaResponse,
  DiagnosticoSanitarioResponse,
  HistorialMedicoAnimalResponse,
  MovimientoAnimalResponse,
  PesajeResponse,
  TratamientoMedicamentoResponse,
} from '../types/ganaderia'

const HISTORIAL_KEY = 'animal-historial'

// Tipos de historial consultables desde la ficha del animal (feature 50).
// Cada tipo se consulta bulk (una query key estable por coleccion) para que
// la sync down (feature 24) replique el historial completo y la pantalla lo
// lea offline; el filtrado por animal se hace client-side.
export type HistorialTipo = 'CLINICO' | 'PESOS' | 'MOVIMIENTOS' | 'VACUNAS' | 'TRATAMIENTOS' | 'DIAGNOSTICOS'

export type HistorialData = {
  CLINICO: HistorialMedicoAnimalResponse[]
  PESOS: PesajeResponse[]
  MOVIMIENTOS: MovimientoAnimalResponse[]
  VACUNAS: AplicacionVacunaResponse[]
  TRATAMIENTOS: TratamientoMedicamentoResponse[]
  DIAGNOSTICOS: DiagnosticoSanitarioResponse[]
}

// Fetchers bulk sin filtro de animal: la misma funcion que usa syncDown, asi
// la replica hidratada del cache persistido responde estas queries sin red.
const fetchers: { [T in HistorialTipo]: () => Promise<HistorialData[T]> } = {
  CLINICO: () => getHistorialMedico(),
  PESOS: () => getPesajes(),
  MOVIMIENTOS: () => getMovimientos(),
  VACUNAS: () => getAplicaciones(),
  TRATAMIENTOS: () => getTratamientos(),
  DIAGNOSTICOS: () => getDiagnosticos(),
}

// Hook parametrizado: una query bulk por tipo (key SIN animalId — es la que
// replica syncDown) + filtrado en memoria por el animal de la ficha.
export function useAnimalHistorial<T extends HistorialTipo>(tipo: T, animalId?: string) {
  const query = useQuery<HistorialData[T]>({
    queryKey: [HISTORIAL_KEY, tipo],
    queryFn: fetchers[tipo],
    enabled: Boolean(animalId),
  })

  const data = useMemo<HistorialData[T] | undefined>(() => {
    if (!query.data || !animalId) return undefined
    // Todos los responses de historial exponen animalId (directo o via su Request).
    const items = query.data as Array<{ animalId: string }>
    return items.filter((item) => item.animalId === animalId) as HistorialData[T]
  }, [query.data, animalId])

  return { ...query, data }
}
