export type TipoEvento = 'SIEMBRA' | 'MONITOREO_FENOLOGICO' | 'ALERTA' | 'TRATAMIENTO'
export type CalidadGrano = 'PREMIUM' | 'ESTANDAR' | 'DESCUENTO'

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
