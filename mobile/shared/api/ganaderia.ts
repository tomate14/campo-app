import { apiClient as api } from './client'
import type { PlagaImageAsset } from './agricola'
import type {
  AlertaPotrero, AlertaPotreroRequest,
  Animal, AnimalDetalleResponse, AnimalRequest, ApiResponse,
  AplicacionVacunaRequest, AplicacionVacunaResponse,
  ControlPrenezRequest, ControlPrenezResponse,
  DiagnosticoSanitarioRequest, DiagnosticoSanitarioResponse,
  Dieta, DietaRequest,
  HistorialMedicoAnimalResponse,
  MovimientoAnimalResponse,
  IndiceGeneticoRequest, IndiceGeneticoResponse,
  InseminacionRequest, InseminacionResponse,
  MontaRequest, MontaResponse,
  PartoRequest, PartoResponse,
  PageResponse,
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

// Alta de alerta con foto (feature 79): multipart con el payload JSON y la foto
// opcional. Solo online (no pasa por el outbox); el backend persiste el archivo y
// completa fotoUrl. No se setea Content-Type manual para que RN/axios pongan el boundary.
export const createAlertaPotreroConFoto = (data: AlertaPotreroRequest, asset: PlagaImageAsset) => {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(data))
  formData.append('foto', {
    uri: asset.uri,
    name: asset.fileName ?? 'foto.jpg',
    type: asset.mimeType ?? 'image/jpeg',
  } as unknown as Blob)
  return api.post<ApiResponse<AlertaPotrero>>(
    '/ganaderia/potreros/alertas/con-foto',
    formData,
    { skipOutbox: true },
  ).then(r => r.data.data)
}

export const resolverAlertaPotrero = (id: string) =>
  api.put<ApiResponse<AlertaPotrero>>(`/ganaderia/potreros/alertas/${id}/resolver`).then(r => r.data.data)

export const getAnimales = (params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) =>
  api.get<ApiResponse<Animal[]>>('/ganaderia/trazabilidad/animales', { params }).then(r => r.data.data)

export const getAnimalesPage = (params?: { caravana?: string; potreroId?: string; estado?: string; page?: number; size?: number }) =>
  api.get<ApiResponse<PageResponse<Animal>>>('/ganaderia/trazabilidad/animales/page', { params }).then(r => r.data.data)

export const getAnimalDetalle = (id: string) =>
  api.get<ApiResponse<AnimalDetalleResponse>>(`/ganaderia/trazabilidad/animales/${id}`).then(r => r.data.data)

// Listados bulk de trazabilidad (feature 50): sin animalId devuelven todo,
// asi la sync down replica la coleccion completa para lectura offline.
export const getMovimientos = (params?: { animalId?: string }) =>
  api.get<ApiResponse<MovimientoAnimalResponse[]>>('/ganaderia/trazabilidad/movimientos', { params }).then(r => r.data.data)

export const getHistorialMedico = (params?: { animalId?: string }) =>
  api.get<ApiResponse<HistorialMedicoAnimalResponse[]>>('/ganaderia/trazabilidad/historial-medico', { params }).then(r => r.data.data)

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

export const getAplicaciones = (params?: { animalId?: string; vacunaId?: string; desde?: string; hasta?: string }) =>
  api.get<ApiResponse<AplicacionVacunaResponse[]>>('/ganaderia/sanidad/aplicaciones', { params }).then(r => r.data.data)

export const getTratamientos = (params?: { animalId?: string; desde?: string; hasta?: string }) =>
  api.get<ApiResponse<TratamientoMedicamentoResponse[]>>('/ganaderia/sanidad/tratamientos', { params }).then(r => r.data.data)

export const getDiagnosticos = (params?: { animalId?: string; estado?: string }) =>
  api.get<ApiResponse<DiagnosticoSanitarioResponse[]>>('/ganaderia/sanidad/diagnosticos', { params }).then(r => r.data.data)

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

export const getPesajes = (params?: { animalId?: string; desde?: string; hasta?: string }) =>
  api.get<ApiResponse<PesajeResponse[]>>('/ganaderia/alimentacion/pesajes', { params }).then(r => r.data.data)

export const createPesaje = (data: PesajeRequest) =>
  api.post<ApiResponse<PesajeResponse>>('/ganaderia/alimentacion/pesajes', data).then(r => r.data.data)
