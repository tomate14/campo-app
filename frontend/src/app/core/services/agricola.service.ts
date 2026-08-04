import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';
import type {
  ApiResponse,
  AgriculturaAnalytics,
  AplicacionFitosanitaria,
  AplicacionFitosanitariaRequest,
  AnalyticsFiltros,
  CatalogoPlaga,
  CatalogoPlagaRequest,
  DeteccionPlaga,
  DeteccionPlagaRequest,
  EstadoDeteccionPlaga,
  EventoSiembra,
  EventoSiembraRequest,
  HistoricoCultivo,
  HistoricoCultivoRequest,
  InsumoAgricola,
  InsumoAgricolaRequest,
  InsumosDashboard,
  LoteFilters,
  LoteReporte,
  Lote,
  LoteRequest,
  MovimientoInsumo,
  MovimientoInsumoRequest,
  PageResponse,
  PropiedadSuelo,
  PropiedadSueloRequest,
  RegistroCosecha,
  RegistroCosechaRequest,
  ResolverLoteResponse,
  ReporteAgricolaDashboard,
  RotacionRecomendacion,
  SeguimientoPlaga,
  SeguimientoPlagaRequest,
  SeveridadPlaga,
  StockInsumo,
  StockInsumoRequest,
  TipoEvento,
  PlagasDashboard,
} from '../models/agricola.models';

function unwrapApiResponse<T>(response: ApiResponse<T> | T): T {
  if (
    response !== null &&
    typeof response === 'object' &&
    'data' in (response as Record<string, unknown>)
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

type HttpParamValue = string | number | boolean | readonly (string | number | boolean)[];

function cleanParams(params?: Record<string, unknown>): Record<string, HttpParamValue> | undefined {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '') as Array<[string, HttpParamValue]>;
  return entries.length ? Object.fromEntries(entries) : undefined;
}

@Injectable({ providedIn: 'root' })
export class AgricolaService {
  private readonly http = inject(HttpClient);

  getLotes(params?: LoteFilters) {
    return this.http.get<ApiResponse<Lote[]> | Lote[]>(`${API_BASE_URL}/agricola/lotes`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getLote(id: string) {
    return this.http.get<ApiResponse<Lote> | Lote>(`${API_BASE_URL}/agricola/lotes/${id}`).pipe(map((response) => unwrapApiResponse(response)));
  }

  createLote(data: LoteRequest) {
    return this.http.post<ApiResponse<Lote> | Lote>(`${API_BASE_URL}/agricola/lotes`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  updateLote(id: string, data: LoteRequest) {
    return this.http.put<ApiResponse<Lote> | Lote>(`${API_BASE_URL}/agricola/lotes/${id}`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  exportGeoJson(params?: LoteFilters) {
    return this.http.get<ApiResponse<string> | string>(`${API_BASE_URL}/agricola/lotes/export/geojson`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  importGeoJson(geoJson: string) {
    return this.http.post<ApiResponse<Lote[]> | Lote[]>(`${API_BASE_URL}/agricola/lotes/import/geojson`, { geoJson }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getReporteLote(id: string) {
    return this.http.get<ApiResponse<LoteReporte> | LoteReporte>(`${API_BASE_URL}/agricola/lotes/${id}/reporte`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getAnalytics(params: AnalyticsFiltros) {
    return this.http.get<ApiResponse<AgriculturaAnalytics> | AgriculturaAnalytics>(`${API_BASE_URL}/agricola/analytics`, { params: cleanParams(params as unknown as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  exportAnalyticsPdf(params: AnalyticsFiltros) {
    return this.http.get(`${API_BASE_URL}/agricola/analytics/reporte.pdf`, {
      params: cleanParams(params as unknown as Record<string, unknown>),
      responseType: 'blob',
    });
  }

  deleteLote(id: string) {
    return this.http.delete(`${API_BASE_URL}/agricola/lotes/${id}`);
  }

  getEventosByLote(loteId: string, tipo?: TipoEvento) {
    return this.http.get<ApiResponse<EventoSiembra[]> | EventoSiembra[]>(`${API_BASE_URL}/agricola/siembra/lote/${loteId}`, { params: tipo ? { tipo } : undefined }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getEvento(id: string) {
    return this.http.get<ApiResponse<EventoSiembra> | EventoSiembra>(`${API_BASE_URL}/agricola/siembra/${id}`).pipe(map((response) => unwrapApiResponse(response)));
  }

  createEvento(data: EventoSiembraRequest) {
    return this.http.post<ApiResponse<EventoSiembra> | EventoSiembra>(`${API_BASE_URL}/agricola/siembra`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  updateEvento(id: string, data: EventoSiembraRequest) {
    return this.http.put<ApiResponse<EventoSiembra> | EventoSiembra>(`${API_BASE_URL}/agricola/siembra/${id}`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  deleteEvento(id: string) {
    return this.http.delete(`${API_BASE_URL}/agricola/siembra/${id}`);
  }

  getCosechasByLote(loteId: string) {
    return this.http.get<ApiResponse<RegistroCosecha[]> | RegistroCosecha[]>(`${API_BASE_URL}/agricola/cosecha/lote/${loteId}`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getCosecha(id: string) {
    return this.http.get<ApiResponse<RegistroCosecha> | RegistroCosecha>(`${API_BASE_URL}/agricola/cosecha/${id}`).pipe(map((response) => unwrapApiResponse(response)));
  }

  createCosecha(data: RegistroCosechaRequest) {
    return this.http.post<ApiResponse<RegistroCosecha> | RegistroCosecha>(`${API_BASE_URL}/agricola/cosecha`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  updateCosecha(id: string, data: RegistroCosechaRequest) {
    return this.http.put<ApiResponse<RegistroCosecha> | RegistroCosecha>(`${API_BASE_URL}/agricola/cosecha/${id}`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  deleteCosecha(id: string) {
    return this.http.delete(`${API_BASE_URL}/agricola/cosecha/${id}`);
  }

  getRendimientoPromedio(loteId: string) {
    return this.http.get<ApiResponse<{ loteId: string; rendimientoPromedioKgHa: number }> | { loteId: string; rendimientoPromedioKgHa: number }>(`${API_BASE_URL}/agricola/cosecha/lote/${loteId}/rendimiento-promedio`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getSueloByLote(loteId: string) {
    return this.http.get<ApiResponse<PropiedadSuelo[]> | PropiedadSuelo[]>(`${API_BASE_URL}/agricola/lotes/${loteId}/suelo`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getUltimoAnalisis(loteId: string) {
    return this.http.get<ApiResponse<PropiedadSuelo | null> | PropiedadSuelo | null>(`${API_BASE_URL}/agricola/lotes/${loteId}/suelo/ultimo`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getSuelo(id: string) {
    return this.http.get<ApiResponse<PropiedadSuelo> | PropiedadSuelo>(`${API_BASE_URL}/agricola/suelo/${id}`).pipe(map((response) => unwrapApiResponse(response)));
  }

  createSuelo(data: PropiedadSueloRequest) {
    return this.http.post<ApiResponse<PropiedadSuelo> | PropiedadSuelo>(`${API_BASE_URL}/agricola/suelo`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  updateSuelo(id: string, data: PropiedadSueloRequest) {
    return this.http.put<ApiResponse<PropiedadSuelo> | PropiedadSuelo>(`${API_BASE_URL}/agricola/suelo/${id}`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  deleteSuelo(id: string) {
    return this.http.delete(`${API_BASE_URL}/agricola/suelo/${id}`);
  }

  getHistorialByLote(loteId: string) {
    return this.http.get<ApiResponse<HistoricoCultivo[]> | HistoricoCultivo[]>(`${API_BASE_URL}/agricola/lotes/${loteId}/historial`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getRotacion(loteId: string) {
    return this.http.get<ApiResponse<RotacionRecomendacion> | RotacionRecomendacion>(`${API_BASE_URL}/agricola/lotes/${loteId}/rotacion`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getHistorico(id: string) {
    return this.http.get<ApiResponse<HistoricoCultivo> | HistoricoCultivo>(`${API_BASE_URL}/agricola/historial/${id}`).pipe(map((response) => unwrapApiResponse(response)));
  }

  createHistorico(data: HistoricoCultivoRequest) {
    return this.http.post<ApiResponse<HistoricoCultivo> | HistoricoCultivo>(`${API_BASE_URL}/agricola/historial`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  updateHistorico(id: string, data: HistoricoCultivoRequest) {
    return this.http.put<ApiResponse<HistoricoCultivo> | HistoricoCultivo>(`${API_BASE_URL}/agricola/historial/${id}`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  deleteHistorico(id: string) {
    return this.http.delete(`${API_BASE_URL}/agricola/historial/${id}`);
  }

  getPlagasDashboard() {
    return this.http.get<ApiResponse<PlagasDashboard> | PlagasDashboard>(`${API_BASE_URL}/agricola/plagas/dashboard`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getCatalogoPlagas(tipo?: string) {
    return this.http.get<ApiResponse<CatalogoPlaga[]> | CatalogoPlaga[]>(`${API_BASE_URL}/agricola/plagas/catalogo`, { params: tipo ? { tipo } : undefined }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getCatalogoPlagasPage(params?: { tipo?: string; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<CatalogoPlaga>> | PageResponse<CatalogoPlaga>>(`${API_BASE_URL}/agricola/plagas/catalogo/page`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  createCatalogoPlaga(data: CatalogoPlagaRequest) {
    return this.http.post<ApiResponse<CatalogoPlaga> | CatalogoPlaga>(`${API_BASE_URL}/agricola/plagas/catalogo`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  getDeteccionesPlaga(params?: { loteId?: string; estado?: EstadoDeteccionPlaga; severidad?: SeveridadPlaga; cultivo?: string }) {
    return this.http.get<ApiResponse<DeteccionPlaga[]> | DeteccionPlaga[]>(`${API_BASE_URL}/agricola/plagas/detecciones`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getDeteccionesPlagaPage(params?: { loteId?: string; estado?: EstadoDeteccionPlaga; severidad?: SeveridadPlaga; cultivo?: string; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<DeteccionPlaga>> | PageResponse<DeteccionPlaga>>(`${API_BASE_URL}/agricola/plagas/detecciones/page`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  createDeteccionPlaga(data: DeteccionPlagaRequest) {
    return this.http.post<ApiResponse<DeteccionPlaga> | DeteccionPlaga>(`${API_BASE_URL}/agricola/plagas/detecciones`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  changeDeteccionPlagaEstado(id: string, estado: EstadoDeteccionPlaga) {
    return this.http.patch<ApiResponse<DeteccionPlaga> | DeteccionPlaga>(`${API_BASE_URL}/agricola/plagas/detecciones/${id}/estado`, null, { params: { estado } }).pipe(map((response) => unwrapApiResponse(response)));
  }

  createSeguimientoPlaga(deteccionId: string, data: SeguimientoPlagaRequest) {
    return this.http.post<ApiResponse<SeguimientoPlaga> | SeguimientoPlaga>(`${API_BASE_URL}/agricola/plagas/detecciones/${deteccionId}/seguimientos`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  createAplicacionFitosanitaria(deteccionId: string, data: AplicacionFitosanitariaRequest) {
    return this.http.post<ApiResponse<AplicacionFitosanitaria> | AplicacionFitosanitaria>(`${API_BASE_URL}/agricola/plagas/detecciones/${deteccionId}/aplicaciones`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  getAplicacionesFitosanitarias() {
    return this.http.get<ApiResponse<AplicacionFitosanitaria[]> | AplicacionFitosanitaria[]>(`${API_BASE_URL}/agricola/plagas/aplicaciones`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getAplicacionesFitosanitariasPage(params?: { page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<AplicacionFitosanitaria>> | PageResponse<AplicacionFitosanitaria>>(`${API_BASE_URL}/agricola/plagas/aplicaciones/page`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getSeguimientosPlaga() {
    return this.http.get<ApiResponse<SeguimientoPlaga[]> | SeguimientoPlaga[]>(`${API_BASE_URL}/agricola/plagas/seguimientos`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getSeguimientosPlagaPage(params?: { page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<SeguimientoPlaga>> | PageResponse<SeguimientoPlaga>>(`${API_BASE_URL}/agricola/plagas/seguimientos/page`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getMapaPlagasLote(loteId: string) {
    return this.http.get<ApiResponse<DeteccionPlaga[]> | DeteccionPlaga[]>(`${API_BASE_URL}/agricola/plagas/lotes/${loteId}/mapa`).pipe(map((response) => unwrapApiResponse(response)));
  }

  resolverLotePorPunto(latitud: number, longitud: number) {
    return this.http.post<ApiResponse<ResolverLoteResponse> | ResolverLoteResponse>(`${API_BASE_URL}/agricola/plagas/geolocalizacion/resolver-lote`, { latitud, longitud }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getReporteAgricolaDashboard() {
    return this.http.get<ApiResponse<ReporteAgricolaDashboard> | ReporteAgricolaDashboard>(`${API_BASE_URL}/reportes/agricola/dashboard`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getInsumosDashboard() {
    return this.http.get<ApiResponse<InsumosDashboard> | InsumosDashboard>(`${API_BASE_URL}/inventario/insumos/dashboard`).pipe(map((response) => unwrapApiResponse(response)));
  }

  getInsumos(params?: { search?: string; tipo?: string; activo?: boolean; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<InsumoAgricola>> | PageResponse<InsumoAgricola>>(`${API_BASE_URL}/inventario/insumos`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getInsumosActivos() {
    return this.http.get<ApiResponse<InsumoAgricola[]> | InsumoAgricola[]>(`${API_BASE_URL}/inventario/insumos/activos`).pipe(map((response) => unwrapApiResponse(response)));
  }

  createInsumo(data: InsumoAgricolaRequest) {
    return this.http.post<ApiResponse<InsumoAgricola> | InsumoAgricola>(`${API_BASE_URL}/inventario/insumos`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  updateInsumo(id: string, data: InsumoAgricolaRequest) {
    return this.http.put<ApiResponse<InsumoAgricola> | InsumoAgricola>(`${API_BASE_URL}/inventario/insumos/${id}`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  deleteInsumo(id: string) {
    return this.http.delete(`${API_BASE_URL}/inventario/insumos/${id}`);
  }

  getStockInsumos(params?: { page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<StockInsumo>> | PageResponse<StockInsumo>>(`${API_BASE_URL}/inventario/insumos/stock`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getAlertasReordenInsumos(params?: { page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<InsumoAgricola>> | PageResponse<InsumoAgricola>>(`${API_BASE_URL}/inventario/insumos/alertas/reorden`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getVencimientosProximosInsumos(params?: { page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<StockInsumo>> | PageResponse<StockInsumo>>(`${API_BASE_URL}/inventario/insumos/alertas/vencimientos`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  getStockPorInsumo(insumoId: string) {
    return this.http.get<ApiResponse<StockInsumo[]> | StockInsumo[]>(`${API_BASE_URL}/inventario/insumos/${insumoId}/stock`).pipe(map((response) => unwrapApiResponse(response)));
  }

  createStockInsumo(data: StockInsumoRequest) {
    return this.http.post<ApiResponse<StockInsumo> | StockInsumo>(`${API_BASE_URL}/inventario/insumos/stock`, data).pipe(map((response) => unwrapApiResponse(response)));
  }

  getMovimientosInsumos(params?: { page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<MovimientoInsumo>> | PageResponse<MovimientoInsumo>>(`${API_BASE_URL}/inventario/insumos/movimientos`, { params: cleanParams(params as Record<string, unknown>) }).pipe(map((response) => unwrapApiResponse(response)));
  }

  createMovimientoInsumo(data: MovimientoInsumoRequest) {
    return this.http.post<ApiResponse<MovimientoInsumo> | MovimientoInsumo>(`${API_BASE_URL}/inventario/insumos/movimientos`, data).pipe(map((response) => unwrapApiResponse(response)));
  }
}
