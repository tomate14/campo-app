import { apiClient as api } from './client'
import type {
  ApiResponse, Lote, LoteRequest,
  EventoSiembra, EventoSiembraRequest, TipoEvento,
  RegistroCosecha, RegistroCosechaRequest,
  PropiedadSuelo, PropiedadSueloRequest,
  HistoricoCultivo, HistoricoCultivoRequest, RotacionRecomendacion,
} from '../types/agricola'

// Lotes
export const getLotes = (params?: { temporada?: string; cultivo?: string }) =>
  api.get<ApiResponse<Lote[]>>('/agricola/lotes', { params }).then(r => r.data.data)

export const getLote = (id: string) =>
  api.get<ApiResponse<Lote>>(`/agricola/lotes/${id}`).then(r => r.data.data)

export const createLote = (data: LoteRequest) =>
  api.post<ApiResponse<Lote>>('/agricola/lotes', data).then(r => r.data.data)

export const updateLote = (id: string, data: LoteRequest) =>
  api.put<ApiResponse<Lote>>(`/agricola/lotes/${id}`, data).then(r => r.data.data)

export const deleteLote = (id: string) =>
  api.delete(`/agricola/lotes/${id}`)

// Siembra y monitoreo
export const getEventosByLote = (loteId: string, tipo?: TipoEvento) =>
  api.get<ApiResponse<EventoSiembra[]>>(`/agricola/siembra/lote/${loteId}`, { params: { tipo } }).then(r => r.data.data)

export const getEvento = (id: string) =>
  api.get<ApiResponse<EventoSiembra>>(`/agricola/siembra/${id}`).then(r => r.data.data)

export const createEvento = (data: EventoSiembraRequest) =>
  api.post<ApiResponse<EventoSiembra>>('/agricola/siembra', data).then(r => r.data.data)

export const updateEvento = (id: string, data: EventoSiembraRequest) =>
  api.put<ApiResponse<EventoSiembra>>(`/agricola/siembra/${id}`, data).then(r => r.data.data)

export const deleteEvento = (id: string) =>
  api.delete(`/agricola/siembra/${id}`)

// Cosecha
export const getCosechasByLote = (loteId: string) =>
  api.get<ApiResponse<RegistroCosecha[]>>(`/agricola/cosecha/lote/${loteId}`).then(r => r.data.data)

export const getCosecha = (id: string) =>
  api.get<ApiResponse<RegistroCosecha>>(`/agricola/cosecha/${id}`).then(r => r.data.data)

export const createCosecha = (data: RegistroCosechaRequest) =>
  api.post<ApiResponse<RegistroCosecha>>('/agricola/cosecha', data).then(r => r.data.data)

export const updateCosecha = (id: string, data: RegistroCosechaRequest) =>
  api.put<ApiResponse<RegistroCosecha>>(`/agricola/cosecha/${id}`, data).then(r => r.data.data)

export const deleteCosecha = (id: string) =>
  api.delete(`/agricola/cosecha/${id}`)

export const getRendimientoPromedio = (loteId: string) =>
  api.get<ApiResponse<{ loteId: string; rendimientoPromedioKgHa: number }>>(
    `/agricola/cosecha/lote/${loteId}/rendimiento-promedio`
  ).then(r => r.data.data)

// Análisis de suelo
export const getSueloByLote = (loteId: string) =>
  api.get<ApiResponse<PropiedadSuelo[]>>(`/agricola/lotes/${loteId}/suelo`).then(r => r.data.data)

export const getUltimoAnalisis = (loteId: string) =>
  api.get<ApiResponse<PropiedadSuelo | null>>(`/agricola/lotes/${loteId}/suelo/ultimo`).then(r => r.data.data)

export const getSuelo = (id: string) =>
  api.get<ApiResponse<PropiedadSuelo>>(`/agricola/suelo/${id}`).then(r => r.data.data)

export const createSuelo = (data: PropiedadSueloRequest) =>
  api.post<ApiResponse<PropiedadSuelo>>('/agricola/suelo', data).then(r => r.data.data)

export const updateSuelo = (id: string, data: PropiedadSueloRequest) =>
  api.put<ApiResponse<PropiedadSuelo>>(`/agricola/suelo/${id}`, data).then(r => r.data.data)

export const deleteSuelo = (id: string) =>
  api.delete(`/agricola/suelo/${id}`)

// Historial de cultivos
export const getHistorialByLote = (loteId: string) =>
  api.get<ApiResponse<HistoricoCultivo[]>>(`/agricola/lotes/${loteId}/historial`).then(r => r.data.data)

export const getRotacion = (loteId: string) =>
  api.get<ApiResponse<RotacionRecomendacion>>(`/agricola/lotes/${loteId}/rotacion`).then(r => r.data.data)

export const getHistorico = (id: string) =>
  api.get<ApiResponse<HistoricoCultivo>>(`/agricola/historial/${id}`).then(r => r.data.data)

export const createHistorico = (data: HistoricoCultivoRequest) =>
  api.post<ApiResponse<HistoricoCultivo>>('/agricola/historial', data).then(r => r.data.data)

export const updateHistorico = (id: string, data: HistoricoCultivoRequest) =>
  api.put<ApiResponse<HistoricoCultivo>>(`/agricola/historial/${id}`, data).then(r => r.data.data)

export const deleteHistorico = (id: string) =>
  api.delete(`/agricola/historial/${id}`)
