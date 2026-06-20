import { apiClient as api } from './client'
import type { ApiResponse } from '../types/agricola'
import type { Operario } from '../types/operarios'

export const getOperarios = (params?: { search?: string; estado?: string }) =>
  api.get<ApiResponse<Operario[]>>('/operarios/gestion/operarios', { params }).then(r => r.data.data)
