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
