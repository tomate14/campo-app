import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';
import type { ApiResponse } from './api.types';
import type {
  AlertaPotrero,
  AlertaPotreroFilters,
  AlertaPotreroRequest,
  AplicacionVacuna,
  AplicacionVacunaRequest,
  Animal,
  AnimalDetalle,
  AnimalRequest,
  CatalogoRazaBovina,
  AlimentacionDashboard,
  AlimentacionResumen,
  DiagnosticoSanitario,
  DiagnosticoSanitarioRequest,
  Dieta,
  DietaRequest,
  HistorialMedicoAnimal,
  HistorialMedicoAnimalRequest,
  ControlPrenez,
  ControlPrenezRequest,
  GenealogiaAnimal,
  GanaderoDashboard,
  IndiceGenetico,
  IndiceGeneticoRequest,
  Inseminacion,
  InseminacionRequest,
  Monta,
  MontaRequest,
  MovimientoAnimal,
  MovimientoAnimalRequest,
  Parto,
  PartoRequest,
  PageResponse,
  Potrero,
  PotreroFilters,
  PotreroRequest,
  RecomendacionCruzamiento,
  ReproduccionDashboard,
  ReproduccionResumen,
  Pesaje,
  PesajeRequest,
  RegistroAlimentacion,
  RegistroAlimentacionRequest,
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

  getGanaderoDashboard() {
    return this.http.get<ApiResponse<GanaderoDashboard> | GanaderoDashboard>(`${API_BASE_URL}/reportes/ganaderia/dashboard`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getAnimales(params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) {
    return this.http.get<ApiResponse<Animal[]> | Animal[]>(`${API_BASE_URL}/ganaderia/trazabilidad/animales`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getAnimal(id: string) {
    return this.http.get<ApiResponse<AnimalDetalle> | AnimalDetalle>(`${API_BASE_URL}/ganaderia/trazabilidad/animales/${id}`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getRazasBovinas(search?: string) {
    return this.http.get<ApiResponse<CatalogoRazaBovina[]> | CatalogoRazaBovina[]>(`${API_BASE_URL}/ganaderia/trazabilidad/razas-bovinas`, { params: cleanParams({ search }) })
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

  getPotreros(params?: PotreroFilters) {
    return this.http.get<ApiResponse<Potrero[]> | Potrero[]>(`${API_BASE_URL}/ganaderia/potreros`, { params: cleanParams(params as Record<string, unknown>) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getPotrerosMapa() {
    return this.http.get<ApiResponse<Potrero[]> | Potrero[]>(`${API_BASE_URL}/ganaderia/potreros/mapa`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getPotrero(id: string) {
    return this.http.get<ApiResponse<Potrero> | Potrero>(`${API_BASE_URL}/ganaderia/potreros/${id}`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createPotrero(data: PotreroRequest) {
    return this.http.post<ApiResponse<Potrero> | Potrero>(`${API_BASE_URL}/ganaderia/potreros`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  updatePotrero(id: string, data: PotreroRequest) {
    return this.http.put<ApiResponse<Potrero> | Potrero>(`${API_BASE_URL}/ganaderia/potreros/${id}`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  deletePotrero(id: string) {
    return this.http.delete(`${API_BASE_URL}/ganaderia/potreros/${id}`);
  }

  getAlertasPotreros(params?: AlertaPotreroFilters) {
    return this.http.get<ApiResponse<AlertaPotrero[]> | AlertaPotrero[]>(`${API_BASE_URL}/ganaderia/potreros/alertas`, { params: cleanParams(params as Record<string, unknown>) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createAlertaPotrero(data: AlertaPotreroRequest) {
    return this.http.post<ApiResponse<AlertaPotrero> | AlertaPotrero>(`${API_BASE_URL}/ganaderia/potreros/alertas`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  resolverAlertaPotrero(id: string) {
    return this.http.put<ApiResponse<AlertaPotrero> | AlertaPotrero>(`${API_BASE_URL}/ganaderia/potreros/alertas/${id}/resolver`, {})
      .pipe(map((response) => unwrapApiResponse(response)));
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

  getAplicacionesPage(params?: { animalId?: string; vacunaId?: string; desde?: string; hasta?: string; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<AplicacionVacuna>> | PageResponse<AplicacionVacuna>>(`${API_BASE_URL}/ganaderia/sanidad/aplicaciones/page`, { params: cleanParams(params) })
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

  getTratamientosPage(params?: { animalId?: string; desde?: string; hasta?: string; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<TratamientoMedicamento>> | PageResponse<TratamientoMedicamento>>(`${API_BASE_URL}/ganaderia/sanidad/tratamientos/page`, { params: cleanParams(params) })
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

  getDiagnosticosPage(params?: { animalId?: string; estado?: string; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<DiagnosticoSanitario>> | PageResponse<DiagnosticoSanitario>>(`${API_BASE_URL}/ganaderia/sanidad/diagnosticos/page`, { params: cleanParams(params) })
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

  getReproduccionResumen(params?: { desde?: string; hasta?: string }) {
    return this.http.get<ApiResponse<ReproduccionResumen> | ReproduccionResumen>(`${API_BASE_URL}/ganaderia/reproduccion`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getReproduccionDashboard(referencia?: string) {
    return this.http.get<ApiResponse<ReproduccionDashboard> | ReproduccionDashboard>(`${API_BASE_URL}/ganaderia/reproduccion/dashboard`, { params: cleanParams({ referencia }) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createMonta(data: MontaRequest) {
    return this.http.post<ApiResponse<Monta> | Monta>(`${API_BASE_URL}/ganaderia/reproduccion/montas`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createInseminacion(data: InseminacionRequest) {
    return this.http.post<ApiResponse<Inseminacion> | Inseminacion>(`${API_BASE_URL}/ganaderia/reproduccion/inseminaciones`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createControlPrenez(data: ControlPrenezRequest) {
    return this.http.post<ApiResponse<ControlPrenez> | ControlPrenez>(`${API_BASE_URL}/ganaderia/reproduccion/prenez`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createParto(data: PartoRequest) {
    return this.http.post<ApiResponse<Parto> | Parto>(`${API_BASE_URL}/ganaderia/reproduccion/partos`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createIndiceGenetico(data: IndiceGeneticoRequest) {
    return this.http.post<ApiResponse<IndiceGenetico> | IndiceGenetico>(`${API_BASE_URL}/ganaderia/reproduccion/indices`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getGenealogia(animalId: string) {
    return this.http.get<ApiResponse<GenealogiaAnimal> | GenealogiaAnimal>(`${API_BASE_URL}/ganaderia/reproduccion/genealogia/${animalId}`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getRecomendacionesCruzamiento() {
    return this.http.get<ApiResponse<RecomendacionCruzamiento[]> | RecomendacionCruzamiento[]>(`${API_BASE_URL}/ganaderia/reproduccion/recomendaciones`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getAlimentacionResumen(params?: { desde?: string; hasta?: string }) {
    return this.http.get<ApiResponse<AlimentacionResumen> | AlimentacionResumen>(`${API_BASE_URL}/ganaderia/alimentacion`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getAlimentacionDashboard(referencia?: string) {
    return this.http.get<ApiResponse<AlimentacionDashboard> | AlimentacionDashboard>(`${API_BASE_URL}/ganaderia/alimentacion/dashboard`, { params: cleanParams({ referencia }) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getDietas() {
    return this.http.get<ApiResponse<Dieta[]> | Dieta[]>(`${API_BASE_URL}/ganaderia/alimentacion/dietas`)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createDieta(data: DietaRequest) {
    return this.http.post<ApiResponse<Dieta> | Dieta>(`${API_BASE_URL}/ganaderia/alimentacion/dietas`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getRegistrosAlimentacion(params?: { animalId?: string; desde?: string; hasta?: string }) {
    return this.http.get<ApiResponse<RegistroAlimentacion[]> | RegistroAlimentacion[]>(`${API_BASE_URL}/ganaderia/alimentacion/registros`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createRegistroAlimentacion(data: RegistroAlimentacionRequest) {
    return this.http.post<ApiResponse<RegistroAlimentacion> | RegistroAlimentacion>(`${API_BASE_URL}/ganaderia/alimentacion/registros`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getPesajes(params?: { animalId?: string; desde?: string; hasta?: string }) {
    return this.http.get<ApiResponse<Pesaje[]> | Pesaje[]>(`${API_BASE_URL}/ganaderia/alimentacion/pesajes`, { params: cleanParams(params) })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  createPesaje(data: PesajeRequest) {
    return this.http.post<ApiResponse<Pesaje> | Pesaje>(`${API_BASE_URL}/ganaderia/alimentacion/pesajes`, data)
      .pipe(map((response) => unwrapApiResponse(response)));
  }
}
