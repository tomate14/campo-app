import { useQuery } from '@tanstack/react-query'
import {
  getAplicaciones,
  getDiagnosticos,
  getHistorialMedicoAnimal,
  getMovimientosAnimal,
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
// Se piden on-demand: NO entran en la sync down offline (decision de la spec).
export type HistorialTipo = 'CLINICO' | 'PESOS' | 'MOVIMIENTOS' | 'VACUNAS' | 'TRATAMIENTOS' | 'DIAGNOSTICOS'

export type HistorialData = {
  CLINICO: HistorialMedicoAnimalResponse[]
  PESOS: PesajeResponse[]
  MOVIMIENTOS: MovimientoAnimalResponse[]
  VACUNAS: AplicacionVacunaResponse[]
  TRATAMIENTOS: TratamientoMedicamentoResponse[]
  DIAGNOSTICOS: DiagnosticoSanitarioResponse[]
}

const fetchers: { [T in HistorialTipo]: (animalId: string) => Promise<HistorialData[T]> } = {
  CLINICO: (animalId) => getHistorialMedicoAnimal(animalId),
  PESOS: (animalId) => getPesajes({ animalId }),
  MOVIMIENTOS: (animalId) => getMovimientosAnimal(animalId),
  VACUNAS: (animalId) => getAplicaciones({ animalId }),
  TRATAMIENTOS: (animalId) => getTratamientos({ animalId }),
  DIAGNOSTICOS: (animalId) => getDiagnosticos({ animalId }),
}

// Hook parametrizado: una sola query por tipo + animal, habilitada recien
// cuando hay animalId (la pantalla modal recibe los params por la ruta).
export function useAnimalHistorial<T extends HistorialTipo>(tipo: T, animalId?: string) {
  return useQuery<HistorialData[T]>({
    queryKey: [HISTORIAL_KEY, tipo, animalId],
    queryFn: () => fetchers[tipo](animalId as string),
    enabled: Boolean(animalId),
  })
}
