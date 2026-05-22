import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';
import type { ApiResponse } from './api.types';
import type {
  Animal,
  AnimalDetalle,
  AnimalRequest,
  HistorialMedicoAnimal,
  HistorialMedicoAnimalRequest,
  MovimientoAnimal,
  MovimientoAnimalRequest,
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
}
