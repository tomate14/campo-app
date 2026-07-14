import { apiClient as api } from './client'
import type {
  Animal, ApiResponse,
  ControlPrenezRequest, ControlPrenezResponse,
  IndiceGeneticoRequest, IndiceGeneticoResponse,
  InseminacionRequest, InseminacionResponse,
  MontaRequest, MontaResponse,
  PartoRequest, PartoResponse,
  Potrero, PotreroRequest,
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

export const getAnimales = (params?: { caravana?: string; raza?: string; ubicacion?: string; estado?: string }) =>
  api.get<ApiResponse<Animal[]>>('/ganaderia/trazabilidad/animales', { params }).then(r => r.data.data)

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
