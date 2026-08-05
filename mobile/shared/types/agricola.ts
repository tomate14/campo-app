export type TipoEvento = 'SIEMBRA' | 'MONITOREO_FENOLOGICO' | 'ALERTA' | 'TRATAMIENTO'
export type CalidadGrano = 'PREMIUM' | 'ESTANDAR' | 'DESCUENTO'
export type SeveridadPlaga = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
export type EstadoDeteccionPlaga = 'ABIERTA' | 'EN_TRATAMIENTO' | 'CONTROLADA' | 'CERRADA'
export type ResultadoSeguimientoPlaga = 'SIN_CAMBIOS' | 'MEJORA' | 'EMPEORA' | 'CONTROLADA'

export interface Lote {
  id: string
  nombre: string
  area: number
  // Referencia por id al catalogo CULTIVO (feature 72); el nombre a mostrar viene en cultivoNombre
  cultivo: string
  cultivoNombre?: string
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
  // cultivoActual/ultimoCultivo son ids del catalogo CULTIVO (feature 72); nombres a mostrar en *Nombre
  cultivoActualNombre?: string
  ultimoCultivo?: string
  ultimoCultivoNombre?: string
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
  // Catalogos configurables (feature 72): tipoPerdida/destino ahora son ids; nombres a mostrar en *Nombre
  tipoPerdida?: string
  tipoPerdidaNombre?: string
  destino?: string
  destinoNombre?: string
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
  // Catalogo configurable TIPO_PERDIDA_COSECHA (feature 70): antes enum, ahora string libre del catalogo
  tipoPerdida?: string
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
  // Catalogo configurable TIPO_PLAGA (feature 72): tipo es id; nombre a mostrar en tipoNombre
  tipo: string
  tipoNombre?: string
  cultivosAfectados?: string
}

// Alta de plaga de catalogo (espejo del CatalogoPlagaRequest de la web)
export interface CatalogoPlagaRequest {
  nombreComun: string
  nombreCientifico?: string
  // Catalogo configurable TIPO_PLAGA (feature 71): antes enum, ahora string libre del catalogo
  tipo: string
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
  // tipo/cultivo son ids de catalogo (feature 72); nombres a mostrar en *Nombre
  tipo?: string
  tipoNombre?: string
  fechaDeteccion: string
  cultivo?: string
  cultivoNombre?: string
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
