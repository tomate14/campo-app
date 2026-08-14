import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  aceptarOrdenAplicacion,
  createOrdenAplicacion,
  getOrdenesAplicacion,
  rechazarOrdenAplicacion,
  updateOrdenAplicacion,
  validarOrdenAplicacion,
} from '../api/agricola'
import type { OrdenAplicacionRequest } from '../types/agricola'

export const ORDENES_APLICACION_KEY = 'ordenes-aplicacion'

// Feature 58: ordenes de aplicacion (flujo responsable -> operario tercerizado).
export function useOrdenesAplicacion() {
  return useQuery({
    queryKey: [ORDENES_APLICACION_KEY],
    queryFn: () => getOrdenesAplicacion(),
  })
}

export function useCreateOrdenAplicacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrdenAplicacionRequest) => createOrdenAplicacion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORDENES_APLICACION_KEY] }),
  })
}

export function useUpdateOrdenAplicacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrdenAplicacionRequest }) => updateOrdenAplicacion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORDENES_APLICACION_KEY] }),
  })
}

export function useAceptarOrdenAplicacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => aceptarOrdenAplicacion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORDENES_APLICACION_KEY] }),
  })
}

export function useValidarOrdenAplicacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => validarOrdenAplicacion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORDENES_APLICACION_KEY] }),
  })
}

export function useRechazarOrdenAplicacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) => rechazarOrdenAplicacion(id, motivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORDENES_APLICACION_KEY] }),
  })
}
