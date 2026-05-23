export interface Animal {
  id: string
  caravana: string
  raza: string
  sexo?: string
  fechaNacimiento?: string
  fechaCompra?: string
  pesoActualKg?: number
  rfidCodigo?: string
  qrCodigo?: string
  estado: string
  ubicacionActual?: string
  madreId?: string
  madreCaravana?: string
  padreId?: string
  padreCaravana?: string
  observaciones?: string
  createdAt: string
  updatedAt: string
}

export interface AnimalRequest {
  caravana: string
  raza: string
  sexo?: string
  fechaNacimiento?: string
  fechaCompra?: string
  pesoActualKg?: number
  rfidCodigo?: string
  qrCodigo?: string
  estado?: string
  ubicacionActual?: string
  madreId?: string
  padreId?: string
  observaciones?: string
}

export interface MovimientoAnimal {
  id: string
  animalId: string
  animalCaravana: string
  fecha: string
  tipoMovimiento: 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA' | 'SANIDAD' | 'CONTROL'
  ubicacionOrigen?: string
  ubicacionDestino?: string
  motivo?: string
  responsable?: string
  observaciones?: string
  createdAt: string
}

export interface MovimientoAnimalRequest {
  animalId: string
  fecha: string
  tipoMovimiento: 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA' | 'SANIDAD' | 'CONTROL'
  ubicacionOrigen?: string
  ubicacionDestino?: string
  motivo?: string
  responsable?: string
  observaciones?: string
}

export interface HistorialMedicoAnimal {
  id: string
  animalId: string
  animalCaravana: string
  fecha: string
  diagnostico: string
  tratamiento?: string
  veterinario?: string
  observaciones?: string
  createdAt: string
}

export interface HistorialMedicoAnimalRequest {
  animalId: string
  fecha: string
  diagnostico: string
  tratamiento?: string
  veterinario?: string
  observaciones?: string
}

export interface AnimalDetalle {
  animal: Animal
  movimientos: MovimientoAnimal[]
  historialMedico: HistorialMedicoAnimal[]
}

export interface VacunaCatalogo {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  obligatoria: boolean
  especie: string
  frecuenciaDias?: number
  edadMinDias?: number
  edadMaxDias?: number
  dosisRecomendada?: string
  viaAplicacion?: string
  laboratorio?: string
  costoReferencia?: number
  stockDisponible?: number
  activo: boolean
  updatedAt: string
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

export interface AplicacionVacuna {
  id: string
  animalId: string
  animalCaravana: string
  vacunaId: string
  vacunaNombre: string
  vacunaObligatoria: boolean
  fechaAplicacion: string
  proximaDosisFecha?: string
  operario?: string
  loteMarca?: string
  costoAplicado?: number
  observaciones?: string
  createdAt: string
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

export interface TratamientoMedicamento {
  id: string
  animalId: string
  animalCaravana: string
  fechaInicio: string
  fechaFin?: string
  medicamento: string
  dosis?: string
  viaAplicacion?: string
  responsable?: string
  motivo?: string
  costo?: number
  observaciones?: string
  createdAt: string
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

export interface DiagnosticoSanitario {
  id: string
  animalId: string
  animalCaravana: string
  fechaDiagnostico: string
  enfermedad: string
  severidad: string
  estado: string
  veterinario?: string
  tratamientoIndicado?: string
  observaciones?: string
  createdAt: string
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

export interface AlertaVacuna {
  aplicacionId: string
  animalId: string
  animalCaravana: string
  vacunaNombre: string
  proximaDosisFecha: string
  diasRestantes: number
  estado: string
}

export interface SanidadDashboard {
  vacunasCatalogadas: number
  aplicacionesMesActual: number
  diagnosticosAbiertos: number
  tratamientosActivos: number
  costoSanitarioMes: number
  alertasVacunas: AlertaVacuna[]
  diagnosticosRecientes: DiagnosticoSanitario[]
  tratamientosRecientes: TratamientoMedicamento[]
}
