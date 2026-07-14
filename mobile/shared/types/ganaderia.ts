export interface ApiResponse<T> {
  data: T
  error?: string
  metadata?: Record<string, unknown>
}

export interface Potrero {
  id: string
  nombre: string
  descripcion?: string
  superficieHa: number
  tipoUso?: string
  estado?: string
  capacidadAnimales?: number
  cargaAnimalActual?: number
  recursoForrajero?: string
  disponibilidadAgua?: boolean
  tieneSombra?: boolean
  observaciones?: string
  poligono?: string
  centroideLatitud?: number
  centroideLongitud?: number
  createdAt?: string
  updatedAt?: string
}

export interface PotreroRequest {
  nombre: string
  descripcion?: string
  superficieHa: number
  tipoUso?: string
  estado?: string
  capacidadAnimales?: number
  recursoForrajero?: string
  disponibilidadAgua?: boolean
  tieneSombra?: boolean
  observaciones?: string
  poligono: string
  centroideLatitud?: number
  centroideLongitud?: number
}

export interface Animal {
  id: string
  caravana: string
  razaId?: string
  raza?: string
  sexo?: string
  fechaNacimiento?: string
  fechaCompra?: string
  pesoActualKg?: number
  rfidCodigo?: string
  qrCodigo?: string
  estado?: string
  potreroId?: string
  potreroNombre?: string
  madreId?: string
  madreCaravana?: string
  padreId?: string
  padreCaravana?: string
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface MontaRequest {
  vacaId: string
  toroId: string
  fecha: string
  resultado?: string
  observaciones?: string
}

export interface MontaResponse extends MontaRequest {
  id: string
  vacaCaravana?: string
  toroCaravana?: string
  createdAt?: string
}

export interface InseminacionRequest {
  vacaId: string
  fecha: string
  geneticaUsada: string
  tecnico?: string
  costo?: number
  resultado?: string
  observaciones?: string
}

export interface InseminacionResponse extends InseminacionRequest {
  id: string
  vacaCaravana?: string
  createdAt?: string
}

export interface ControlPrenezRequest {
  vacaId: string
  fechaDiagnostico: string
  estado: string
  fechaEstimadaParto?: string
  nivelRiesgoParto?: string
  veterinario?: string
  observaciones?: string
}

export interface ControlPrenezResponse extends ControlPrenezRequest {
  id: string
  vacaCaravana?: string
  createdAt?: string
}

export interface PartoRequest {
  madreId: string
  terneroId?: string
  fecha: string
  complicaciones?: string
  viabilidadTernero?: string
  observaciones?: string
}

export interface PartoResponse extends PartoRequest {
  id: string
  madreCaravana?: string
  terneroCaravana?: string
  createdAt?: string
}

export interface IndiceGeneticoRequest {
  animalId: string
  fechaEvaluacion: string
  epd?: number
  dep?: number
  indiceProductivo?: number
  fuente?: string
  observaciones?: string
}

export interface IndiceGeneticoResponse extends IndiceGeneticoRequest {
  id: string
  animalCaravana?: string
  createdAt?: string
}
