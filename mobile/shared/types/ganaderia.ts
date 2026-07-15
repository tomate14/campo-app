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

export interface RazaBovina {
  id: string
  codigo?: string
  nombre: string
  especie?: string
  aptitud?: string
  tipoGenetico?: string
  origen?: string
  descripcion?: string
  fuente?: string
  activo?: boolean
}

export interface AnimalRequest {
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
  madreId?: string
  padreId?: string
  observaciones?: string
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

export interface VacunaCatalogoRequest {
  codigo: string
  nombre: string
  descripcion?: string
  obligatoria?: boolean
  especie?: string
  frecuenciaDias?: number
  edadMinDias?: number
  edadMaxDias?: number
  dosisRecomendada?: string
  viaAplicacion?: string
  laboratorio?: string
  costoReferencia?: number
  stockDisponible?: number
  activo?: boolean
}

export interface VacunaCatalogo extends VacunaCatalogoRequest {
  id: string
  updatedAt?: string
}

export interface AplicacionVacunaRequest {
  animalId: string
  vacunaId: string
  fechaAplicacion: string
  proximaDosisFecha?: string
  operario?: string
  loteMarca?: string
  costoAplicado?: number
  observaciones?: string
}

export interface AplicacionVacunaResponse extends AplicacionVacunaRequest {
  id: string
  animalCaravana?: string
  vacunaNombre?: string
  createdAt?: string
}

export interface TratamientoMedicamentoRequest {
  animalId: string
  fechaInicio: string
  fechaFin?: string
  medicamento: string
  dosis?: string
  viaAplicacion?: string
  responsable?: string
  motivo?: string
  costo?: number
  observaciones?: string
}

export interface TratamientoMedicamentoResponse extends TratamientoMedicamentoRequest {
  id: string
  animalCaravana?: string
  createdAt?: string
}

export interface DiagnosticoSanitarioRequest {
  animalId: string
  fechaDiagnostico: string
  enfermedad: string
  severidad?: string
  estado?: string
  veterinario?: string
  tratamientoIndicado?: string
  observaciones?: string
}

export interface DiagnosticoSanitarioResponse extends DiagnosticoSanitarioRequest {
  id: string
  animalCaravana?: string
  createdAt?: string
}

export interface DietaIngredienteRequest {
  ingrediente: string
  proporcionPct: number
  costoKg?: number
  materiaSecaPct?: number
}

export interface DietaIngredienteResponse extends DietaIngredienteRequest {
  id?: string
}

export interface DietaRequest {
  nombre: string
  tipoAnimal: string
  objetivo?: string
  materiaSecaKg?: number
  costoDiario?: number
  activa?: boolean
  observaciones?: string
  ingredientes?: DietaIngredienteRequest[]
}

export interface Dieta extends Omit<DietaRequest, 'ingredientes'> {
  id: string
  ingredientes?: DietaIngredienteResponse[]
  updatedAt?: string
}

export interface RegistroAlimentacionRequest {
  animalId?: string
  dietaId?: string
  fecha: string
  alimento: string
  cantidadKg: number
  costoTotal?: number
  potreroId?: string
  potrero?: string
  responsable?: string
  observaciones?: string
}

export interface RegistroAlimentacionResponse extends RegistroAlimentacionRequest {
  id: string
  animalCaravana?: string
  dietaNombre?: string
  createdAt?: string
}

export interface PesajeRequest {
  animalId: string
  fecha: string
  pesoKg: number
  condicionCorporal?: number
  metodo?: string
  responsable?: string
  observaciones?: string
}

export interface PesajeResponse extends PesajeRequest {
  id: string
  animalCaravana?: string
  createdAt?: string
}
