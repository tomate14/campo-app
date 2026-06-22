import { apiClient as api } from './client'
import type { ApiResponse, Potrero } from '../types/ganaderia'

export const getPotrerosMapa = () =>
  api.get<ApiResponse<Potrero[]>>('/ganaderia/potreros/mapa').then(r => r.data.data)

export const getPotreros = () =>
  api.get<ApiResponse<Potrero[]>>('/ganaderia/potreros').then(r => r.data.data)

export const getPotrero = (id: string) =>
  api.get<ApiResponse<Potrero>>(`/ganaderia/potreros/${id}`).then(r => r.data.data)
