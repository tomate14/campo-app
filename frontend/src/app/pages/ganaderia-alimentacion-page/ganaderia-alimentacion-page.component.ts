import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { OperariosService } from '../../core/services/operarios.service';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { StatTabsComponent, type StatTab } from '../../shared/stat-tabs/stat-tabs.component';
import { PremiumModalComponent } from '../../shared/premium-modal/premium-modal.component';
import { EntityCardComponent, type EntityChip, type EntityMetric, type EntityTone } from '../../shared/entity-card/entity-card.component';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon.component';
import { ALIMENTACION_ICONS } from './alimentacion-icons';
import type {
  AlertaNutricional,
  AlimentacionResumen,
  Animal,
  Dieta,
  DietaRequest,
  Pesaje,
  PesajeRequest,
  Potrero,
  RegistroAlimentacion,
  RegistroAlimentacionRequest,
} from '../../core/models/ganaderia.models';
import type { Operario } from '../../core/models/operarios.models';

type AlimentacionTab = 'DIETAS' | 'SUMINISTROS' | 'PESAJES' | 'ALERTAS';
type ViewMode = 'TABLA' | 'TARJETAS';
type PillTone = 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan' | 'neutral';

@Component({
  selector: 'app-ganaderia-alimentacion-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RemoteSearchSelectComponent,
    PageHeaderComponent,
    KpiCardComponent,
    StatTabsComponent,
    PremiumModalComponent,
    EntityCardComponent,
    SvgIconComponent,
  ],
  templateUrl: './ganaderia-alimentacion-page.component.html',
  styleUrl: './ganaderia-alimentacion-page.component.css',
})
export class GanaderiaAlimentacionPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);
  private readonly operariosService = inject(OperariosService);

  protected readonly icons = ALIMENTACION_ICONS;

  protected readonly resumen = signal<AlimentacionResumen | null>(null);
  protected readonly animales = signal<Animal[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly activeTab = signal<AlimentacionTab>('DIETAS');
  protected readonly modal = signal<'DIETA' | 'SUMINISTRO' | 'PESAJE' | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(25);
  protected readonly viewMode = signal<ViewMode>('TABLA');
  // Filtros client-side (no disparan llamadas nuevas al backend): buscador, potrero y periodo.
  protected readonly filters = signal<{ search: string; potreroId: string; periodo: string }>({
    search: '',
    potreroId: '',
    periodo: 'TODOS',
  });
  // Catalogos que alimentan los selects con buscador, cargados una sola vez.
  protected readonly potreros = signal<Potrero[]>([]);
  protected readonly operarios = signal<Operario[]>([]);
  // Solo operarios activos para el combo de responsable (replica extraParams {estado:'ACTIVO'}).
  protected readonly operariosActivos = computed(() => this.operarios().filter((operario) => operario.estado === 'ACTIVO'));
  protected readonly metodoPesajeOptions = [
    { value: 'Balanza electronica', label: 'Balanza electronica' },
    { value: 'Balanza mecanica', label: 'Balanza mecanica' },
    { value: 'Cinta bovinometrica', label: 'Cinta bovinometrica' },
    { value: 'Estimacion visual', label: 'Estimacion visual' },
  ];
  protected readonly alimentoOptions = [
    { value: 'Maiz partido', label: 'Maiz partido', tipo: 'Energetico' },
    { value: 'Silo de maiz', label: 'Silo de maiz', tipo: 'Voluminoso' },
    { value: 'Heno de alfalfa', label: 'Heno de alfalfa', tipo: 'Fibra/proteina' },
    { value: 'Expeller de soja', label: 'Expeller de soja', tipo: 'Proteico' },
    { value: 'Nucleo mineral', label: 'Nucleo mineral', tipo: 'Mineral' },
    { value: 'Sales minerales', label: 'Sales minerales', tipo: 'Mineral' },
  ];
  protected readonly periodoOptions = [
    { value: 'TODOS', label: 'Todos los periodos' },
    { value: '7', label: 'Ultimos 7 dias' },
    { value: '30', label: 'Ultimos 30 dias' },
    { value: '90', label: 'Ultimos 90 dias' },
  ];

  protected readonly dietaForm = signal<DietaRequest>({
    nombre: '',
    tipoAnimal: 'BOVINO ENGORDE',
    objetivo: '',
    materiaSecaKg: undefined,
    costoDiario: undefined,
    activa: true,
    observaciones: '',
    ingredientes: [{ ingrediente: '', proporcionPct: 100, costoKg: undefined, materiaSecaPct: undefined }],
  });

  protected readonly suministroForm = signal<RegistroAlimentacionRequest>({
    animalId: '',
    dietaId: '',
    fecha: new Date().toISOString().slice(0, 10),
    alimento: '',
    cantidadKg: 0,
    costoTotal: undefined,
    potreroId: '',
    potrero: '',
    responsable: '',
    observaciones: '',
  });

  protected readonly pesajeForm = signal<PesajeRequest>({
    animalId: '',
    fecha: new Date().toISOString().slice(0, 10),
    pesoKg: 0,
    condicionCorporal: undefined,
    metodo: 'BALANZA',
    responsable: '',
    observaciones: '',
  });

  // Listas filtradas (buscador + potrero + periodo). La paginacion opera sobre estas.
  protected readonly filteredDietas = computed<Dieta[]>(() => {
    const term = this.norm(this.filters().search);
    return (this.resumen()?.dietas ?? []).filter((dieta) => {
      if (!term) return true;
      const haystack = [dieta.nombre, dieta.tipoAnimal, dieta.objetivo, this.composicion(dieta)];
      return haystack.some((value) => this.norm(value).includes(term));
    });
  });

  protected readonly filteredSuministros = computed<RegistroAlimentacion[]>(() => {
    const term = this.norm(this.filters().search);
    const potreroId = this.filters().potreroId;
    return (this.resumen()?.registros ?? []).filter((item) => {
      if (potreroId && item.potreroId !== potreroId) return false;
      if (!this.withinPeriodo(item.fecha)) return false;
      if (!term) return true;
      const haystack = [item.animalCaravana, item.dietaNombre, item.alimento, item.potreroNombre, item.potrero, item.responsableNombre, item.responsable];
      return haystack.some((value) => this.norm(value).includes(term));
    });
  });

  protected readonly filteredPesajes = computed<Pesaje[]>(() => {
    const term = this.norm(this.filters().search);
    return (this.resumen()?.pesajes ?? []).filter((item) => {
      if (!this.withinPeriodo(item.fecha)) return false;
      if (!term) return true;
      const haystack = [item.animalCaravana, this.animalRaza(item.animalId), item.metodo, item.responsableNombre, item.responsable];
      return haystack.some((value) => this.norm(value).includes(term));
    });
  });

  protected readonly filteredAlertas = computed<AlertaNutricional[]>(() => {
    const term = this.norm(this.filters().search);
    return (this.resumen()?.dashboard.alertas ?? []).filter((item) => {
      if (!term) return true;
      const haystack = [item.animalCaravana, item.mensaje, item.tipo, item.prioridad];
      return haystack.some((value) => this.norm(value).includes(term));
    });
  });

  protected readonly totalItems = computed(() => {
    switch (this.activeTab()) {
      case 'SUMINISTROS':
        return this.filteredSuministros().length;
      case 'PESAJES':
        return this.filteredPesajes().length;
      case 'ALERTAS':
        return this.filteredAlertas().length;
      default:
        return this.filteredDietas().length;
    }
  });
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  protected readonly pageStart = computed(() => (this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1));
  protected readonly pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));
  protected readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
  protected readonly activeTabLabel = computed(() => {
    const labels: Record<AlimentacionTab, string> = {
      DIETAS: 'dietas',
      SUMINISTROS: 'suministros',
      PESAJES: 'pesajes',
      ALERTAS: 'alertas',
    };
    return labels[this.activeTab()];
  });
  protected readonly dietasPage = computed(() => this.paginate(this.filteredDietas()));
  protected readonly suministrosPage = computed(() => this.paginate(this.filteredSuministros()));
  protected readonly pesajesPage = computed(() => this.paginate(this.filteredPesajes()));
  protected readonly alertasPage = computed(() => this.paginate(this.filteredAlertas()));

  // Pestanas premium con badge de conteo total (sin filtrar), replicando el mockup.
  protected readonly tabs = computed<StatTab[]>(() => {
    const data = this.resumen();
    return [
      { id: 'DIETAS', label: 'Dietas', icon: this.icons.diet, badge: data?.dietas.length ?? 0 },
      { id: 'SUMINISTROS', label: 'Suministros', icon: this.icons.flask, badge: data?.registros.length ?? 0 },
      { id: 'PESAJES', label: 'Pesajes', icon: this.icons.scale, badge: data?.pesajes.length ?? 0 },
      { id: 'ALERTAS', label: 'Alertas', icon: this.icons.bell, badge: data?.dashboard.alertas.length ?? 0 },
    ];
  });

  // Banner de alertas nutricionales (conteos por prioridad derivados de los datos actuales).
  protected readonly alertasAlta = computed(() => (this.resumen()?.dashboard.alertas ?? []).filter((alerta) => this.norm(alerta.prioridad).includes('alta')).length);
  protected readonly alertasMedia = computed(() => (this.resumen()?.dashboard.alertas ?? []).filter((alerta) => this.norm(alerta.prioridad).includes('media')).length);

  ngOnInit(): void {
    this.loadAll();
    this.loadCatalogos();
  }

  private loadCatalogos() {
    // Los catalogos de potreros y operarios se cargan una sola vez (no por combo).
    this.ganaderiaService.getPotreros().subscribe((potreros) => this.potreros.set(potreros));
    this.operariosService.getOperarios().subscribe((operarios) => this.operarios.set(operarios));
  }

  protected loadAll() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.ganaderiaService.getAnimales({ estado: 'ACTIVO' }).subscribe({
      next: (animales) => {
        this.animales.set(animales);
        this.ganaderiaService.getAlimentacionResumen().subscribe({
          next: (resumen) => {
            this.resumen.set(resumen);
            this.loading.set(false);
          },
          error: () => this.failLoad(),
        });
      },
      error: () => this.failLoad(),
    });
  }

  protected setTab(tab: AlimentacionTab | string) {
    this.activeTab.set(tab as AlimentacionTab);
    this.currentPage.set(1);
  }

  protected setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  protected updateFilter(key: 'search' | 'potreroId' | 'periodo', value: string) {
    this.filters.update((current) => ({ ...current, [key]: value }));
    this.currentPage.set(1);
  }

  protected updatePageSize(value: string | number) {
    this.pageSize.set(Number(value));
    this.currentPage.set(1);
  }

  protected setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected openModal(type: 'DIETA' | 'SUMINISTRO' | 'PESAJE') {
    this.modal.set(type);
  }

  protected closeModal() {
    this.modal.set(null);
  }

  protected submitDieta() {
    this.saving.set(true);
    this.ganaderiaService.createDieta(this.normalizeDieta(this.dietaForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo guardar la dieta.'),
    });
  }

  protected submitSuministro() {
    this.saving.set(true);
    this.ganaderiaService.createRegistroAlimentacion(this.normalizeSuministro(this.suministroForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el suministro.'),
    });
  }

  protected submitPesaje() {
    this.saving.set(true);
    this.ganaderiaService.createPesaje(this.normalizePesaje(this.pesajeForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el pesaje.'),
    });
  }

  protected updateIngrediente(index: number, key: 'ingrediente' | 'proporcionPct' | 'costoKg' | 'materiaSecaPct', value: string | number) {
    this.dietaForm.update((form) => ({
      ...form,
      ingredientes: (form.ingredientes ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
  }

  protected addIngrediente() {
    this.dietaForm.update((form) => ({
      ...form,
      ingredientes: [...(form.ingredientes ?? []), { ingrediente: '', proporcionPct: 0 }],
    }));
  }

  protected trackByIndex(index: number) {
    return index;
  }

  // ---- Helpers de presentacion (solo UI, derivados de datos ya cargados) ----

  protected composicion(dieta: Dieta): string {
    const items = (dieta.ingredientes ?? []).filter((item) => item.ingrediente?.trim());
    if (!items.length) return 'Sin composicion';
    return items.map((item) => `${item.ingrediente} ${item.proporcionPct}%`).join(' · ');
  }

  protected animalRaza(animalId?: string): string {
    if (!animalId) return '';
    return this.animales().find((animal) => animal.id === animalId)?.raza ?? '';
  }

  protected prioridadTone(prioridad: string): PillTone {
    const value = this.norm(prioridad);
    if (value.includes('alta')) return 'red';
    if (value.includes('media')) return 'yellow';
    if (value.includes('baja')) return 'green';
    return 'neutral';
  }

  protected dietaChips(dieta: Dieta): EntityChip[] {
    const chips: EntityChip[] = [{ label: dieta.tipoAnimal, tone: 'blue' }];
    if (dieta.objetivo) chips.push({ label: dieta.objetivo, tone: 'neutral' });
    return chips;
  }

  protected dietaMetrics(dieta: Dieta): EntityMetric[] {
    return [
      { label: 'Materia seca', value: `${dieta.materiaSecaKg ?? 0} kg` },
      { label: 'Costo diario', value: `$${dieta.costoDiario ?? 0}` },
      { label: 'Ingredientes', value: dieta.ingredientes.length },
    ];
  }

  protected suministroMetrics(item: RegistroAlimentacion): EntityMetric[] {
    return [
      { label: 'Fecha', value: this.formatDate(item.fecha) },
      { label: 'Cantidad', value: `${item.cantidadKg} kg` },
      { label: 'Responsable', value: item.responsableNombre || item.responsable || 'Sin responsable' },
    ];
  }

  protected pesajeMetrics(item: Pesaje): EntityMetric[] {
    return [
      { label: 'Fecha', value: this.formatDate(item.fecha) },
      { label: 'Peso', value: `${item.pesoKg} kg` },
      { label: 'BCS', value: item.condicionCorporal ?? 'Sin dato' },
    ];
  }

  protected alertaMetrics(item: AlertaNutricional): EntityMetric[] {
    return [
      { label: 'Tipo', value: item.tipo },
      { label: 'Prioridad', value: item.prioridad },
    ];
  }

  protected asTone(tone: PillTone): EntityTone {
    return tone as EntityTone;
  }

  private formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-AR');
  }

  private norm(value: unknown): string {
    return String(value ?? '').toLowerCase().trim();
  }

  private withinPeriodo(fecha?: string): boolean {
    const periodo = this.filters().periodo;
    if (!periodo || periodo === 'TODOS' || !fecha) return true;
    const days = Number(periodo);
    if (!days) return true;
    const time = new Date(fecha).getTime();
    if (isNaN(time)) return true;
    return time >= Date.now() - days * 86_400_000;
  }

  private normalizeDieta(form: DietaRequest): DietaRequest {
    return {
      ...form,
      materiaSecaKg: this.numberOrUndefined(form.materiaSecaKg),
      costoDiario: this.numberOrUndefined(form.costoDiario),
      ingredientes: (form.ingredientes ?? []).filter((item) => item.ingrediente?.trim()).map((item) => ({
        ...item,
        proporcionPct: Number(item.proporcionPct),
        costoKg: this.numberOrUndefined(item.costoKg),
        materiaSecaPct: this.numberOrUndefined(item.materiaSecaPct),
      })),
    };
  }

  private normalizeSuministro(form: RegistroAlimentacionRequest): RegistroAlimentacionRequest {
    return {
      ...form,
      animalId: form.animalId || undefined,
      dietaId: form.dietaId || undefined,
      cantidadKg: Number(form.cantidadKg),
      costoTotal: this.numberOrUndefined(form.costoTotal),
      potreroId: form.potreroId || undefined,
      potrero: form.potrero || undefined,
      responsable: form.responsable || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private normalizePesaje(form: PesajeRequest): PesajeRequest {
    return {
      ...form,
      pesoKg: Number(form.pesoKg),
      condicionCorporal: this.numberOrUndefined(form.condicionCorporal),
      metodo: form.metodo || undefined,
      responsable: form.responsable || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private numberOrUndefined(value: unknown) {
    return value === undefined || value === null || value === '' ? undefined : Number(value);
  }

  private paginate<T>(items: T[]): T[] {
    const start = (this.currentPage() - 1) * this.pageSize();
    return items.slice(start, start + this.pageSize());
  }

  private afterSave() {
    this.saving.set(false);
    this.closeModal();
    this.loadAll();
  }

  private failLoad() {
    this.loading.set(false);
    this.errorMessage.set('No se pudo cargar alimentación ganadera.');
  }

  private failSave(message: string) {
    this.saving.set(false);
    this.errorMessage.set(message);
  }
}
