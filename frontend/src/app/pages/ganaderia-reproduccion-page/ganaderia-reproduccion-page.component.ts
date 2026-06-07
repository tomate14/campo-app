import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../core/services/api.config';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import type {
  AlertaReproductiva,
  Animal,
  AnimalDetalle,
  ControlPrenezRequest,
  GenealogiaAnimal,
  IndiceGeneticoRequest,
  InseminacionRequest,
  MontaRequest,
  NodoGenealogia,
  PartoRequest,
  RecomendacionCruzamiento,
  ReproduccionResumen,
} from '../../core/models/ganaderia.models';

type FormMode = 'MONTA' | 'IA' | 'PRENEZ' | 'PARTO' | 'INDICE';
type SeguimientoEvento = {
  tipo: string;
  fecha: string;
  estado: string;
  responsable: string;
  detalle: string;
};

@Component({
  selector: 'app-ganaderia-reproduccion-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './ganaderia-reproduccion-page.component.html',
  styleUrl: './ganaderia-reproduccion-page.component.css',
})
export class GanaderiaReproduccionPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly mode = signal<FormMode>('MONTA');
  protected readonly resumen = signal<ReproduccionResumen | null>(null);
  protected readonly animales = signal<Animal[]>([]);
  protected readonly genealogia = signal<GenealogiaAnimal | null>(null);
  protected readonly selectedGenealogiaId = signal('');
  protected readonly selectedAlert = signal<AlertaReproductiva | null>(null);
  protected readonly selectedAlertDetail = signal<AnimalDetalle | null>(null);
  protected readonly alertPage = signal(1);
  protected readonly alertPageSize = 5;
  protected readonly recommendationPage = signal(1);
  protected readonly recommendationPageSize = 5;
  protected readonly endpoints = {
    animales: `${API_BASE_URL}/ganaderia/trazabilidad/animales`,
    usuarios: `${API_BASE_URL}/operarios/gestion/operarios`,
  };
  protected readonly activeAnimalParams = { estado: 'ACTIVO' };
  protected readonly activeUserParams = { estado: 'ACTIVO' };
  protected readonly veterinarioParams = { estado: 'ACTIVO', rol: 'VETERINARIO' };
  protected readonly hembraAllowedValues = { sexo: ['Femenino', 'HEMBRA', 'F'] };
  protected readonly machoAllowedValues = { sexo: ['Masculino', 'MACHO', 'TORO', 'M'] };

  protected readonly hembras = computed(() => this.animales().filter((animal) => this.isFemale(animal)));
  protected readonly machos = computed(() => this.animales().filter((animal) => this.isMale(animal)));
  protected readonly alertasParto = computed(() => this.resumen()?.dashboard.alertas ?? []);
  protected readonly alertasEnRiesgo = computed(() => this.alertasParto().filter((alerta) => alerta.prioridad === 'ALTA').length);
  protected readonly alertTotalPages = computed(() => Math.max(1, Math.ceil(this.alertasParto().length / this.alertPageSize)));
  protected readonly alertPageNumbers = computed(() => Array.from({ length: this.alertTotalPages() }, (_, index) => index + 1));
  protected readonly paginatedAlertas = computed(() => {
    const start = (this.alertPage() - 1) * this.alertPageSize;
    return this.alertasParto().slice(start, start + this.alertPageSize);
  });
  protected readonly recomendaciones = computed(() => this.resumen()?.dashboard.recomendaciones ?? []);
  protected readonly recommendationTotalPages = computed(() => Math.max(1, Math.ceil(this.recomendaciones().length / this.recommendationPageSize)));
  protected readonly recommendationPageNumbers = computed(() => Array.from({ length: this.recommendationTotalPages() }, (_, index) => index + 1));
  protected readonly paginatedRecomendaciones = computed(() => {
    const start = (this.recommendationPage() - 1) * this.recommendationPageSize;
    return this.recomendaciones().slice(start, start + this.recommendationPageSize);
  });
  protected readonly selectedAlertAnimal = computed(() => {
    const alert = this.selectedAlert();
    return alert ? this.animales().find((animal) => animal.id === alert.animalId) ?? null : null;
  });
  protected readonly selectedAlertControl = computed(() => {
    const alert = this.selectedAlert();
    const resumen = this.resumen();
    return alert && resumen
      ? resumen.controlesPrenez.find((control) => control.vacaId === alert.animalId && control.fechaEstimadaParto === alert.fecha) ?? null
      : null;
  });
  protected readonly selectedAlertPartoNumber = computed(() => {
    const alert = this.selectedAlert();
    const resumen = this.resumen();
    if (!alert || !resumen) {
      return 1;
    }
    return resumen.partos.filter((parto) => parto.madreId === alert.animalId && parto.fecha <= alert.fecha).length + 1;
  });
  protected readonly selectedAlertEvents = computed<SeguimientoEvento[]>(() => {
    const alert = this.selectedAlert();
    const resumen = this.resumen();
    if (!alert || !resumen) {
      return [];
    }
    const events: SeguimientoEvento[] = [
      ...resumen.montas
        .filter((item) => item.vacaId === alert.animalId)
        .map((item) => ({ tipo: 'Monta', fecha: item.fecha, estado: item.resultado, responsable: `Toro ${item.toroCaravana}`, detalle: item.observaciones || 'Servicio natural registrado' })),
      ...resumen.inseminaciones
        .filter((item) => item.vacaId === alert.animalId)
        .map((item) => ({ tipo: 'Inseminacion', fecha: item.fecha, estado: item.resultado, responsable: item.tecnico || 'Sin tecnico', detalle: item.geneticaUsada || item.observaciones || 'IA registrada' })),
      ...resumen.controlesPrenez
        .filter((item) => item.vacaId === alert.animalId)
        .map((item) => ({ tipo: 'Diagnostico', fecha: item.fechaDiagnostico, estado: item.estado, responsable: item.veterinario || 'Sin veterinario', detalle: item.fechaEstimadaParto ? `Parto estimado ${item.fechaEstimadaParto}` : item.observaciones || 'Control de prenez' })),
      ...resumen.partos
        .filter((item) => item.madreId === alert.animalId)
        .map((item) => ({ tipo: 'Parto', fecha: item.fecha, estado: item.viabilidadTernero, responsable: item.terneroCaravana ? `Ternero ${item.terneroCaravana}` : 'Sin ternero asociado', detalle: item.complicaciones || item.observaciones || 'Parto registrado' })),
      ...resumen.indices
        .filter((item) => item.animalId === alert.animalId)
        .map((item) => ({ tipo: 'Indice genetico', fecha: item.fechaEvaluacion, estado: 'Evaluado', responsable: item.fuente || 'Sin fuente', detalle: `EPD ${item.epd ?? 's/d'} · DEP ${item.dep ?? 's/d'} · Productivo ${item.indiceProductivo ?? 's/d'}` })),
    ];
    return events.sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly montaForm = signal<MontaRequest>({
    vacaId: '',
    toroId: '',
    fecha: this.today,
    resultado: 'PENDIENTE',
    observaciones: '',
  });

  protected readonly inseminacionForm = signal<InseminacionRequest>({
    vacaId: '',
    fecha: this.today,
    geneticaUsada: '',
    tecnico: '',
    costo: undefined,
    resultado: 'PENDIENTE',
    observaciones: '',
  });

  protected readonly prenezForm = signal<ControlPrenezRequest>({
    vacaId: '',
    fechaDiagnostico: this.today,
    estado: 'PRENADA',
    fechaEstimadaParto: '',
    nivelRiesgoParto: 'MEDIO',
    veterinario: '',
    observaciones: '',
  });

  protected readonly partoForm = signal<PartoRequest>({
    madreId: '',
    terneroId: '',
    fecha: this.today,
    complicaciones: '',
    viabilidadTernero: 'VIABLE',
    observaciones: '',
  });

  protected readonly indiceForm = signal<IndiceGeneticoRequest>({
    animalId: '',
    fechaEvaluacion: this.today,
    epd: undefined,
    dep: undefined,
    indiceProductivo: undefined,
    fuente: '',
    observaciones: '',
  });

  ngOnInit(): void {
    this.loadAll();
  }

  protected loadAll() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.ganaderiaService.getAnimales({ estado: 'ACTIVO' }).subscribe({
      next: (animales) => {
        this.animales.set(animales);
        this.ensureDefaultSelections(animales);
        this.loadResumen();
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar la base de animales.');
      },
    });
  }

  protected loadResumen() {
    this.ganaderiaService.getReproduccionResumen().subscribe({
      next: (resumen) => {
        this.resumen.set(resumen);
        this.alertPage.set(1);
        this.recommendationPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar el modulo reproductivo.');
      },
    });
  }

  protected setMode(mode: FormMode) {
    this.mode.set(mode);
  }

  protected submitCurrent() {
    if (this.mode() === 'MONTA') {
      this.submitMonta();
    } else if (this.mode() === 'IA') {
      this.submitInseminacion();
    } else if (this.mode() === 'PRENEZ') {
      this.submitPrenez();
    } else if (this.mode() === 'PARTO') {
      this.submitParto();
    } else {
      this.submitIndice();
    }
  }

  protected loadGenealogia() {
    const animalId = this.selectedGenealogiaId();
    if (!animalId) {
      this.genealogia.set(null);
      return;
    }
    this.ganaderiaService.getGenealogia(animalId).subscribe({
      next: (genealogia) => this.genealogia.set(genealogia),
      error: () => this.errorMessage.set('No se pudo cargar la genealogia del animal.'),
    });
  }

  protected animalLabel(animal: Animal) {
    return `${animal.caravana} · ${animal.raza}${animal.sexo ? ` · ${animal.sexo}` : ''}`;
  }

  protected genealogiaGeneration(level: number) {
    const tree = this.genealogia();
    if (!tree) {
      return [];
    }
    return tree.ancestros.filter((node) => node.generacion === level);
  }

  protected isMaleNode(node: NodoGenealogia) {
    return ['MASCULINO', 'MACHO', 'TORO', 'M', 'MALE'].includes(this.normalizeSexo(node.sexo));
  }

  protected selectedAnimalIsMale() {
    const tree = this.genealogia();
    return tree ? this.isMaleNode(tree.animal) : false;
  }

  protected setAlertPage(page: number) {
    this.alertPage.set(Math.min(Math.max(page, 1), this.alertTotalPages()));
  }

  protected previousAlertPage() {
    this.setAlertPage(this.alertPage() - 1);
  }

  protected nextAlertPage() {
    this.setAlertPage(this.alertPage() + 1);
  }

  protected diasRestantes(alerta: AlertaReproductiva) {
    const today = new Date(`${this.today}T00:00:00`);
    const date = new Date(`${alerta.fecha}T00:00:00`);
    return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
  }

  protected riesgoLabel(alerta: AlertaReproductiva) {
    if (alerta.prioridad === 'ALTA') {
      return 'Alto';
    }
    if (alerta.prioridad === 'MEDIA') {
      return 'Medio';
    }
    return 'Bajo';
  }

  protected riesgoClass(alerta: AlertaReproductiva) {
    return {
      'risk-high': alerta.prioridad === 'ALTA',
      'risk-medium': alerta.prioridad === 'MEDIA',
      'risk-low': alerta.prioridad !== 'ALTA' && alerta.prioridad !== 'MEDIA',
    };
  }

  protected alertaPartoNumber(alerta: AlertaReproductiva) {
    const resumen = this.resumen();
    if (!resumen) {
      return 1;
    }
    return resumen.partos.filter((parto) => parto.madreId === alerta.animalId && parto.fecha <= alerta.fecha).length + 1;
  }

  protected viewAlertaDetalle(alerta: AlertaReproductiva) {
    this.selectedAlert.set(alerta);
    this.selectedAlertDetail.set(null);
    this.selectedGenealogiaId.set(alerta.animalId);
    this.loadGenealogia();
    this.ganaderiaService.getAnimal(alerta.animalId).subscribe({
      next: (detail) => this.selectedAlertDetail.set(detail),
      error: () => this.selectedAlertDetail.set(null),
    });
  }

  protected closeAlertaDetalle() {
    this.selectedAlert.set(null);
    this.selectedAlertDetail.set(null);
  }

  protected alertaLote(alerta: AlertaReproductiva) {
    return this.animales().find((animal) => animal.id === alerta.animalId)?.ubicacionActual || 'Sin lote asignado';
  }

  protected selectedAlertRiskLabel() {
    const risk = this.selectedAlertControl()?.nivelRiesgoParto || this.selectedAlert()?.nivelRiesgoParto || this.selectedAlert()?.prioridad || 'MEDIO';
    return this.toDisplayRisk(risk);
  }

  protected technicalAge(animal?: Animal | null) {
    if (!animal?.fechaNacimiento) {
      return 'Sin dato';
    }
    const birth = new Date(`${animal.fechaNacimiento}T00:00:00`);
    const now = new Date(`${this.today}T00:00:00`);
    const months = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / 2_629_746_000));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return years ? `${years} anios ${remainingMonths} meses` : `${remainingMonths} meses`;
  }

  protected lastServiceLabel(animalId: string) {
    const resumen = this.resumen();
    if (!resumen) {
      return 'Sin dato';
    }
    const services = [
      ...resumen.montas.filter((item) => item.vacaId === animalId).map((item) => ({ fecha: item.fecha, label: `Monta con toro ${item.toroCaravana}` })),
      ...resumen.inseminaciones.filter((item) => item.vacaId === animalId).map((item) => ({ fecha: item.fecha, label: `IA ${item.geneticaUsada}` })),
    ].sort((a, b) => b.fecha.localeCompare(a.fecha));
    return services[0] ? `${services[0].fecha} · ${services[0].label}` : 'Sin dato';
  }

  protected setRecommendationPage(page: number) {
    this.recommendationPage.set(Math.min(Math.max(page, 1), this.recommendationTotalPages()));
  }

  protected previousRecommendationPage() {
    this.setRecommendationPage(this.recommendationPage() - 1);
  }

  protected nextRecommendationPage() {
    this.setRecommendationPage(this.recommendationPage() + 1);
  }

  protected recommendationQuality(item: RecomendacionCruzamiento) {
    if (item.score >= 70) {
      return 'Alta';
    }
    if (item.score >= 35) {
      return 'Media';
    }
    return 'Base';
  }

  protected recommendationClass(item: RecomendacionCruzamiento) {
    return {
      'risk-low': item.score >= 70,
      'risk-medium': item.score >= 35 && item.score < 70,
      'risk-high': item.score < 35,
    };
  }

  protected viewRecommendation(item: RecomendacionCruzamiento) {
    this.selectedGenealogiaId.set(item.vacaId);
    this.loadGenealogia();
  }

  private submitMonta() {
    this.save(() => this.ganaderiaService.createMonta(this.normalizeMonta(this.montaForm())));
  }

  private submitInseminacion() {
    this.save(() => this.ganaderiaService.createInseminacion(this.normalizeInseminacion(this.inseminacionForm())));
  }

  private submitPrenez() {
    this.save(() => this.ganaderiaService.createControlPrenez(this.normalizePrenez(this.prenezForm())));
  }

  private submitParto() {
    this.save(() => this.ganaderiaService.createParto(this.normalizeParto(this.partoForm())));
  }

  private submitIndice() {
    this.save(() => this.ganaderiaService.createIndiceGenetico(this.normalizeIndice(this.indiceForm())));
  }

  private save(operation: () => { subscribe: (observer: { next: () => void; error: () => void }) => void }) {
    this.saving.set(true);
    this.errorMessage.set('');
    operation().subscribe({
      next: () => {
        this.saving.set(false);
        this.loadResumen();
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo guardar el evento reproductivo.');
      },
    });
  }

  private ensureDefaultSelections(animales: Animal[]) {
    const hembra = animales.find((animal) => this.isFemale(animal)) ?? animales[0];
    const macho = animales.find((animal) => this.isMale(animal)) ?? animales[1] ?? animales[0];
    if (!hembra) {
      return;
    }
    this.montaForm.update((form) => ({ ...form, vacaId: form.vacaId || hembra.id, toroId: form.toroId || macho?.id || '' }));
    this.inseminacionForm.update((form) => ({ ...form, vacaId: form.vacaId || hembra.id }));
    this.prenezForm.update((form) => ({ ...form, vacaId: form.vacaId || hembra.id }));
    this.partoForm.update((form) => ({ ...form, madreId: form.madreId || hembra.id }));
    this.indiceForm.update((form) => ({ ...form, animalId: form.animalId || hembra.id }));
    this.selectedGenealogiaId.set(this.selectedGenealogiaId() || animales[0]?.id || hembra.id);
    if (this.selectedGenealogiaId()) {
      this.loadGenealogia();
    }
  }

  private normalizeMonta(form: MontaRequest): MontaRequest {
    return { ...form, resultado: form.resultado || 'PENDIENTE', observaciones: form.observaciones || undefined };
  }

  private normalizeInseminacion(form: InseminacionRequest): InseminacionRequest {
    return { ...form, costo: this.optionalNumber(form.costo), resultado: form.resultado || 'PENDIENTE', tecnico: form.tecnico || undefined, observaciones: form.observaciones || undefined };
  }

  private normalizePrenez(form: ControlPrenezRequest): ControlPrenezRequest {
    return { ...form, fechaEstimadaParto: form.fechaEstimadaParto || undefined, nivelRiesgoParto: form.nivelRiesgoParto || 'MEDIO', veterinario: form.veterinario || undefined, observaciones: form.observaciones || undefined };
  }

  private normalizeParto(form: PartoRequest): PartoRequest {
    return { ...form, terneroId: form.terneroId || undefined, complicaciones: form.complicaciones || undefined, viabilidadTernero: form.viabilidadTernero || 'VIABLE', observaciones: form.observaciones || undefined };
  }

  private normalizeIndice(form: IndiceGeneticoRequest): IndiceGeneticoRequest {
    return {
      ...form,
      epd: this.optionalNumber(form.epd),
      dep: this.optionalNumber(form.dep),
      indiceProductivo: this.optionalNumber(form.indiceProductivo),
      fuente: form.fuente || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private optionalNumber(value: unknown): number | undefined {
    return value === '' || value === undefined || value === null ? undefined : Number(value);
  }

  private isFemale(animal: Animal) {
    return ['FEMENINO', 'HEMBRA', 'F', 'FEMALE'].includes(this.normalizeSexo(animal.sexo));
  }

  private isMale(animal: Animal) {
    return ['MASCULINO', 'MACHO', 'TORO', 'M', 'MALE'].includes(this.normalizeSexo(animal.sexo));
  }

  private normalizeSexo(value?: string) {
    return (value ?? '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  private toDisplayRisk(value: string) {
    const normalized = this.normalizeSexo(value);
    if (normalized === 'ALTO' || normalized === 'ALTA') {
      return 'Alto';
    }
    if (normalized === 'BAJO' || normalized === 'BAJA') {
      return 'Bajo';
    }
    return 'Medio';
  }
}
