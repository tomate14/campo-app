import { apiClient as api } from './client'
import type {
  AlertaPotrero, AlertaPotreroRequest,
  Animal, AnimalRequest, ApiResponse,
  AplicacionVacunaRequest, AplicacionVacunaResponse,
  ControlPrenezRequest, ControlPrenezResponse,
  DiagnosticoSanitarioRequest, DiagnosticoSanitarioResponse,
  Dieta, DietaRequest,
  IndiceGeneticoRequest, IndiceGeneticoResponse,
  InseminacionRequest, InseminacionResponse,
  MontaRequest, MontaResponse,
  PartoRequest, PartoResponse,
  PesajeRequest, PesajeResponse,
  Potrero, PotreroRequest,
  RazaBovina,
  RegistroAlimentacionRequest, RegistroAlimentacionResponse,
  TratamientoMedicamentoRequest, TratamientoMedicamentoResponse,
  VacunaCatalogo, VacunaCatalogoRequest,
} from '../types/ganaderia'

export const getPotrerosMapa = () =>
  api.get<ApiResponse<Potrero[]>>('/ganaderia/potreros/mapa').then(r => r.data.data)

export const getPotreros = () =>
  api.get<ApiResponse<Potrero[]>>('/ganaderia/potreros').then(r => r.data.data)

export const getPotrero = (id: string) =>
  api.get<ApiResponse<Potrero>>(`/ganaderia/potreros/${id}`).then(r => r.data.data)

export const createPotrero = (data: PotreroRequest) =>
  api.post<ApiResponse<Potrero>>('/ganaderia/potreros', data).then(r => r.data.data)

export const updatePotrero = (id: string, data: PotreroRequest) =>
  api.put<ApiResponse<Potrero>>(`/ganaderia/potreros/${id}`, data).then(r => r.data.data)

export const deletePotrero = (id: string) =>
  api.delete(`/ganaderia/potreros/${id}`)

export const getAlertasPotreros = (params?: { potreroId?: string; estado?: string }) =>
  api.get<ApiResponse<AlertaPotrero[]>>('/ganaderia/potreros/alertas', { params }).then(r => r.data.data)

export const createAlertaPotrero = (data: AlertaPotreroRequest) =>
  api.post<ApiResponse<AlertaPotrero>>('/ganaderia/potreros/alertas', data).then(r => r.data.data)

export const resolverAlertaPotrero = (id: string) =>
  api.put<ApiResponse<AlertaPotrero>>(`/ganaderia/potreros/alertas/${id}/resolver`).then(r => r.data.data)

export const getAnimales = (params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) =>
  api.get<ApiResponse<Animal[]>>('/ganaderia/trazabilidad/animales', { params }).then(r => r.data.data)

export const createAnimal = (data: AnimalRequest) =>
  api.post<ApiResponse<Animal>>('/ganaderia/trazabilidad/animales', data).then(r => r.data.data)

export const getRazasBovinas = (params?: { search?: string }) =>
  api.get<ApiResponse<RazaBovina[]>>('/ganaderia/trazabilidad/razas-bovinas', { params }).then(r => r.data.data)

export const createMonta = (data: MontaRequest) =>
  api.post<ApiResponse<MontaResponse>>('/ganaderia/reproduccion/montas', data).then(r => r.data.data)

export const createInseminacion = (data: InseminacionRequest) =>
  api.post<ApiResponse<InseminacionResponse>>('/ganaderia/reproduccion/inseminaciones', data).then(r => r.data.data)

export const createControlPrenez = (data: ControlPrenezRequest) =>
  api.post<ApiResponse<ControlPrenezResponse>>('/ganaderia/reproduccion/prenez', data).then(r => r.data.data)

export const createParto = (data: PartoRequest) =>
  api.post<ApiResponse<PartoResponse>>('/ganaderia/reproduccion/partos', data).then(r => r.data.data)

export const createIndiceGenetico = (data: IndiceGeneticoRequest) =>
  api.post<ApiResponse<IndiceGeneticoResponse>>('/ganaderia/reproduccion/indices', data).then(r => r.data.data)

export const getVacunas = (params?: { obligatoria?: boolean }) =>
  api.get<ApiResponse<VacunaCatalogo[]>>('/ganaderia/sanidad/vacunas', { params }).then(r => r.data.data)

export const createVacuna = (data: VacunaCatalogoRequest) =>
  api.post<ApiResponse<VacunaCatalogo>>('/ganaderia/sanidad/vacunas', data).then(r => r.data.data)

export const createAplicacion = (data: AplicacionVacunaRequest) =>
  api.post<ApiResponse<AplicacionVacunaResponse>>('/ganaderia/sanidad/aplicaciones', data).then(r => r.data.data)

export const createTratamiento = (data: TratamientoMedicamentoRequest) =>
  api.post<ApiResponse<TratamientoMedicamentoResponse>>('/ganaderia/sanidad/tratamientos', data).then(r => r.data.data)

export const createDiagnostico = (data: DiagnosticoSanitarioRequest) =>
  api.post<ApiResponse<DiagnosticoSanitarioResponse>>('/ganaderia/sanidad/diagnosticos', data).then(r => r.data.data)

export const getDietas = () =>
  api.get<ApiResponse<Dieta[]>>('/ganaderia/alimentacion/dietas').then(r => r.data.data)

export const createDieta = (data: DietaRequest) =>
  api.post<ApiResponse<Dieta>>('/ganaderia/alimentacion/dietas', data).then(r => r.data.data)

export const createRegistroAlimentacion = (data: RegistroAlimentacionRequest) =>
  api.post<ApiResponse<RegistroAlimentacionResponse>>('/ganaderia/alimentacion/registros', data).then(r => r.data.data)

export const createPesaje = (data: PesajeRequest) =>
  api.post<ApiResponse<PesajeResponse>>('/ganaderia/alimentacion/pesajes', data).then(r => r.data.data)
