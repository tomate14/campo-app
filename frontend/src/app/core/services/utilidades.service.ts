import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';
import type { ApiResponse, UtilidadOpcion, UtilidadOpcionRequest } from '../models/agricola.models';

// Desempaqueta el envelope { data } del backend, tolerando respuestas planas.
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

// Servicio del módulo Utilidades (feature 60): catálogos configurables por categoría.
@Injectable({ providedIn: 'root' })
export class UtilidadesService {
  private readonly http = inject(HttpClient);

  // Lista las opciones de un catálogo (ej. categoria = 'DESTINO_COSECHA').
  getUtilidadOpciones(categoria: string) {
    return this.http
      .get<ApiResponse<UtilidadOpcion[]> | UtilidadOpcion[]>(`${API_BASE_URL}/utilidades/opciones`, {
        params: { categoria },
      })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  // Da de alta una nueva opción de catálogo.
  createUtilidadOpcion(body: UtilidadOpcionRequest) {
    return this.http
      .post<ApiResponse<UtilidadOpcion> | UtilidadOpcion>(`${API_BASE_URL}/utilidades/opciones`, body)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  // Elimina una opción de catálogo por id. Feature 71: el backend ahora exige
  // la categoría como query param para validar el borrado.
  deleteUtilidadOpcion(categoria: string, id: string) {
    return this.http.delete(`${API_BASE_URL}/utilidades/opciones/${id}`, {
      params: { categoria },
    });
  }
}
