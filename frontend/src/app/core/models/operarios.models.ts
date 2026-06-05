export interface Operario {
  id: string
  userId?: string
  username?: string
  legajo: string
  nombre: string
  apellido: string
  nombreCompleto: string
  documentoTipo?: string
  documentoNumero: string
  telefono?: string
  direccion?: string
  fechaNacimiento?: string
  rolOperativo: string
  permisosOperativos?: string
  estado: string
  fechaIngreso?: string
  salarioBase?: number
  contactoEmergencia?: string
  telefonoEmergencia?: string
  observaciones?: string
  createdAt: string
  updatedAt: string
}

export interface OperarioRequest {
  userId?: string
  nombre: string
  apellido: string
  documentoTipo?: string
  documentoNumero: string
  telefono?: string
  direccion?: string
  fechaNacimiento?: string
  rolOperativo: string
  permisosOperativos?: string
  estado?: string
  fechaIngreso?: string
  salarioBase?: number
  contactoEmergencia?: string
  telefonoEmergencia?: string
  observaciones?: string
}

export interface OperarioDocumento {
  id: string
  operarioId: string
  operarioNombre: string
  tipoDocumento: string
  numero?: string
  fechaEmision?: string
  fechaVencimiento?: string
  estado: string
  url?: string
  observaciones?: string
  vencido: boolean
  createdAt: string
}

export interface OperarioDocumentoRequest {
  operarioId: string
  tipoDocumento: string
  numero?: string
  fechaEmision?: string
  fechaVencimiento?: string
  estado?: string
  url?: string
  observaciones?: string
}

export interface OperarioHistorialRol {
  id: string
  operarioId: string
  operarioNombre: string
  rolAnterior?: string
  rolNuevo: string
  fecha: string
  responsable?: string
  motivo?: string
  createdAt: string
}

export interface OperarioHistorialRolRequest {
  operarioId: string
  rolNuevo: string
  fecha?: string
  responsable?: string
  motivo?: string
}

export interface OperarioDashboard {
  totalOperarios: number
  activos: number
  disponibles: number
  documentosVencidos: number
}

export interface OperarioResumen {
  dashboard: OperarioDashboard
  operarios: Operario[]
  documentos: OperarioDocumento[]
  historialRoles: OperarioHistorialRol[]
}
