import { apiClient as api } from './client'
import type { ApiResponse } from '../types/agricola'
import type { DatoClima, Pronostico, AlertaClima, RecomendacionClima } from '../types/clima'

export const getClimaActual = (loteId: string) =>
  api.get<ApiResponse<DatoClima | null>>(`/clima/${loteId}/actual`).then(r => r.data.data)

export const getPronostico = (loteId: string) =>
  api.get<ApiResponse<Pronostico[]>>(`/clima/${loteId}/pronostico`).then(r => r.data.data)

export const getHistoricoClima = (loteId: string, dias = 7) =>
  api.get<ApiResponse<DatoClima[]>>(`/clima/${loteId}/historico`, { params: { dias } }).then(r => r.data.data)

export const getAlertasClima = (loteId: string, soloActivas = true) =>
  api.get<ApiResponse<AlertaClima[]>>(`/clima/${loteId}/alertas`, { params: { soloActivas } }).then(r => r.data.data)

export const marcarAlertaLeida = (alertaId: string) =>
  api.put<ApiResponse<AlertaClima>>(`/clima/alertas/${alertaId}/leer`).then(r => r.data.data)

export const getRecomendaciones = (loteId: string) =>
  api.get<ApiResponse<RecomendacionClima>>(`/clima/${loteId}/recomendaciones`).then(r => r.data.data)

export const sincronizarClima = (loteId: string) =>
  api.post<ApiResponse<DatoClima>>(`/clima/${loteId}/sincronizar`).then(r => r.data.data)
