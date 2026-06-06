import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { API_BASE_URL } from './api.config'
import type { ApiResponse } from './api.types'
import type {
  OrdenTrabajo,
  OrdenTrabajoActividadRequest,
  OrdenTrabajoCierreRequest,
  OrdenTrabajoEstado,
  OrdenTrabajoEstadoRequest,
  OrdenTrabajoPrioridad,
  OrdenTrabajoRequest,
  OrdenTrabajoResumen,
} from '../models/ordenes-trabajo.models'

type HttpParamValue = string | number | boolean | readonly (string | number | boolean)[]

function unwrapApiResponse<T>(response: ApiResponse<T> | T): T {
  if (response !== null && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
    return (response as ApiResponse<T>).data
  }
  return response as T
}

function cleanParams(params?: Record<string, unknown>): Record<string, HttpParamValue> | undefined {
  if (!params) return undefined
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '') as Array<[string, HttpParamValue]>
  return entries.length ? Object.fromEntries(entries) : undefined
}

@Injectable({ providedIn: 'root' })
export class OrdenesTrabajoService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${API_BASE_URL}/operarios/ordenes`

  getResumen(params?: { search?: string; estado?: OrdenTrabajoEstado | ''; operarioId?: string; loteId?: string; prioridad?: OrdenTrabajoPrioridad | ''; fechaInicio?: string; fechaFin?: string }) {
    return this.http.get<ApiResponse<OrdenTrabajoResumen> | OrdenTrabajoResumen>(`${this.baseUrl}/resumen`, { params: cleanParams(params as Record<string, unknown>) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  create(data: OrdenTrabajoRequest) {
    return this.http.post<ApiResponse<OrdenTrabajo> | OrdenTrabajo>(this.baseUrl, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  update(id: string, data: OrdenTrabajoRequest) {
    return this.http.put<ApiResponse<OrdenTrabajo> | OrdenTrabajo>(`${this.baseUrl}/${id}`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  changeEstado(id: string, data: OrdenTrabajoEstadoRequest) {
    return this.http.patch<ApiResponse<OrdenTrabajo> | OrdenTrabajo>(`${this.baseUrl}/${id}/estado`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createActividad(id: string, data: OrdenTrabajoActividadRequest) {
    return this.http.post<ApiResponse<OrdenTrabajo> | OrdenTrabajo>(`${this.baseUrl}/${id}/actividades`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  aceptar(id: string, data: OrdenTrabajoCierreRequest) {
    return this.http.post<ApiResponse<OrdenTrabajo> | OrdenTrabajo>(`${this.baseUrl}/${id}/aceptar`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  rechazar(id: string, data: OrdenTrabajoCierreRequest) {
    return this.http.post<ApiResponse<OrdenTrabajo> | OrdenTrabajo>(`${this.baseUrl}/${id}/rechazar`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }
}
