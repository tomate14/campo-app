import { apiClient as api } from './client'
import type {
  ApiResponse, GeoJsonImportRequest, Lote, LoteFilters, LoteReporte, LoteRequest,
  AplicacionFitosanitaria, AplicacionFitosanitariaRequest, CatalogoPlaga, CatalogoPlagaImagen, CatalogoPlagaRequest, DeteccionPlaga, DeteccionPlagaRequest, EspecieSimilar, PlagaSugerida, SeguimientoPlaga, SeguimientoPlagaRequest,
  EventoSiembra, EventoSiembraRequest, TipoEvento,
  RegistroCosecha, RegistroCosechaRequest,
  PropiedadSuelo, PropiedadSueloRequest,
  HistoricoCultivo, HistoricoCultivoRequest, RotacionRecomendacion,
  UtilidadOpcion,
} from '../types/agricola'

// Asset elegido con expo-image-picker que se sube al backend (feature 54).
export interface PlagaImageAsset {
  uri: string
  fileName?: string | null
  mimeType?: string | null
}

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

export const createCatalogoPlaga = (data: CatalogoPlagaRequest) =>
  api.post<ApiResponse<CatalogoPlaga>>('/agricola/plagas/catalogo', data).then(r => r.data.data)

export const updateCatalogoPlaga = (id: string, data: CatalogoPlagaRequest) =>
  api.put<ApiResponse<CatalogoPlaga>>(`/agricola/plagas/catalogo/${id}`, data).then(r => r.data.data)

// Sube una imagen (multipart) al catalogo. Solo online: no pasa por el outbox.
// No se setea Content-Type manual para que RN/axios pongan el boundary.
export const uploadCatalogoPlagaImagen = (id: string, asset: PlagaImageAsset, esPrincipal = false) => {
  const name = asset.fileName ?? `plaga-${Date.now()}.jpg`
  const type = asset.mimeType ?? 'image/jpeg'
  const formData = new FormData()
  formData.append('foto', { uri: asset.uri, name, type } as unknown as Blob)
  return api.post<ApiResponse<CatalogoPlagaImagen>>(
    `/agricola/plagas/catalogo/${id}/imagenes`,
    formData,
    { params: { esPrincipal }, skipOutbox: true },
  ).then(r => r.data.data)
}

export const getCatalogoPlagaImagenes = (id: string) =>
  api.get<ApiResponse<CatalogoPlagaImagen[]>>(`/agricola/plagas/catalogo/${id}/imagenes`).then(r => r.data.data)

export const deleteCatalogoPlagaImagen = (id: string, imagenId: string) =>
  api.delete(`/agricola/plagas/catalogo/${id}/imagenes/${imagenId}`)

export const getCatalogoPlagaSugeridas = (id: string) =>
  api.get<ApiResponse<PlagaSugerida[]>>(`/agricola/plagas/catalogo/${id}/sugeridas`).then(r => r.data.data)

// Especies similares desde el cache (feature 75): imagenUrl relativa /uploads/...
export const getCatalogoPlagaSimilares = (id: string) =>
  api.get<ApiResponse<EspecieSimilar[]>>(`/agricola/plagas/catalogo/${id}/similares`).then(r => r.data.data)

// Descubrimiento en vivo de especies similares por nombre cientifico (feature 75).
// Solo online (no pasa por el outbox): la respuesta trae miniaturas remotas de GBIF/iNat.
export const buscarSimilaresGbif = (nombreCientifico: string) =>
  api.get<ApiResponse<EspecieSimilar[]>>('/agricola/plagas/gbif/similares', {
    params: { nombreCientifico },
    skipOutbox: true,
  }).then(r => r.data.data)

export const getDeteccionesPlaga = () =>
  api.get<ApiResponse<DeteccionPlaga[]> | DeteccionPlaga[]>('/agricola/plagas/detecciones').then(r => unwrapListResponse(r.data))

export const createDeteccionPlaga = (data: DeteccionPlagaRequest) =>
  api.post<ApiResponse<DeteccionPlaga>>('/agricola/plagas/detecciones', data).then(r => r.data.data)

// Alta de deteccion con foto (feature 79): multipart con el payload JSON y la foto
// opcional. Solo online (no pasa por el outbox); el backend persiste el archivo y
// completa fotoUrl. No se setea Content-Type manual para que RN/axios pongan el boundary.
export const createDeteccionPlagaConFoto = (data: DeteccionPlagaRequest, asset: PlagaImageAsset) => {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(data))
  formData.append('foto', {
    uri: asset.uri,
    name: asset.fileName ?? 'foto.jpg',
    type: asset.mimeType ?? 'image/jpeg',
  } as unknown as Blob)
  return api.post<ApiResponse<DeteccionPlaga>>(
    '/agricola/plagas/detecciones/con-foto',
    formData,
    { skipOutbox: true },
  ).then(r => r.data.data)
}

export const createAplicacionFitosanitaria = (deteccionId: string, data: AplicacionFitosanitariaRequest) =>
  api.post<ApiResponse<AplicacionFitosanitaria>>(`/agricola/plagas/detecciones/${deteccionId}/aplicaciones`, data).then(r => r.data.data)

export const createSeguimientoPlaga = (deteccionId: string, data: SeguimientoPlagaRequest) =>
  api.post<ApiResponse<SeguimientoPlaga>>(`/agricola/plagas/detecciones/${deteccionId}/seguimientos`, data).then(r => r.data.data)

export const getAplicacionesFitosanitarias = () =>
  api.get<ApiResponse<AplicacionFitosanitaria[]>>('/agricola/plagas/aplicaciones').then(r => r.data.data)

export const getSeguimientosPlaga = () =>
  api.get<ApiResponse<SeguimientoPlaga[]>>('/agricola/plagas/seguimientos').then(r => r.data.data)

// Catalogo configurable de Utilidades (feature 60): opciones por categoria
export const getUtilidadOpciones = (categoria: string) =>
  api.get<ApiResponse<UtilidadOpcion[]>>('/utilidades/opciones', { params: { categoria } }).then(r => r.data.data)

function unwrapListResponse<T>(response: ApiResponse<T[]> | T[]): T[] {
  return Array.isArray(response) ? response : response.data
}
