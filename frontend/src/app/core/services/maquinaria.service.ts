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
  IntervencionMantenimiento,
  IntervencionMantenimientoRequest,
  Maquinaria,
  MaquinariaDashboard,
  MaquinariaRequest,
  MaquinariaResumen,
  MantenimientoDashboard,
  MantenimientoProgramado,
  MantenimientoProgramadoRequest,
  MantenimientoResumen,
  PlanMantenimiento,
  PlanMantenimientoRequest,
  RepuestoUtilizado,
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
  private readonly maintenanceUrl = `${API_BASE_URL}/maquinaria/mantenimiento`

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

  getMantenimientoResumen(params?: { maquinariaId?: string; estado?: string }) {
    return this.http.get<ApiResponse<MantenimientoResumen> | MantenimientoResumen>(this.maintenanceUrl, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getMantenimientoDashboard() {
    return this.http.get<ApiResponse<MantenimientoDashboard> | MantenimientoDashboard>(`${this.maintenanceUrl}/dashboard`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getPlanesMantenimiento() {
    return this.http.get<ApiResponse<PlanMantenimiento[]> | PlanMantenimiento[]>(`${this.maintenanceUrl}/planes`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createPlanMantenimiento(data: PlanMantenimientoRequest) {
    return this.http.post<ApiResponse<PlanMantenimiento> | PlanMantenimiento>(`${this.maintenanceUrl}/planes`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getProgramacionesMantenimiento(params?: { maquinariaId?: string; estado?: string }) {
    return this.http.get<ApiResponse<MantenimientoProgramado[]> | MantenimientoProgramado[]>(`${this.maintenanceUrl}/programaciones`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createProgramacionMantenimiento(data: MantenimientoProgramadoRequest) {
    return this.http.post<ApiResponse<MantenimientoProgramado> | MantenimientoProgramado>(`${this.maintenanceUrl}/programaciones`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  updateProgramacionMantenimientoEstado(id: string, estado: string) {
    return this.http.patch<ApiResponse<MantenimientoProgramado> | MantenimientoProgramado>(`${this.maintenanceUrl}/programaciones/${id}/estado`, null, { params: cleanParams({ estado }) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getIntervencionesMantenimiento(params?: { maquinariaId?: string; tipo?: string }) {
    return this.http.get<ApiResponse<IntervencionMantenimiento[]> | IntervencionMantenimiento[]>(`${this.maintenanceUrl}/intervenciones`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createIntervencionMantenimiento(data: IntervencionMantenimientoRequest) {
    return this.http.post<ApiResponse<IntervencionMantenimiento> | IntervencionMantenimiento>(`${this.maintenanceUrl}/intervenciones`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getRepuestosIntervencion(intervencionId: string) {
    return this.http.get<ApiResponse<RepuestoUtilizado[]> | RepuestoUtilizado[]>(`${this.maintenanceUrl}/intervenciones/${intervencionId}/repuestos`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }
}
