import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';
import type { ApiResponse } from './api.types';
import type {
  AplicacionVacuna,
  AplicacionVacunaRequest,
  Animal,
  AnimalDetalle,
  AnimalRequest,
  DiagnosticoSanitario,
  DiagnosticoSanitarioRequest,
  HistorialMedicoAnimal,
  HistorialMedicoAnimalRequest,
  MovimientoAnimal,
  MovimientoAnimalRequest,
  SanidadDashboard,
  TratamientoMedicamento,
  TratamientoMedicamentoRequest,
  VacunaCatalogo,
  VacunaCatalogoRequest,
} from '../models/ganaderia.models';

type HttpParamValue = string | number | boolean | readonly (string | number | boolean)[];

function unwrapApiResponse<T>(response: ApiResponse<T> | T): T {
  if (response !== null && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
}

function cleanParams(params?: Record<string, unknown>): Record<string, HttpParamValue> | undefined {
  if (!params) {
    return undefined;
  }
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '') as Array<[string, HttpParamValue]>;
  return entries.length ? Object.fromEntries(entries) : undefined;
}

@Injectable({ providedIn: 'root' })
export class GanaderiaService {
  private readonly http = inject(HttpClient);

  getAnimales(params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) {
    return this.http.get<ApiResponse<Animal[]> | Animal[]>(`${API_BASE_URL}/ganaderia/trazabilidad/animales`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getAnimal(id: string) {
    return this.http.get<ApiResponse<AnimalDetalle> | AnimalDetalle>(`${API_BASE_URL}/ganaderia/trazabilidad/animales/${id}`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createAnimal(data: AnimalRequest) {
    return this.http.post<ApiResponse<Animal> | Animal>(`${API_BASE_URL}/ganaderia/trazabilidad/animales`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  updateAnimal(id: string, data: AnimalRequest) {
    return this.http.put<ApiResponse<Animal> | Animal>(`${API_BASE_URL}/ganaderia/trazabilidad/animales/${id}`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  deleteAnimal(id: string) {
    return this.http.delete(`${API_BASE_URL}/ganaderia/trazabilidad/animales/${id}`);
  }

  createMovimiento(data: MovimientoAnimalRequest) {
    return this.http.post<ApiResponse<MovimientoAnimal> | MovimientoAnimal>(`${API_BASE_URL}/ganaderia/trazabilidad/movimientos`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createHistorialMedico(data: HistorialMedicoAnimalRequest) {
    return this.http.post<ApiResponse<HistorialMedicoAnimal> | HistorialMedicoAnimal>(`${API_BASE_URL}/ganaderia/trazabilidad/historial-medico`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  exportSenasa(estado?: string) {
    return this.http.get(`${API_BASE_URL}/ganaderia/trazabilidad/export/senasa`, {
      params: cleanParams({ estado }),
      responseType: 'text',
    });
  }

  getSanidadDashboard(referencia?: string) {
    return this.http.get<ApiResponse<SanidadDashboard> | SanidadDashboard>(`${API_BASE_URL}/ganaderia/sanidad/dashboard`, { params: cleanParams({ referencia }) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getVacunas(obligatoria?: boolean) {
    return this.http.get<ApiResponse<VacunaCatalogo[]> | VacunaCatalogo[]>(`${API_BASE_URL}/ganaderia/sanidad/vacunas`, { params: cleanParams({ obligatoria }) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createVacuna(data: VacunaCatalogoRequest) {
    return this.http.post<ApiResponse<VacunaCatalogo> | VacunaCatalogo>(`${API_BASE_URL}/ganaderia/sanidad/vacunas`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getAplicaciones(params?: { animalId?: string; vacunaId?: string; desde?: string; hasta?: string }) {
    return this.http.get<ApiResponse<AplicacionVacuna[]> | AplicacionVacuna[]>(`${API_BASE_URL}/ganaderia/sanidad/aplicaciones`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createAplicacion(data: AplicacionVacunaRequest) {
    return this.http.post<ApiResponse<AplicacionVacuna> | AplicacionVacuna>(`${API_BASE_URL}/ganaderia/sanidad/aplicaciones`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getTratamientos(params?: { animalId?: string; desde?: string; hasta?: string }) {
    return this.http.get<ApiResponse<TratamientoMedicamento[]> | TratamientoMedicamento[]>(`${API_BASE_URL}/ganaderia/sanidad/tratamientos`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createTratamiento(data: TratamientoMedicamentoRequest) {
    return this.http.post<ApiResponse<TratamientoMedicamento> | TratamientoMedicamento>(`${API_BASE_URL}/ganaderia/sanidad/tratamientos`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getDiagnosticos(params?: { animalId?: string; estado?: string }) {
    return this.http.get<ApiResponse<DiagnosticoSanitario[]> | DiagnosticoSanitario[]>(`${API_BASE_URL}/ganaderia/sanidad/diagnosticos`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createDiagnostico(data: DiagnosticoSanitarioRequest) {
    return this.http.post<ApiResponse<DiagnosticoSanitario> | DiagnosticoSanitario>(`${API_BASE_URL}/ganaderia/sanidad/diagnosticos`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  exportReporteSanitario(desde?: string, hasta?: string) {
    return this.http.get(`${API_BASE_URL}/ganaderia/sanidad/reportes/auditoria`, {
      params: cleanParams({ desde, hasta }),
      responseType: 'text',
    });
  }
}
