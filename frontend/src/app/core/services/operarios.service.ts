import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { API_BASE_URL } from './api.config'
import type { ApiResponse } from './api.types'
import type {
  Operario,
  OperarioDocumento,
  OperarioDocumentoRequest,
  OperarioHistorialRol,
  OperarioHistorialRolRequest,
  OperarioRequest,
  OperarioResumen,
} from '../models/operarios.models'

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
export class OperariosService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${API_BASE_URL}/operarios/gestion`

  getResumen(params?: { search?: string; estado?: string; rol?: string }) {
    return this.http.get<ApiResponse<OperarioResumen> | OperarioResumen>(this.baseUrl, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getOperarios(params?: { search?: string; estado?: string; rol?: string }) {
    return this.http.get<ApiResponse<Operario[]> | Operario[]>(`${this.baseUrl}/operarios`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getOperario(id: string) {
    return this.http.get<ApiResponse<Operario> | Operario>(`${this.baseUrl}/operarios/${id}`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createOperario(data: OperarioRequest) {
    return this.http.post<ApiResponse<Operario> | Operario>(`${this.baseUrl}/operarios`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  updateOperario(id: string, data: OperarioRequest) {
    return this.http.put<ApiResponse<Operario> | Operario>(`${this.baseUrl}/operarios/${id}`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  deleteOperario(id: string) {
    return this.http.delete(`${this.baseUrl}/operarios/${id}`)
  }

  createDocumento(data: OperarioDocumentoRequest) {
    return this.http.post<ApiResponse<OperarioDocumento> | OperarioDocumento>(`${this.baseUrl}/documentos`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  changeRol(data: OperarioHistorialRolRequest) {
    return this.http.post<ApiResponse<OperarioHistorialRol> | OperarioHistorialRol>(`${this.baseUrl}/roles`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }
}
