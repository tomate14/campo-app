export type TipoEvento = 'SIEMBRA' | 'MONITOREO_FENOLOGICO' | 'ALERTA' | 'TRATAMIENTO'
export type CalidadGrano = 'PREMIUM' | 'ESTANDAR' | 'DESCUENTO'
export type TipoPerdidaCosecha = 'CABEZAL' | 'COLA' | 'OTRO'
export type TipoPlaga = 'PLAGA' | 'ENFERMEDAD' | 'MALEZA'
export type SeveridadPlaga = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
export type EstadoDeteccionPlaga = 'ABIERTA' | 'EN_TRATAMIENTO' | 'CONTROLADA' | 'CERRADA'
export type ResultadoSeguimientoPlaga = 'SIN_CAMBIOS' | 'MEJORA' | 'EMPEORA' | 'CONTROLADA'

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
  // Perdidas de cosecha y destino del dia (feature 60)
  areaRealCosechadaPct?: number
  hectareasCosechadas?: number
  perdidaKgHa?: number
  granosPerdidosKg?: number
  tipoPerdida?: TipoPerdidaCosecha
  destino?: string
  destinoCantidadTn?: number
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
  // Perdidas de cosecha y destino del dia (feature 60)
  areaRealCosechadaPct?: number
  hectareasCosechadas?: number
  perdidaKgHa?: number
  granosPerdidosKg?: number
  tipoPerdida?: TipoPerdidaCosecha
  destino?: string
  destinoCantidadTn?: number
}

// Opcion de catalogo configurable (modulo Utilidades, feature 60)
export interface UtilidadOpcion {
  id: string
  categoria: string
  valor: string
  activo: boolean
  orden: number
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

// Alta de plaga de catalogo (espejo del CatalogoPlagaRequest de la web)
export interface CatalogoPlagaRequest {
  nombreComun: string
  nombreCientifico?: string
  tipo: TipoPlaga
  cultivosAfectados?: string
  descripcion?: string
  sintomas?: string
  umbralAccion?: string
  activo?: boolean
}

export interface DeteccionPlaga {
  id: string
  loteId: string
  loteNombre: string
  catalogoPlagaId: string
  plagaNombre: string
  tipo?: string
  fechaDeteccion: string
  cultivo?: string
  severidad: SeveridadPlaga
  areaAfectadaHa?: number
  porcentajeAfectado?: number
  estado: EstadoDeteccionPlaga
  latitud?: number
  longitud?: number
  precisionMetros?: number
  origenGeolocalizacion?: 'MOBILE_GPS' | 'WEB_MAPA' | 'MANUAL'
  fotoUrl?: string
  fotoNombre?: string
  fotoContentType?: string
  fotoTamanioBytes?: number
  descripcion?: string
  responsableId?: string
  responsable?: string
  createdAt?: string
  updatedAt?: string
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
  responsableId?: string
  responsable?: string
}

export interface AplicacionFitosanitaria {
  id: string
  deteccionId: string
  loteId: string
  loteNombre: string
  fechaAplicacion: string
  producto: string
  principioActivo?: string
  dosis: number
  unidadDosis: string
  volumenCaldoLHa?: number
  superficieTratadaHa?: number
  periodoCarenciaDias?: number
  periodoReingresoHoras?: number
  fechaReingresoSeguro?: string
  fechaCosechaSegura?: string
  maquinariaId?: string
  operarioResponsableId?: string
  operarioResponsable: string
  condicionesClimaticas?: string
  observaciones?: string
  createdAt: string
}

export interface AplicacionFitosanitariaRequest {
  fechaAplicacion?: string
  producto: string
  principioActivo?: string
  dosis: number
  unidadDosis: string
  volumenCaldoLHa?: number
  superficieTratadaHa?: number
  periodoCarenciaDias?: number
  periodoReingresoHoras?: number
  maquinariaId?: string
  operarioResponsableId?: string
  operarioResponsable: string
  condicionesClimaticas?: string
  observaciones?: string
}

export interface SeguimientoPlaga {
  id: string
  deteccionId: string
  plagaNombre: string
  loteNombre: string
  fecha: string
  resultado: ResultadoSeguimientoPlaga
  severidad: SeveridadPlaga
  observaciones?: string
  responsableId?: string
  responsable?: string
  createdAt: string
}

export interface SeguimientoPlagaRequest {
  fecha?: string
  resultado: ResultadoSeguimientoPlaga
  severidad: SeveridadPlaga
  observaciones?: string
  responsableId?: string
  responsable?: string
}
