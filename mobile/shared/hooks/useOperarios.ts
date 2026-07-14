import { useQuery } from '@tanstack/react-query'
import { getOperarios } from '../api/operarios'

const OPERARIOS_KEY = 'operarios'

export function useOperarios(params?: { search?: string; estado?: string }) {
  return useQuery({
    queryKey: [OPERARIOS_KEY, params],
    queryFn: () => getOperarios(params),
  })
}
