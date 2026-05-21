import { inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AgricolaService } from '../../app/core/services/agricola.service'
import type { EventoSiembra, EventoSiembraRequest, TipoEvento } from '../types/agricola'
import { createMutationHook, createQueryHook, useInjected } from './angular-query'

export function useEventosByLote(loteId: string, tipo?: TipoEvento) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getEventosByLote(loteId, tipo)), [] as EventoSiembra[], !!loteId)
  })
}

export function useEvento(id: string) {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createQueryHook(() => firstValueFrom(service.getEvento(id)), null as EventoSiembra | null, !!id)
  })
}

export function useCreateEvento() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((data: EventoSiembraRequest) => firstValueFrom(service.createEvento(data)))
  })
}

export function useUpdateEvento() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook(({ id, data }: { id: string; data: EventoSiembraRequest }) => firstValueFrom(service.updateEvento(id, data)))
  })
}

export function useDeleteEvento() {
  return useInjected(() => {
    const service = inject(AgricolaService)
    return createMutationHook((id: string) => firstValueFrom(service.deleteEvento(id)))
  })
}
