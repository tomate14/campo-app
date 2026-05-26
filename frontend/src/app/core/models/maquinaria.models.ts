export interface Maquinaria {
  id: string
  codigo: string
  tipo: string
  marca: string
  modelo: string
  numeroSerie?: string
  anio?: number
  estado: string
  ubicacionActual?: string
  potenciaHp?: number
  capacidad?: string
  accesorios?: string
  horometro?: number
  kilometraje?: number
  costoAdquisicion?: number
  fechaAlta?: string
  observaciones?: string
  createdAt: string
  updatedAt: string
}

export interface MaquinariaRequest {
  codigo: string
  tipo: string
  marca: string
  modelo: string
  numeroSerie?: string
  anio?: number
  estado?: string
  ubicacionActual?: string
  potenciaHp?: number
  capacidad?: string
  accesorios?: string
  horometro?: number
  kilometraje?: number
  costoAdquisicion?: number
  fechaAlta?: string
  observaciones?: string
}

export interface AsignacionMaquinaria {
  id: string
  maquinariaId: string
  maquinariaCodigo: string
  operarioId?: string
  operarioNombre?: string
  fechaInicio: string
  fechaFin?: string
  ubicacion?: string
  tarea?: string
  observaciones?: string
  createdAt: string
}

export interface AsignacionMaquinariaRequest {
  maquinariaId: string
  operarioId?: string
  operarioNombre?: string
  fechaInicio: string
  fechaFin?: string
  ubicacion?: string
  tarea?: string
  observaciones?: string
}

export interface UsoMaquinaria {
  id: string
  maquinariaId: string
  maquinariaCodigo: string
  fecha: string
  actividad: string
  loteId?: string
  loteNombre?: string
  operario?: string
  horasTrabajadas?: number
  kilometrosRecorridos?: number
  combustibleLitros?: number
  observaciones?: string
  createdAt: string
}

export interface UsoMaquinariaRequest {
  maquinariaId: string
  fecha: string
  actividad: string
  loteId?: string
  loteNombre?: string
  operario?: string
  horasTrabajadas?: number
  kilometrosRecorridos?: number
  combustibleLitros?: number
  observaciones?: string
}

export interface DocumentoMaquinaria {
  id: string
  maquinariaId: string
  maquinariaCodigo: string
  tipoDocumento: string
  numero?: string
  emision?: string
  vencimiento?: string
  url?: string
  observaciones?: string
  createdAt: string
}

export interface DocumentoMaquinariaRequest {
  maquinariaId: string
  tipoDocumento: string
  numero?: string
  emision?: string
  vencimiento?: string
  url?: string
  observaciones?: string
}

export interface HistorialEstadoMaquinaria {
  id: string
  maquinariaId: string
  maquinariaCodigo: string
  estadoAnterior?: string
  estadoNuevo: string
  fecha: string
  responsable?: string
  motivo?: string
}

export interface EstadoMaquinariaRequest {
  estado: string
  responsable?: string
  motivo?: string
}

export interface MaquinariaDashboard {
  total: number
  disponibles: number
  asignadas: number
  enReparacion: number
  documentosVencidos: number
  horasMes: number
  kilometrosMes: number
  alertas: string[]
}

export interface MaquinariaResumen {
  dashboard: MaquinariaDashboard
  maquinas: Maquinaria[]
  asignacionesActivas: AsignacionMaquinaria[]
  usosRecientes: UsoMaquinaria[]
  documentos: DocumentoMaquinaria[]
}
