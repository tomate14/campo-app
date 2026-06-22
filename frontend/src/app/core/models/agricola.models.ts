export type TipoEvento = 'SIEMBRA' | 'MONITOREO_FENOLOGICO' | 'ALERTA' | 'TRATAMIENTO'
export type CalidadGrano = 'PREMIUM' | 'ESTANDAR' | 'DESCUENTO'
export type TipoPlaga = 'PLAGA' | 'ENFERMEDAD' | 'MALEZA'
export type SeveridadPlaga = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
export type EstadoDeteccionPlaga = 'ABIERTA' | 'EN_TRATAMIENTO' | 'CONTROLADA' | 'CERRADA'
export type OrigenGeolocalizacion = 'MOBILE_GPS' | 'WEB_MAPA' | 'MANUAL'
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
  phMinimo?: number
  phMaximo?: number
  fechaSiembra?: string
  fechaCosechaEstimada?: string
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
  phMinimo?: number
  phMaximo?: number
  fechaSiembra?: string
  fechaCosechaEstimada?: string
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

export interface LoteCardDetail {
  lote: Lote
  reporte?: LoteReporte
  ultimoSuelo?: PropiedadSuelo | null
  ultimoHistorial?: HistoricoCultivo | null
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

export interface AnalyticsFiltros {
  loteId?: string
  cultivo?: string
  temporada?: string
  desde?: string
  hasta?: string
  granularidad: 'SEMANAL' | 'MENSUAL' | 'ANUAL'
}

export interface AnalyticsKpis {
  totalCosechas: number
  totalLotes: number
  toneladasTotales: number
  rendimientoPromedioKgHa: number
  humedadPromedio: number
  tasaPremiumPct: number
  desviacionEstandarKgHa: number
}

export interface AnalyticsLoteMetric {
  loteId: string
  loteNombre: string
  cultivo: string
  temporada: string
  areaHa: number
  rendimientoPromedioKgHa: number
  toneladasTotales: number
  cosechas: number
  calidadDominante: string
}

export interface AnalyticsCultivoMetric {
  cultivo: string
  rendimientoPromedioKgHa: number
  toneladasTotales: number
  cosechas: number
}

export interface AnalyticsTemporadaMetric {
  temporada: string
  rendimientoPromedioKgHa: number
  toneladasTotales: number
  cosechas: number
}

export interface AnalyticsSerieTemporal {
  periodo: string
  rendimientoPromedioKgHa: number
  toneladasTotales: number
  cosechas: number
}

export interface AnalyticsOutlier {
  loteId: string
  loteNombre: string
  rendimientoPromedioKgHa: number
  desviacionSobreMediaKgHa: number
  tipo: string
}

export interface AnalyticsPrediccion {
  proximoPeriodo: string
  rendimientoEstimadoKgHa: number
  confianza: string
  metodo: string
}

export interface AnalyticsClimaResumen {
  temperaturaPromedio: number
  precipitacionPromedioMm: number
  humedadPromedioPct: number
}

export interface AgriculturaAnalytics {
  filtros: AnalyticsFiltros
  kpis: AnalyticsKpis
  lotes: AnalyticsLoteMetric[]
  cultivos: AnalyticsCultivoMetric[]
  temporadas: AnalyticsTemporadaMetric[]
  series: AnalyticsSerieTemporal[]
  outliers: AnalyticsOutlier[]
  prediccion: AnalyticsPrediccion
  clima: AnalyticsClimaResumen
}

export interface CatalogoPlaga {
  id: string
  nombreComun: string
  nombreCientifico?: string
  tipo: TipoPlaga
  cultivosAfectados?: string
  descripcion?: string
  sintomas?: string
  umbralAccion?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

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
  tipo: TipoPlaga
  fechaDeteccion: string
  cultivo?: string
  severidad: SeveridadPlaga
  areaAfectadaHa?: number
  porcentajeAfectado?: number
  estado: EstadoDeteccionPlaga
  latitud?: number
  longitud?: number
  precisionMetros?: number
  origenGeolocalizacion?: OrigenGeolocalizacion
  fotoUrl?: string
  fotoNombre?: string
  fotoContentType?: string
  fotoTamanioBytes?: number
  descripcion?: string
  responsableId?: string
  responsable?: string
  createdAt: string
  updatedAt: string
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
  origenGeolocalizacion?: OrigenGeolocalizacion
  fotoUrl?: string
  fotoNombre?: string
  fotoContentType?: string
  fotoTamanioBytes?: number
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

export interface PlagasDashboard {
  casosAbiertos: number
  enTratamiento: number
  controlados: number
  alertasCriticas: number
}

export interface ResolverLoteResponse {
  loteId?: string
  loteNombre?: string
  encontrado: boolean
  advertencia?: string
}

export interface ReporteAgricolaDashboard {
  campania: string
  ultimaActualizacion: string
  kpis: ReporteAgricolaKpi[]
  estadosFenologicos: ReporteCultivoFenologico[]
  rendimientoComparativo: ReporteRendimientoComparativo
  distribucionCultivos: ReporteCultivoDistribucion[]
  lotesMapa: ReporteLoteMapa[]
  evolucionSalud: ReporteSeriePunto[]
  alertasRecientes: ReporteAlertaResumen[]
  tareasRecomendadas: ReporteTareaResumen[]
}

export interface ReporteAgricolaKpi {
  codigo: string
  titulo: string
  valor?: string
  subtitulo?: string
  tono: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
  valorNumerico?: number
  tendencia: ReporteSeriePunto[]
}

export interface ReporteCultivoFenologico {
  cultivo: string
  estadoFenologico: string
  fecha: string
}

export interface ReporteRendimientoComparativo {
  actualTnHa?: number
  historicoTnHa?: number
  actual: ReporteSeriePunto[]
  historico: ReporteSeriePunto[]
}

export interface ReporteCultivoDistribucion {
  cultivo: string
  lotes: number
  hectareas: number
  porcentaje: number
}

export interface ReporteLoteMapa {
  loteId: string
  nombre: string
  cultivo: string
  area: number
  poligono: string
  salud: string
  color: string
}

export interface ReporteSeriePunto {
  etiqueta: string
  valor?: number
}

export interface ReporteAlertaResumen {
  tipo: string
  titulo: string
  detalle: string
  prioridad: string
  fecha: string
  origen: string
}

export interface ReporteTareaResumen {
  tipo: string
  titulo: string
  detalle: string
  fechaSugerida: string
  prioridad: string
  lotesAfectados: number
  origen: string
}
