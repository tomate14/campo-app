import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { API_BASE_URL } from './api.config'
import type { ApiResponse } from './api.types'
import type {
  AsignacionMaquinaria,
  AsignacionMaquinariaRequest,
  DocumentoMaquinaria,
  DocumentoMaquinariaRequest,
  EstadoMaquinariaRequest,
  HistorialEstadoMaquinaria,
  Maquinaria,
  MaquinariaDashboard,
  MaquinariaRequest,
  MaquinariaResumen,
  UsoMaquinaria,
  UsoMaquinariaRequest,
} from '../models/maquinaria.models'

type HttpParamValue = string | number | boolean | readonly (string | number | boolean)[]

function unwrapApiResponse<T>(response: ApiResponse<T> | T): T {
  if (response !== null && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
    return (response as ApiResponse<T>).data
  }
  return response as T
}

function cleanParams(params?: Record<string, unknown>): Record<string, HttpParamValue> | undefined {
  if (!params) {
    return undefined
  }
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '') as Array<[string, HttpParamValue]>
  return entries.length ? Object.fromEntries(entries) : undefined
}

@Injectable({ providedIn: 'root' })
export class MaquinariaService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${API_BASE_URL}/maquinaria/inventario`

  getResumen(params?: { tipo?: string; estado?: string; ubicacion?: string }) {
    return this.http.get<ApiResponse<MaquinariaResumen> | MaquinariaResumen>(this.baseUrl, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getDashboard() {
    return this.http.get<ApiResponse<MaquinariaDashboard> | MaquinariaDashboard>(`${this.baseUrl}/dashboard`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getMaquinas(params?: { tipo?: string; estado?: string; ubicacion?: string }) {
    return this.http.get<ApiResponse<Maquinaria[]> | Maquinaria[]>(`${this.baseUrl}/maquinas`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getMaquina(id: string) {
    return this.http.get<ApiResponse<Maquinaria> | Maquinaria>(`${this.baseUrl}/maquinas/${id}`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createMaquina(data: MaquinariaRequest) {
    return this.http.post<ApiResponse<Maquinaria> | Maquinaria>(`${this.baseUrl}/maquinas`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  updateMaquina(id: string, data: MaquinariaRequest) {
    return this.http.put<ApiResponse<Maquinaria> | Maquinaria>(`${this.baseUrl}/maquinas/${id}`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  deleteMaquina(id: string) {
    return this.http.delete(`${this.baseUrl}/maquinas/${id}`)
  }

  updateEstado(id: string, data: EstadoMaquinariaRequest) {
    return this.http.patch<ApiResponse<Maquinaria> | Maquinaria>(`${this.baseUrl}/maquinas/${id}/estado`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getAsignaciones(maquinariaId: string) {
    return this.http.get<ApiResponse<AsignacionMaquinaria[]> | AsignacionMaquinaria[]>(`${this.baseUrl}/maquinas/${maquinariaId}/asignaciones`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getUsos(maquinariaId: string) {
    return this.http.get<ApiResponse<UsoMaquinaria[]> | UsoMaquinaria[]>(`${this.baseUrl}/maquinas/${maquinariaId}/usos`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getDocumentos(maquinariaId: string) {
    return this.http.get<ApiResponse<DocumentoMaquinaria[]> | DocumentoMaquinaria[]>(`${this.baseUrl}/maquinas/${maquinariaId}/documentos`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getHistorialEstados(maquinariaId: string) {
    return this.http.get<ApiResponse<HistorialEstadoMaquinaria[]> | HistorialEstadoMaquinaria[]>(`${this.baseUrl}/maquinas/${maquinariaId}/historial-estados`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createAsignacion(data: AsignacionMaquinariaRequest) {
    return this.http.post<ApiResponse<AsignacionMaquinaria> | AsignacionMaquinaria>(`${this.baseUrl}/asignaciones`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createUso(data: UsoMaquinariaRequest) {
    return this.http.post<ApiResponse<UsoMaquinaria> | UsoMaquinaria>(`${this.baseUrl}/usos`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createDocumento(data: DocumentoMaquinariaRequest) {
    return this.http.post<ApiResponse<DocumentoMaquinaria> | DocumentoMaquinaria>(`${this.baseUrl}/documentos`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }
}
