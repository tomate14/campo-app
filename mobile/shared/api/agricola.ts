import { apiClient as api } from './client'
import type {
  ApiResponse, GeoJsonImportRequest, Lote, LoteFilters, LoteReporte, LoteRequest,
  AplicacionFitosanitaria, CatalogoPlaga, DeteccionPlaga, DeteccionPlagaRequest, SeguimientoPlaga,
  EventoSiembra, EventoSiembraRequest, TipoEvento,
  RegistroCosecha, RegistroCosechaRequest,
  PropiedadSuelo, PropiedadSueloRequest,
  HistoricoCultivo, HistoricoCultivoRequest, RotacionRecomendacion,
} from '../types/agricola'

export const getLotes = (params?: LoteFilters) =>
  api.get<ApiResponse<Lote[]>>('/agricola/lotes', { params }).then(r => r.data.data)

export const getLote = (id: string) =>
  api.get<ApiResponse<Lote>>(`/agricola/lotes/${id}`).then(r => r.data.data)

export const createLote = (data: LoteRequest) =>
  api.post<ApiResponse<Lote>>('/agricola/lotes', data).then(r => r.data.data)

export const updateLote = (id: string, data: LoteRequest) =>
  api.put<ApiResponse<Lote>>(`/agricola/lotes/${id}`, data).then(r => r.data.data)

export const exportLotesGeoJson = (params?: LoteFilters) =>
  api.get<ApiResponse<string>>('/agricola/lotes/export/geojson', { params }).then(r => r.data.data)

export const importLotesGeoJson = (data: GeoJsonImportRequest) =>
  api.post<ApiResponse<Lote[]>>('/agricola/lotes/import/geojson', data).then(r => r.data.data)

export const getReporteLote = (id: string) =>
  api.get<ApiResponse<LoteReporte>>(`/agricola/lotes/${id}/reporte`).then(r => r.data.data)

export const deleteLote = (id: string) =>
  api.delete(`/agricola/lotes/${id}`)

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

export const getCatalogoPlagas = () =>
  api.get<ApiResponse<CatalogoPlaga[]>>('/agricola/plagas/catalogo').then(r => r.data.data)

export const getDeteccionesPlaga = () =>
  api.get<ApiResponse<DeteccionPlaga[]>>('/agricola/plagas/detecciones').then(r => r.data.data)

export const createDeteccionPlaga = (data: DeteccionPlagaRequest) =>
  api.post<ApiResponse<DeteccionPlaga>>('/agricola/plagas/detecciones', data).then(r => r.data.data)

export const getAplicacionesFitosanitarias = () =>
  api.get<ApiResponse<AplicacionFitosanitaria[]>>('/agricola/plagas/aplicaciones').then(r => r.data.data)

export const getSeguimientosPlaga = () =>
  api.get<ApiResponse<SeguimientoPlaga[]>>('/agricola/plagas/seguimientos').then(r => r.data.data)
