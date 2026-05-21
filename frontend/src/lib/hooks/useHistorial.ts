import { inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AgricolaService } from '../../app/core/services/agricola.service'
import type { HistoricoCultivo, HistoricoCultivoRequest, RotacionRecomendacion } from '../types/agricola'
import { createMutationHook, createQueryHook, useInjected } from './angular-query'

export function useHistorialByLote(loteId: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getHistorialByLote(loteId)), [] as HistoricoCultivo[], !!loteId)
  })
}

export function useRotacion(loteId: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getRotacion(loteId)), null as RotacionRecomendacion | null, !!loteId)
  })
}

export function useHistorico(id: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getHistorico(id)), null as HistoricoCultivo | null, !!id)
  })
}

export function useCreateHistorico() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((data: HistoricoCultivoRequest) => firstValueFrom(service.createHistorico(data)))
  })
}

export function useUpdateHistorico() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook(({ id, data }: { id: string; data: HistoricoCultivoRequest }) => firstValueFrom(service.updateHistorico(id, data)))
  })
}

export function useDeleteHistorico() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((id: string) => firstValueFrom(service.deleteHistorico(id)))
  })
}
