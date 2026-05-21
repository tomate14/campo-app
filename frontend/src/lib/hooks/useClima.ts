import { inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ClimaService } from '../../app/core/services/clima.service'
import type { AlertaClima, DatoClima, Pronostico, RecomendacionClima } from '../types/clima'
import { createMutationHook, createQueryHook, useInjected } from './angular-query'

export function useClimaActual(loteId: string) {
  return useInjected(() => {
    const service = inject(ClimaService)
    return createQueryHook(() => firstValueFrom(service.getActual(loteId)), null as DatoClima | null, !!loteId)
  })
}

export function usePronostico(loteId: string) {
  return useInjected(() => {
    const service = inject(ClimaService)
    return createQueryHook(() => firstValueFrom(service.getPronostico(loteId)), [] as Pronostico[], !!loteId)
  })
}

export function useHistoricoClima(loteId: string, dias = 7) {
  return useInjected(() => {
    const service = inject(ClimaService)
    return createQueryHook(() => firstValueFrom(service.getHistorico(loteId, dias)), [] as DatoClima[], !!loteId)
  })
}

export function useAlertasClima(loteId: string, soloActivas = true) {
  return useInjected(() => {
    const service = inject(ClimaService)
    return createQueryHook(() => firstValueFrom(service.getAlertas(loteId, soloActivas)), [] as AlertaClima[], !!loteId)
  })
}

export function useRecomendaciones(loteId: string) {
  return useInjected(() => {
    const service = inject(ClimaService)
    return createQueryHook(() => firstValueFrom(service.getRecomendaciones(loteId)), null as RecomendacionClima | null, !!loteId)
  })
}

export function useMarcarAlertaLeida() {
  return useInjected(() => {
    const service = inject(ClimaService)
    return createMutationHook((alertaId: string) => firstValueFrom(service.marcarLeida(alertaId)))
  })
}

export function useSincronizarClima(loteId: string) {
  return useInjected(() => {
    const service = inject(ClimaService)
    return createMutationHook(() => firstValueFrom(service.sincronizar(loteId)))
  })
}
