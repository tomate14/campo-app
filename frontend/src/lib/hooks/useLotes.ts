import { inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AgricolaService } from '../../app/core/services/agricola.service'
import type { Lote, LoteRequest } from '../types/agricola'
import { createMutationHook, createQueryHook, useInjected } from './angular-query'

export function useLotes(params?: { temporada?: string; cultivo?: string }) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getLotes(params)), [] as Lote[], true)
  })
}

export function useLote(id: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getLote(id)), null as Lote | null, !!id)
  })
}

export function useCreateLote() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((data: LoteRequest) => firstValueFrom(service.createLote(data)))
  })
}

export function useUpdateLote() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook(({ id, data }: { id: string; data: LoteRequest }) => firstValueFrom(service.updateLote(id, data)))
  })
}

export function useDeleteLote() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((id: string) => firstValueFrom(service.deleteLote(id)))
  })
}
