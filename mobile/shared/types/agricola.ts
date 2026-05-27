export type TipoEvento = 'SIEMBRA' | 'MONITOREO_FENOLOGICO' | 'ALERTA' | 'TRATAMIENTO'
export type CalidadGrano = 'PREMIUM' | 'ESTANDAR' | 'DESCUENTO'
export type TipoPlaga = 'PLAGA' | 'ENFERMEDAD' | 'MALEZA'
export type SeveridadPlaga = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
export type EstadoDeteccionPlaga = 'ABIERTA' | 'EN_TRATAMIENTO' | 'CONTROLADA' | 'CERRADA'

export interface Lote {
  id: string
  nombre: string
  area: number
  cultivo: string
  latitud?: number
  longitud?: number
  temporada: string
  poligono?: string
  createdAt: string
  updatedAt: string
}

export interface LoteRequest {
  nombre: string
  area: number
  cultivo: string
  latitud?: number
  longitud?: number
  temporada: string
  poligono?: string
}

export interface LoteFilters {
  temporada?: string
  cultivo?: string
  areaMin?: number
  areaMax?: number
  phMin?: number
  phMax?: number
  tienePoligono?: boolean
}

export interface GeoJsonImportRequest {
  geoJson: string
}

export interface LoteReporte {
  loteId: string
  loteNombre: string
  cultivoActual: string
  temporadaActual: string
  area: number
  cantidadEventos: number
  cantidadCosechas: number
  cantidadAnalisisSuelo: number
  cantidadCultivosHistoricos: number
  rendimientoPromedioKgHa: number
  rendimientoHistoricoPromedioKgHa: number
  ultimoCultivo?: string
  ultimaTemporada?: string
}

export interface EventoSiembra {
  id: string
  loteId: string
  loteNombre: string
  tipoEvento: TipoEvento
  estadoFenologico?: string
  descripcion?: string
  fecha: string
  createdAt: string
}

export interface EventoSiembraRequest {
  loteId: string
  tipoEvento: TipoEvento
  estadoFenologico?: string
  descripcion?: string
  fecha: string
}

export interface RegistroCosecha {
  id: string
  loteId: string
  loteNombre: string
  fecha: string
  rendimientoKgHa: number
  toneladasTotal: number
  calidadGrano?: CalidadGrano
  humedad?: number
  observaciones?: string
  createdAt: string
}

export interface RegistroCosechaRequest {
  loteId: string
  fecha: string
  rendimientoKgHa: number
  toneladasTotal: number
  calidadGrano?: CalidadGrano
  humedad?: number
  observaciones?: string
}

export interface PropiedadSuelo {
  id: string
  loteId: string
  loteNombre: string
  fecha: string
  ph?: number
  nitrogenoKgHa?: number
  fosforoKgHa?: number
  potasioKgHa?: number
  materiaOrganicaPct?: number
  conductividadElectrica?: number
  observaciones?: string
  createdAt: string
}

export interface PropiedadSueloRequest {
  loteId: string
  fecha: string
  ph?: number
  nitrogenoKgHa?: number
  fosforoKgHa?: number
  potasioKgHa?: number
  materiaOrganicaPct?: number
  conductividadElectrica?: number
  observaciones?: string
}

export interface HistoricoCultivo {
  id: string
  loteId: string
  loteNombre: string
  cultivo: string
  temporada: string
  fechaSiembra?: string
  fechaCosecha?: string
  rendimientoKgHa?: number
  observaciones?: string
  createdAt: string
}

export interface HistoricoCultivoRequest {
  loteId: string
  cultivo: string
  temporada: string
  fechaSiembra?: string
  fechaCosecha?: string
  rendimientoKgHa?: number
  observaciones?: string
}

export interface RotacionRecomendacion {
  loteId: string
  loteNombre: string
  ultimoCultivo?: string
  ultimaTemporada?: string
  cultivosRecomendados: string[]
  cultivosEvitar: string[]
  razon: string
}

export interface ApiResponse<T> {
  data: T
  error?: string
  metadata?: Record<string, unknown>
}

export interface CatalogoPlaga {
  id: string
  nombreComun: string
  tipo: TipoPlaga
  cultivosAfectados?: string
}

export interface DeteccionPlaga {
  id: string
  loteId: string
  loteNombre: string
  catalogoPlagaId: string
  plagaNombre: string
  fechaDeteccion: string
  severidad: SeveridadPlaga
  estado: EstadoDeteccionPlaga
  latitud?: number
  longitud?: number
  descripcion?: string
  responsable?: string
}

export interface DeteccionPlagaRequest {
  loteId: string
  catalogoPlagaId: string
  fechaDeteccion?: string
  cultivo?: string
  severidad: SeveridadPlaga
  areaAfectadaHa?: number
  porcentajeAfectado?: number
  estado?: EstadoDeteccionPlaga
  latitud?: number
  longitud?: number
  precisionMetros?: number
  origenGeolocalizacion?: 'MOBILE_GPS' | 'WEB_MAPA' | 'MANUAL'
  fotoUrl?: string
  fotoNombre?: string
  descripcion?: string
  responsable?: string
}
