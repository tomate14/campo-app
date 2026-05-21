import { inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AgricolaService } from '../../app/core/services/agricola.service'
import type { RegistroCosecha, RegistroCosechaRequest } from '../types/agricola'
import { createMutationHook, createQueryHook, useInjected } from './angular-query'

export function useCosechasByLote(loteId: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getCosechasByLote(loteId)), [] as RegistroCosecha[], !!loteId)
  })
}

export function useRendimientoPromedio(loteId: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(
      () => firstValueFrom(service.getRendimientoPromedio(loteId)),
      null as { loteId: string; rendimientoPromedioKgHa: number } | null,
      !!loteId,
    )
  })
}

export function useCosecha(id: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getCosecha(id)), null as RegistroCosecha | null, !!id)
  })
}

export function useCreateCosecha() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((data: RegistroCosechaRequest) => firstValueFrom(service.createCosecha(data)))
  })
}

export function useUpdateCosecha() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook(({ id, data }: { id: string; data: RegistroCosechaRequest }) => firstValueFrom(service.updateCosecha(id, data)))
  })
}

export function useDeleteCosecha() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((id: string) => firstValueFrom(service.deleteCosecha(id)))
  })
}
