import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';
import type {
  ApiResponse,
  EventoSiembra,
  EventoSiembraRequest,
  HistoricoCultivo,
  HistoricoCultivoRequest,
  Lote,
  LoteRequest,
  PropiedadSuelo,
  PropiedadSueloRequest,
  RegistroCosecha,
  RegistroCosechaRequest,
  RotacionRecomendacion,
  TipoEvento,
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

@Injectable({ providedIn: 'root' })
export class AgricolaService {
  private readonly http = inject(HttpClient);

  getLotes(params?: { temporada?: string; cultivo?: string }) {
    return this.http.get<ApiResponse<Lote[]> | Lote[]>(`${API_BASE_URL}/agricola/lotes`, { params: params as Record<string, string> }).pipe(map((response) => unwrapApiResponse(response)));
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
}
