import { inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AgricolaService } from '../../app/core/services/agricola.service'
import type { PropiedadSuelo, PropiedadSueloRequest } from '../types/agricola'
import { createMutationHook, createQueryHook, useInjected } from './angular-query'

export function useSueloByLote(loteId: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getSueloByLote(loteId)), [] as PropiedadSuelo[], !!loteId)
  })
}

export function useUltimoAnalisis(loteId: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getUltimoAnalisis(loteId)), null as PropiedadSuelo | null, !!loteId)
  })
}

export function useSuelo(id: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getSuelo(id)), null as PropiedadSuelo | null, !!id)
  })
}

export function useCreateSuelo() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((data: PropiedadSueloRequest) => firstValueFrom(service.createSuelo(data)))
  })
}

export function useUpdateSuelo() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook(({ id, data }: { id: string; data: PropiedadSueloRequest }) => firstValueFrom(service.updateSuelo(id, data)))
  })
}

export function useDeleteSuelo() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((id: string) => firstValueFrom(service.deleteSuelo(id)))
  })
}
