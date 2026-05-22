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
