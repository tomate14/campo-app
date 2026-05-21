import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';
import type { ApiResponse } from '../models/agricola.models';
import type { AlertaClima, DatoClima, Pronostico, RecomendacionClima } from '../models/clima.models';

@Injectable({ providedIn: 'root' })
export class ClimaService {
  private readonly http = inject(HttpClient);

  getActual(loteId: string) {
    return this.http.get<ApiResponse<DatoClima | null>>(`${API_BASE_URL}/clima/${loteId}/actual`).pipe(map((response) => response.data));
  }

  getPronostico(loteId: string) {
    return this.http.get<ApiResponse<Pronostico[]>>(`${API_BASE_URL}/clima/${loteId}/pronostico`).pipe(map((response) => response.data));
  }

  getHistorico(loteId: string, dias = 7) {
    return this.http.get<ApiResponse<DatoClima[]>>(`${API_BASE_URL}/clima/${loteId}/historico`, { params: { dias } }).pipe(map((response) => response.data));
  }

  getAlertas(loteId: string, soloActivas = true) {
    return this.http.get<ApiResponse<AlertaClima[]>>(`${API_BASE_URL}/clima/${loteId}/alertas`, { params: { soloActivas } }).pipe(map((response) => response.data));
  }

  marcarLeida(alertaId: string) {
    return this.http.put<ApiResponse<AlertaClima>>(`${API_BASE_URL}/clima/alertas/${alertaId}/leer`, {}).pipe(map((response) => response.data));
  }

  getRecomendaciones(loteId: string) {
    return this.http.get<ApiResponse<RecomendacionClima>>(`${API_BASE_URL}/clima/${loteId}/recomendaciones`).pipe(map((response) => response.data));
  }

  sincronizar(loteId: string) {
    return this.http.post<ApiResponse<DatoClima>>(`${API_BASE_URL}/clima/${loteId}/sincronizar`, {}).pipe(map((response) => response.data));
  }
}
