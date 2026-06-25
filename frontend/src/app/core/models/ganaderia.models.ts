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
  potreroId?: string
  potreroNombre?: string
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
  potreroId?: string
  ubicacionActual?: string
  madreId?: string
  padreId?: string
  observaciones?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export type PotreroTipoUso = 'PASTOREO' | 'RESERVA' | 'RECRIA' | 'MATERNIDAD' | 'ENCIERRE' | 'OTRO'
export type PotreroEstado = 'ACTIVO' | 'INACTIVO' | 'DESCANSO' | 'MANTENIMIENTO'

export interface Potrero {
  id: string
  nombre: string
  descripcion?: string
  superficieHa: number
  tipoUso: PotreroTipoUso | string
  estado: PotreroEstado | string
  capacidadAnimales?: number
  cargaAnimalActual?: number
  recursoForrajero?: string
  disponibilidadAgua: boolean
  tieneSombra: boolean
  observaciones?: string
  poligono: string
  centroideLatitud?: number
  centroideLongitud?: number
  createdAt: string
  updatedAt: string
}

export interface PotreroRequest {
  nombre: string
  descripcion?: string
  superficieHa: number
  tipoUso?: PotreroTipoUso | string
  estado?: PotreroEstado | string
  capacidadAnimales?: number
  recursoForrajero?: string
  disponibilidadAgua?: boolean
  tieneSombra?: boolean
  observaciones?: string
  poligono: string
  centroideLatitud?: number
  centroideLongitud?: number
}

export interface PotreroFilters {
  nombre?: string
  estado?: string
  tipoUso?: string
  superficieMin?: number
  superficieMax?: number
}

export interface GanaderoDashboard {
  ultimaActualizacion: string
  kpis: GanaderoKpi[]
  distribucionRodeo: GanaderoDistribucionRodeo[]
  animalesPorPotrero: GanaderoBarraCategoria[]
  ocupacionPotreros: GanaderoPotreroOcupacion[]
  calendarioSanitario: GanaderoCalendarioSanitario[]
  diagnosticosPorSeveridad: GanaderoDiagnosticoSeveridad[]
  tratamientosActivos: GanaderoTratamientosActivos
  estadoReproductivo: GanaderoEstadoReproductivo
  partosEstimadosPorMes: GanaderoSeriePunto[]
  genealogiaTrazabilidad: GanaderoGenealogiaTrazabilidad
  consumoAlimentoPorPotrero: GanaderoSerieCategoria[]
  costoAlimentacion: GanaderoCostoAlimentacion
  conversionAlimenticia: GanaderoConversionAlimenticia
  dietasActivas: GanaderoDietaActiva[]
  alertasOperativas: GanaderoAlertaOperativa[]
}

export interface GanaderoKpi {
  codigo: string
  titulo: string
  valor: string
  subtitulo: string
  tono: string
  valorNumerico?: number
  tendencia?: string
}

export interface GanaderoDistribucionRodeo {
  categoria: string
  cantidad: number
  porcentaje: number
  color: string
}

export interface GanaderoBarraCategoria {
  etiqueta: string
  valor: number
  porcentaje: number
  color: string
}

export interface GanaderoPotreroOcupacion {
  nombre: string
  cargaActual: number
  capacidad: number
  porcentaje: number
  estado: string
  recursoForrajero?: string
}

export interface GanaderoCalendarioSanitario {
  vacuna: string
  vencidas: number
  proximas: number
  programadas: number
  obligatoria: boolean
}

export interface GanaderoDiagnosticoSeveridad {
  severidad: string
  cantidad: number
  porcentaje: number
  color: string
}

export interface GanaderoTratamientosActivos {
  animalesEnTratamiento: number
  diagnosticosAbiertos: number
  casosCriticos: number
  costoMes: number
}

export interface GanaderoEstadoReproductivo {
  prenadas: number
  vacias: number
  enControl: number
  proximasAParir: number
  torosActivos: number
}

export interface GanaderoSeriePunto {
  etiqueta: string
  valor: number
}

export interface GanaderoGenealogiaTrazabilidad {
  porcentajeCompleta: number
  sinMadre: number
  sinPadre: number
  sinRaza: number
  sinFechaNacimiento: number
  sinTrazabilidad: number
}

export interface GanaderoSerieCategoria {
  categoria: string
  puntos: GanaderoSeriePunto[]
  total: number
}

export interface GanaderoCostoAlimentacion {
  valorMes: number
  variacionMensual: number
  moneda: string
}

export interface GanaderoConversionAlimenticia {
  valor: number
  unidad: string
}

export interface GanaderoDietaActiva {
  nombre: string
  tipoAnimal: string
  objetivo?: string
  materiaSecaKg?: number
  costoDiario?: number
}

export interface GanaderoAlertaOperativa {
  tipo: string
  titulo: string
  detalle: string
  prioridad: string
  fechaGeneracion: string
}

export interface MovimientoAnimal {
  id: string
  animalId: string
  animalCaravana: string
  fecha: string
  tipoMovimiento: 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA' | 'SANIDAD' | 'CONTROL'
  potreroOrigenId?: string
  potreroDestinoId?: string
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
  potreroOrigenId?: string
  potreroDestinoId?: string
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

export interface ResumenAlertaVacuna {
  vacunaId: string
  vacunaNombre: string
  vacunaCodigo?: string
  obligatoria: boolean
  animalesAfectados: number
  vencidas: number
  proximasAVencer: number
  fechaMasVencida?: string
  proximaFecha?: string
  diasProximaFecha: number
}

export interface SanidadDashboard {
  vacunasCatalogadas: number
  aplicacionesMesActual: number
  diagnosticosAbiertos: number
  tratamientosActivos: number
  costoSanitarioMes: number
  alertasVacunas: AlertaVacuna[]
  alertasVacunasPorVacuna: ResumenAlertaVacuna[]
  diagnosticosRecientes: DiagnosticoSanitario[]
  tratamientosRecientes: TratamientoMedicamento[]
}

export interface Monta {
  id: string
  vacaId: string
  vacaCaravana: string
  toroId: string
  toroCaravana: string
  fecha: string
  resultado: string
  observaciones?: string
  createdAt: string
}

export interface MontaRequest {
  vacaId: string
  toroId: string
  fecha: string
  resultado?: string
  observaciones?: string
}

export interface Inseminacion {
  id: string
  vacaId: string
  vacaCaravana: string
  fecha: string
  geneticaUsada: string
  tecnico?: string
  costo?: number
  resultado: string
  observaciones?: string
  createdAt: string
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

export interface ControlPrenez {
  id: string
  vacaId: string
  vacaCaravana: string
  fechaDiagnostico: string
  estado: string
  fechaEstimadaParto?: string
  nivelRiesgoParto?: string
  veterinario?: string
  observaciones?: string
  createdAt: string
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

export interface Parto {
  id: string
  madreId: string
  madreCaravana: string
  terneroId?: string
  terneroCaravana?: string
  fecha: string
  complicaciones?: string
  viabilidadTernero: string
  observaciones?: string
  createdAt: string
}

export interface PartoRequest {
  madreId: string
  terneroId?: string
  fecha: string
  complicaciones?: string
  viabilidadTernero?: string
  observaciones?: string
}

export interface IndiceGenetico {
  id: string
  animalId: string
  animalCaravana: string
  fechaEvaluacion: string
  epd?: number
  dep?: number
  indiceProductivo?: number
  fuente?: string
  observaciones?: string
  createdAt: string
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

export interface NodoGenealogia {
  id: string
  caravana: string
  raza: string
  sexo?: string
  relacion: string
  generacion: number
  hijos?: NodoGenealogia[]
}

export interface GenealogiaAnimal {
  animal: NodoGenealogia
  ancestros: NodoGenealogia[]
  descendencia: NodoGenealogia[]
}

export interface AlertaReproductiva {
  tipo: string
  animalId: string
  animalCaravana: string
  fecha: string
  prioridad: string
  nivelRiesgoParto?: string
  mensaje: string
}

export interface RecomendacionCruzamiento {
  vacaId: string
  vacaCaravana: string
  toroId: string
  toroCaravana: string
  score: number
  motivo: string
  recomendado: boolean
}

export interface ReproduccionDashboard {
  montasRegistradas: number
  inseminacionesRegistradas: number
  prenezActivas: number
  partosRegistrados: number
  tasaPrenez: number
  tasaPartoViable: number
  serviciosPorPrenez: number
  alertas: AlertaReproductiva[]
  recomendaciones: RecomendacionCruzamiento[]
}

export interface ReproduccionResumen {
  dashboard: ReproduccionDashboard
  montas: Monta[]
  inseminaciones: Inseminacion[]
  controlesPrenez: ControlPrenez[]
  partos: Parto[]
  indices: IndiceGenetico[]
}

export interface DietaIngrediente {
  id: string
  ingrediente: string
  proporcionPct: number
  costoKg?: number
  materiaSecaPct?: number
}

export interface DietaIngredienteRequest {
  ingrediente: string
  proporcionPct: number
  costoKg?: number
  materiaSecaPct?: number
}

export interface Dieta {
  id: string
  nombre: string
  tipoAnimal: string
  objetivo?: string
  materiaSecaKg?: number
  costoDiario?: number
  activa: boolean
  observaciones?: string
  ingredientes: DietaIngrediente[]
  updatedAt: string
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

export interface RegistroAlimentacion {
  id: string
  animalId?: string
  animalCaravana?: string
  dietaId?: string
  dietaNombre?: string
  fecha: string
  alimento: string
  cantidadKg: number
  costoTotal?: number
  potreroId?: string
  potreroNombre?: string
  potrero?: string
  responsable?: string
  observaciones?: string
  createdAt: string
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

export interface Pesaje {
  id: string
  animalId: string
  animalCaravana: string
  fecha: string
  pesoKg: number
  condicionCorporal?: number
  metodo?: string
  responsable?: string
  observaciones?: string
  createdAt: string
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

export interface AlertaNutricional {
  animalId: string
  animalCaravana: string
  tipo: string
  prioridad: string
  mensaje: string
}

export interface AlimentacionDashboard {
  dietasActivas: number
  kgSuministradosMes: number
  costoMes: number
  gananciaPromedioKg: number
  conversionAlimenticia: number
  alertas: AlertaNutricional[]
}

export interface AlimentacionResumen {
  dashboard: AlimentacionDashboard
  dietas: Dieta[]
  registros: RegistroAlimentacion[]
  pesajes: Pesaje[]
}
