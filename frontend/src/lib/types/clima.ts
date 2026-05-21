export type TipoAlerta = 'HELADA' | 'LLUVIA_EXCESIVA' | 'SEQUIA' | 'VIENTO_FUERTE' | 'GRANIZO' | 'TORMENTA'
export type SeveridadAlerta = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export interface DatoClima {
  id: string
  loteId: string
  loteNombre: string
  timestampUtc: string
  temperatura?: number
  sensacionTermica?: number
  tempMin?: number
  tempMax?: number
  humedadPct?: number
  presionHpa?: number
  velocidadViento?: number
  direccionViento?: number
  descripcion?: string
  iconoCodigo?: string
  precipitacionesMm?: number
  nubosidadPct?: number
  condicionCodigo?: number
  nombreLocalidad?: string
  createdAt: string
}

export interface Pronostico {
  id: string
  loteId: string
  fecha: string
  tempMax?: number
  tempMin?: number
  humedadPct?: number
  probabilidadLluvia?: number
  precipitacionMm?: number
  descripcion?: string
  iconoCodigo?: string
  velocidadViento?: number
  condicionCodigo?: number
}

export interface AlertaClima {
  id: string
  loteId: string
  loteNombre: string
  tipoAlerta: TipoAlerta
  severidad: SeveridadAlerta
  mensaje: string
  valorMedido?: number
  activa: boolean
  leida: boolean
  fecha: string
  createdAt: string
}

export interface Recomendacion {
  categoria: string
  mensaje: string
  prioridad: string
}

export interface RecomendacionClima {
  loteId: string
  loteNombre: string
  recomendaciones: Recomendacion[]
  condicionGeneral: string
}
