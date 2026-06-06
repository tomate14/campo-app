export type OrdenTrabajoEstado = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'RECHAZADA'
export type OrdenTrabajoPrioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'

export interface OrdenTrabajoActividad {
  id: string
  ordenId: string
  operarioId?: string
  operarioNombre?: string
  tipo: string
  descripcion: string
  inicio?: string
  fin?: string
  duracionMin?: number
  estado: string
  evidenciaUrl?: string
  observaciones?: string
  createdAt: string
}

export interface OrdenTrabajoHistorial {
  id: string
  ordenId: string
  estadoAnterior?: string
  estadoNuevo: string
  accion: string
  responsable?: string
  observaciones?: string
  createdAt: string
}

export interface OrdenTrabajo {
  id: string
  codigo: string
  titulo: string
  descripcion?: string
  loteId?: string
  loteNombre?: string
  zona?: string
  operarioId: string
  operarioNombre: string
  prioridad: OrdenTrabajoPrioridad
  estado: OrdenTrabajoEstado
  fechaProgramada?: string
  fechaInicio?: string
  fechaFinEstimada?: string
  fechaFinReal?: string
  duracionEstimadaMin?: number
  duracionRealMin?: number
  resultado?: string
  motivoRechazo?: string
  observaciones?: string
  actividades: OrdenTrabajoActividad[]
  historial: OrdenTrabajoHistorial[]
  createdAt: string
  updatedAt: string
}

export interface OrdenTrabajoRequest {
  titulo: string
  descripcion?: string
  loteId?: string
  zona?: string
  operarioId: string
  prioridad?: OrdenTrabajoPrioridad
  estado?: OrdenTrabajoEstado
  fechaProgramada?: string
  fechaInicio?: string
  fechaFinEstimada?: string
  fechaFinReal?: string
  duracionEstimadaMin?: number
  duracionRealMin?: number
  resultado?: string
  observaciones?: string
}

export interface OrdenTrabajoActividadRequest {
  operarioId?: string
  tipo: string
  descripcion: string
  inicio?: string
  fin?: string
  duracionMin?: number
  estado?: string
  evidenciaUrl?: string
  observaciones?: string
}

export interface OrdenTrabajoEstadoRequest {
  estado: OrdenTrabajoEstado
  responsable?: string
  observaciones?: string
}

export interface OrdenTrabajoCierreRequest {
  responsable?: string
  resultado?: string
  motivo?: string
  duracionRealMin?: number
}

export interface OrdenTrabajoDashboard {
  total: number
  pendientes: number
  enProgreso: number
  completadas: number
  canceladas: number
  rechazadas: number
  vencidas: number
  actividadesRegistradas: number
}

export interface OrdenTrabajoResumen {
  dashboard: OrdenTrabajoDashboard
  ordenes: OrdenTrabajo[]
}
