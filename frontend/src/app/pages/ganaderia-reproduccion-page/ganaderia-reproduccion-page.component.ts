import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { OperariosService } from '../../core/services/operarios.service';
import type { Operario } from '../../core/models/operarios.models';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { StatTabsComponent, type StatTab } from '../../shared/stat-tabs/stat-tabs.component';
import { PremiumModalComponent } from '../../shared/premium-modal/premium-modal.component';
import { EntityCardComponent, type EntityChip, type EntityMetric, type EntityTone } from '../../shared/entity-card/entity-card.component';
import { InfoTileComponent } from '../../shared/info-tile/info-tile.component';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon.component';
import { REPRO_ICONS } from './reproduccion-icons';
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
type TabId = 'PROXIMOS' | 'SERVICIOS' | 'PRENEZ' | 'PARTOS' | 'INDICES' | 'GENEALOGIA' | 'CRUZAMIENTOS';
type ViewMode = 'TABLA' | 'TARJETAS';

type SeguimientoEvento = {
  tipo: string;
  fecha: string;
  estado: string;
  responsable: string;
  detalle: string;
};

type ProximoRow = {
  alerta: AlertaReproductiva;
  animalCaravana: string;
  raza: string;
  potrero: string;
  fecha: string;
  dias: number;
  partoNumero: number;
  riesgo: string;
};

type ServicioRow = {
  id: string;
  vacaCaravana: string;
  raza: string;
  tipo: 'MONTA' | 'IA';
  tipoLabel: string;
  detalle: string;
  fecha: string;
  tecnico: string;
  resultado: string;
  potrero: string;
};

type PrenezRow = {
  id: string;
  vacaCaravana: string;
  raza: string;
  fechaDiagnostico: string;
  estado: string;
  fechaEstimadaParto: string;
  riesgo: string;
  veterinario: string;
  potrero: string;
};

type PartoRow = {
  id: string;
  madreCaravana: string;
  raza: string;
  partoNumero: number;
  terneroCaravana: string;
  fecha: string;
  viabilidad: string;
  terneroSexo: string;
  terneroPeso: string;
  potrero: string;
};

type IndiceRow = {
  id: string;
  caravana: string;
  sexoLabel: string;
  esMacho: boolean;
  esHembra: boolean;
  raza: string;
  fechaEvaluacion: string;
  epd?: number;
  dep?: number;
  indiceProductivo?: number;
  ranking: string;
};

@Component({
  selector: 'app-ganaderia-reproduccion-page',
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
    InfoTileComponent,
    SvgIconComponent,
  ],
  templateUrl: './ganaderia-reproduccion-page.component.html',
  styleUrl: './ganaderia-reproduccion-page.component.css',
})
export class GanaderiaReproduccionPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);
  private readonly operariosService = inject(OperariosService);

  // Paths de iconos SVG del lenguaje premium (nunca letras/siglas como icono).
  protected readonly icons = REPRO_ICONS;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly mode = signal<FormMode>('MONTA');
  protected readonly resumen = signal<ReproduccionResumen | null>(null);
  protected readonly animales = signal<Animal[]>([]);
  protected readonly operarios = signal<Operario[]>([]);
  protected readonly genealogia = signal<GenealogiaAnimal | null>(null);
  protected readonly genealogiaLoading = signal(false);
  protected readonly selectedGenealogiaId = signal('');
  protected readonly selectedAlert = signal<AlertaReproductiva | null>(null);
  protected readonly selectedAlertDetail = signal<AnimalDetalle | null>(null);

  // Estado de la vista refactorizada (mockups 14-20).
  protected readonly tab = signal<TabId>('PROXIMOS');
  protected readonly viewMode = signal<ViewMode>('TABLA');
  protected readonly eventModalOpen = signal(false);
  protected readonly search = signal('');
  protected readonly potreroFilter = signal('');
  protected readonly riesgoFilter = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(25);

  protected readonly today = new Date().toISOString().slice(0, 10);

  // Indice de animales por id para resolver raza/potrero/sexo sin pegarle al backend.
  protected readonly animalById = computed(() => new Map(this.animales().map((animal) => [animal.id, animal])));

  protected readonly hembras = computed(() => this.animales().filter((animal) => this.isFemale(animal)));
  protected readonly machos = computed(() => this.animales().filter((animal) => this.isMale(animal)));
  // Operarios activos: replica client-side de extraParams { estado: 'ACTIVO' }.
  protected readonly operariosActivos = computed(() =>
    this.operarios().filter((operario) => this.normalizeSexo(operario.estado) === 'ACTIVO'),
  );
  // Veterinarios habilitados: replica client-side de extraParams { estado: 'ACTIVO', rol: 'VETERINARIO' }.
  protected readonly veterinarios = computed(() =>
    this.operariosActivos().filter((operario) => this.normalizeSexo(operario.rolOperativo) === 'VETERINARIO'),
  );

  protected readonly alertasParto = computed(() => this.resumen()?.dashboard.alertas ?? []);
  protected readonly alertasEnRiesgo = computed(() => this.alertasParto().filter((alerta) => alerta.prioridad === 'ALTA').length);
  protected readonly recomendaciones = computed(() => this.resumen()?.dashboard.recomendaciones ?? []);

  // Opciones de filtro de potrero derivadas de la base de animales.
  protected readonly potreroOptions = computed(() =>
    Array.from(new Set(this.animales().map((animal) => animal.potreroNombre).filter(Boolean) as string[])).sort(),
  );

  // ---- Filas de cada pestaña (view-models derivados de los datos ya cargados) ----
  protected readonly proximosRows = computed<ProximoRow[]>(() => {
    const byId = this.animalById();
    return this.alertasParto().map((alerta) => {
      const animal = byId.get(alerta.animalId);
      return {
        alerta,
        animalCaravana: alerta.animalCaravana,
        raza: animal?.raza || 'Sin dato',
        potrero: animal?.potreroNombre || 'Sin potrero',
        fecha: alerta.fecha,
        dias: this.diasRestantes(alerta),
        partoNumero: this.alertaPartoNumber(alerta),
        riesgo: this.riesgoLabel(alerta),
      };
    });
  });

  protected readonly serviciosRows = computed<ServicioRow[]>(() => {
    const data = this.resumen();
    if (!data) {
      return [];
    }
    const byId = this.animalById();
    const montas: ServicioRow[] = data.montas.map((monta) => ({
      id: monta.id,
      vacaCaravana: monta.vacaCaravana,
      raza: byId.get(monta.vacaId)?.raza || 'Sin dato',
      tipo: 'MONTA',
      tipoLabel: 'Monta',
      detalle: `${monta.toroCaravana} · Toro`,
      fecha: monta.fecha,
      tecnico: 'Servicio natural',
      resultado: monta.resultado,
      potrero: byId.get(monta.vacaId)?.potreroNombre || 'Sin potrero',
    }));
    const inseminaciones: ServicioRow[] = data.inseminaciones.map((ia) => ({
      id: ia.id,
      vacaCaravana: ia.vacaCaravana,
      raza: byId.get(ia.vacaId)?.raza || 'Sin dato',
      tipo: 'IA',
      tipoLabel: 'IA',
      detalle: ia.geneticaUsada || 'Sin genética',
      fecha: ia.fecha,
      tecnico: ia.tecnico || 'Sin técnico',
      resultado: ia.resultado,
      potrero: byId.get(ia.vacaId)?.potreroNombre || 'Sin potrero',
    }));
    return [...montas, ...inseminaciones].sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  protected readonly prenezRows = computed<PrenezRow[]>(() => {
    const data = this.resumen();
    if (!data) {
      return [];
    }
    const byId = this.animalById();
    return data.controlesPrenez
      .slice()
      .sort((a, b) => b.fechaDiagnostico.localeCompare(a.fechaDiagnostico))
      .map((control) => ({
        id: control.id,
        vacaCaravana: control.vacaCaravana,
        raza: byId.get(control.vacaId)?.raza || 'Sin dato',
        fechaDiagnostico: control.fechaDiagnostico,
        estado: control.estado,
        fechaEstimadaParto: control.fechaEstimadaParto || 'Sin fecha',
        riesgo: this.toDisplayRisk(control.nivelRiesgoParto || 'MEDIO'),
        veterinario: control.veterinario || 'Sin veterinario',
        potrero: byId.get(control.vacaId)?.potreroNombre || 'Sin potrero',
      }));
  });

  protected readonly partoRows = computed<PartoRow[]>(() => {
    const data = this.resumen();
    if (!data) {
      return [];
    }
    const byId = this.animalById();
    return data.partos
      .slice()
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map((parto) => {
        const madre = byId.get(parto.madreId);
        const ternero = parto.terneroId ? byId.get(parto.terneroId) : undefined;
        const numero = data.partos.filter((item) => item.madreId === parto.madreId && item.fecha <= parto.fecha).length;
        return {
          id: parto.id,
          madreCaravana: parto.madreCaravana,
          raza: madre?.raza || 'Sin dato',
          partoNumero: numero,
          terneroCaravana: parto.terneroCaravana || 'Sin caravana',
          fecha: parto.fecha,
          viabilidad: parto.viabilidadTernero,
          terneroSexo: ternero?.sexo || 'Sin dato',
          terneroPeso: ternero?.pesoActualKg ? `${ternero.pesoActualKg} kg` : '—',
          potrero: madre?.potreroNombre || 'Sin potrero',
        };
      });
  });

  protected readonly indiceRows = computed<IndiceRow[]>(() => {
    const data = this.resumen();
    if (!data) {
      return [];
    }
    const byId = this.animalById();
    const totalMachos = this.animales().filter((animal) => this.isMale(animal)).length;
    const totalHembras = this.animales().filter((animal) => this.isFemale(animal)).length;
    const decorated = data.indices.map((indice) => {
      const animal = byId.get(indice.animalId);
      const grupo = this.isMaleSexo(animal?.sexo) ? 'M' : this.isFemaleSexo(animal?.sexo) ? 'F' : 'X';
      return { indice, animal, grupo };
    });
    const rankByGroup: Record<string, string[]> = { M: [], F: [], X: [] };
    (['M', 'F', 'X'] as const).forEach((grupo) => {
      rankByGroup[grupo] = decorated
        .filter((item) => item.grupo === grupo)
        .slice()
        .sort((a, b) => (b.indice.indiceProductivo ?? -Infinity) - (a.indice.indiceProductivo ?? -Infinity))
        .map((item) => item.indice.id);
    });
    return decorated.map((item) => {
      const ranked = rankByGroup[item.grupo];
      const pos = ranked.indexOf(item.indice.id) + 1;
      const total = item.grupo === 'M' ? totalMachos : item.grupo === 'F' ? totalHembras : ranked.length;
      const ranking = pos && total ? `${pos} de ${total.toLocaleString('es-AR')}` : '—';
      return {
        id: item.indice.id,
        caravana: item.indice.animalCaravana,
        sexoLabel: item.animal?.sexo || 'Sin dato',
        esMacho: item.grupo === 'M',
        esHembra: item.grupo === 'F',
        raza: item.animal?.raza || 'Sin dato',
        fechaEvaluacion: item.indice.fechaEvaluacion,
        epd: item.indice.epd,
        dep: item.indice.dep,
        indiceProductivo: item.indice.indiceProductivo,
        ranking,
      };
    });
  });

  protected readonly genealogiaAncestros = computed(() => this.genealogia()?.ancestros ?? []);
  protected readonly genealogiaGeneraciones = computed(() => {
    const ancestros = this.genealogiaAncestros();
    return ancestros.length ? Math.max(...ancestros.map((nodo) => nodo.generacion)) : 0;
  });

  // ---- Filtrado ----
  protected readonly filteredProximos = computed(() =>
    this.proximosRows().filter(
      (row) =>
        this.textIncludes(this.search(), row.animalCaravana, row.raza, row.potrero) &&
        (!this.potreroFilter() || row.potrero === this.potreroFilter()) &&
        (!this.riesgoFilter() || row.riesgo === this.riesgoFilter()),
    ),
  );
  protected readonly filteredServicios = computed(() =>
    this.serviciosRows().filter(
      (row) =>
        this.textIncludes(this.search(), row.vacaCaravana, row.raza, row.detalle, row.tecnico, row.tipoLabel) &&
        (!this.potreroFilter() || row.potrero === this.potreroFilter()),
    ),
  );
  protected readonly filteredPrenez = computed(() =>
    this.prenezRows().filter(
      (row) =>
        this.textIncludes(this.search(), row.vacaCaravana, row.raza, row.veterinario, row.estado) &&
        (!this.potreroFilter() || row.potrero === this.potreroFilter()) &&
        (!this.riesgoFilter() || row.riesgo === this.riesgoFilter()),
    ),
  );
  protected readonly filteredPartos = computed(() =>
    this.partoRows().filter(
      (row) =>
        this.textIncludes(this.search(), row.madreCaravana, row.raza, row.terneroCaravana, row.viabilidad) &&
        (!this.potreroFilter() || row.potrero === this.potreroFilter()),
    ),
  );
  protected readonly filteredIndices = computed(() =>
    this.indiceRows().filter((row) => this.textIncludes(this.search(), row.caravana, row.raza, row.sexoLabel)),
  );

  // ---- Paginado ----
  protected readonly pagedProximos = computed(() => this.slice(this.filteredProximos()));
  protected readonly pagedServicios = computed(() => this.slice(this.filteredServicios()));
  protected readonly pagedPrenez = computed(() => this.slice(this.filteredPrenez()));
  protected readonly pagedPartos = computed(() => this.slice(this.filteredPartos()));
  protected readonly pagedIndices = computed(() => this.slice(this.filteredIndices()));
  protected readonly pagedRecomendaciones = computed(() => this.slice(this.recomendaciones()));

  protected readonly activeCount = computed(() => {
    switch (this.tab()) {
      case 'PROXIMOS':
        return this.filteredProximos().length;
      case 'SERVICIOS':
        return this.filteredServicios().length;
      case 'PRENEZ':
        return this.filteredPrenez().length;
      case 'PARTOS':
        return this.filteredPartos().length;
      case 'INDICES':
        return this.filteredIndices().length;
      case 'GENEALOGIA':
        return this.genealogiaAncestros().length;
      case 'CRUZAMIENTOS':
        return this.recomendaciones().length;
      default:
        return 0;
    }
  });

  protected readonly unitLabel = computed(() => {
    switch (this.tab()) {
      case 'PROXIMOS':
        return 'partos';
      case 'SERVICIOS':
        return 'servicios';
      case 'PRENEZ':
        return 'diagnósticos';
      case 'PARTOS':
        return 'partos';
      case 'INDICES':
        return 'evaluaciones';
      case 'GENEALOGIA':
        return 'ancestros registrados';
      case 'CRUZAMIENTOS':
        return 'recomendaciones';
      default:
        return '';
    }
  });

  protected readonly tabCountLabel = computed(() => `${this.activeCount()} ${this.unitLabel()}`);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.activeCount() / this.pageSize())));
  protected readonly pageNumbers = computed(() => Array.from({ length: Math.min(this.totalPages(), 5) }, (_, index) => index + 1));
  protected readonly rangeLabel = computed(() => {
    const total = this.activeCount();
    if (!total) {
      return `Mostrando 0 de 0 ${this.unitLabel()}`;
    }
    const start = (this.page() - 1) * this.pageSize() + 1;
    const end = Math.min(this.page() * this.pageSize(), total);
    return `Mostrando ${start} a ${end} de ${total} ${this.unitLabel()}`;
  });

  // Pestañas premium (icono + label + badge con conteo real).
  protected readonly tabs = computed<StatTab[]>(() => [
    { id: 'PROXIMOS', label: 'Próximos partos', icon: this.icons.calendarCheck, badge: this.proximosRows().length },
    { id: 'SERVICIOS', label: 'Servicios', icon: this.icons.male, badge: this.serviciosRows().length },
    { id: 'PRENEZ', label: 'Preñez', icon: this.icons.female, badge: this.prenezRows().length },
    { id: 'PARTOS', label: 'Partos', icon: this.icons.calendar, badge: this.partoRows().length },
    { id: 'INDICES', label: 'Índices genéticos', icon: this.icons.dna, badge: this.indiceRows().length },
    { id: 'GENEALOGIA', label: 'Genealogía', icon: this.icons.tree, badge: this.genealogiaGeneraciones() ? `${this.genealogiaGeneraciones()} gen.` : undefined },
    { id: 'CRUZAMIENTOS', label: 'Cruzamientos', icon: this.icons.link, badge: this.recomendaciones().length },
  ]);

  // Sub-pestañas del modal "Registrar evento".
  protected readonly modeTabs: StatTab[] = [
    { id: 'MONTA', label: 'Monta', icon: this.icons.male },
    { id: 'IA', label: 'Inseminación', icon: this.icons.vial },
    { id: 'PRENEZ', label: 'Preñez', icon: this.icons.female },
    { id: 'PARTO', label: 'Parto', icon: this.icons.calendar },
    { id: 'INDICE', label: 'Índice genético', icon: this.icons.dna },
  ];

  // ---- Modal de detalle de alerta (computeds preservados de la version anterior) ----
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
        .map((item) => ({ tipo: 'Inseminación', fecha: item.fecha, estado: item.resultado, responsable: item.tecnico || 'Sin técnico', detalle: item.geneticaUsada || item.observaciones || 'IA registrada' })),
      ...resumen.controlesPrenez
        .filter((item) => item.vacaId === alert.animalId)
        .map((item) => ({ tipo: 'Diagnóstico', fecha: item.fechaDiagnostico, estado: item.estado, responsable: item.veterinario || 'Sin veterinario', detalle: item.fechaEstimadaParto ? `Parto estimado ${item.fechaEstimadaParto}` : item.observaciones || 'Control de preñez' })),
      ...resumen.partos
        .filter((item) => item.madreId === alert.animalId)
        .map((item) => ({ tipo: 'Parto', fecha: item.fecha, estado: item.viabilidadTernero, responsable: item.terneroCaravana ? `Ternero ${item.terneroCaravana}` : 'Sin ternero asociado', detalle: item.complicaciones || item.observaciones || 'Parto registrado' })),
      ...resumen.indices
        .filter((item) => item.animalId === alert.animalId)
        .map((item) => ({ tipo: 'Índice genético', fecha: item.fechaEvaluacion, estado: 'Evaluado', responsable: item.fuente || 'Sin fuente', detalle: `EPD ${item.epd ?? 's/d'} · DEP ${item.dep ?? 's/d'} · Productivo ${item.indiceProductivo ?? 's/d'}` })),
    ];
    return events.sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  // ---- Formularios (preservados) ----
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
    // Carga unica de operarios; el filtrado por estado/rol se resuelve con computeds en memoria.
    this.operariosService.getOperarios().subscribe({
      next: (operarios) => this.operarios.set(operarios),
      error: () => this.operarios.set([]),
    });
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
        this.page.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar el modulo reproductivo.');
      },
    });
  }

  protected setTab(id: string) {
    const next = id as TabId;
    this.tab.set(next);
    this.page.set(1);
    if (next === 'GENEALOGIA' && !this.genealogia() && !this.genealogiaLoading()) {
      const target = this.selectedGenealogiaId() || this.animales()[0]?.id;
      if (target) {
        this.selectedGenealogiaId.set(target);
        this.loadGenealogia();
      }
    }
  }

  protected setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  protected updateSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  protected updatePotreroFilter(value: string) {
    this.potreroFilter.set(value);
    this.page.set(1);
  }

  protected updateRiesgoFilter(value: string) {
    this.riesgoFilter.set(value);
    this.page.set(1);
  }

  protected setPage(page: number) {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  protected previousPage() {
    this.setPage(this.page() - 1);
  }

  protected nextPage() {
    this.setPage(this.page() + 1);
  }

  protected updatePageSize(value: string) {
    this.pageSize.set(Number(value));
    this.page.set(1);
  }

  protected showFilters() {
    return ['PROXIMOS', 'SERVICIOS', 'PRENEZ', 'PARTOS', 'INDICES'].includes(this.tab());
  }

  protected showRiesgoFilter() {
    return this.tab() === 'PROXIMOS' || this.tab() === 'PRENEZ';
  }

  protected showPagination() {
    return this.tab() !== 'GENEALOGIA';
  }

  protected openEventModal(mode: FormMode = 'MONTA') {
    this.mode.set(mode);
    this.eventModalOpen.set(true);
  }

  protected closeEventModal() {
    this.eventModalOpen.set(false);
  }

  protected setMode(mode: string) {
    this.mode.set(mode as FormMode);
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
    this.genealogiaLoading.set(true);
    this.ganaderiaService.getGenealogia(animalId).subscribe({
      next: (genealogia) => {
        this.genealogia.set(genealogia);
        this.genealogiaLoading.set(false);
      },
      error: () => {
        this.genealogia.set(null);
        this.genealogiaLoading.set(false);
        this.errorMessage.set('No se pudo cargar la genealogia del animal.');
      },
    });
  }

  protected onGenealogiaChange(animalId: string) {
    this.selectedGenealogiaId.set(animalId);
    this.loadGenealogia();
  }

  protected ancestrosPorGeneracion(generacion: number): NodoGenealogia[] {
    return this.genealogiaAncestros().filter((nodo) => nodo.generacion === generacion);
  }

  protected nodoTone(nodo: NodoGenealogia): 'blue' | 'purple' | 'neutral' {
    if (this.isFemaleSexo(nodo.sexo)) return 'purple';
    if (this.isMaleSexo(nodo.sexo)) return 'blue';
    return 'neutral';
  }

  // ---- Tonos de badges/pills ----
  protected servicioTipoTone(tipo: 'MONTA' | 'IA'): EntityTone {
    return tipo === 'MONTA' ? 'blue' : 'cyan';
  }

  protected resultadoTone(resultado: string): EntityTone {
    const value = this.normalizeSexo(resultado);
    if (['PRENADA', 'EXITOSA', 'POSITIVO', 'VIABLE'].includes(value)) return 'green';
    if (['FALLIDA', 'NEGATIVO', 'NO_VIABLE'].includes(value)) return 'red';
    return 'yellow';
  }

  protected estadoPrenezTone(estado: string): EntityTone {
    const value = this.normalizeSexo(estado);
    if (value === 'PRENADA') return 'green';
    if (value === 'VACIA') return 'yellow';
    return 'blue';
  }

  protected riesgoTone(riesgo: string): 'green' | 'yellow' | 'red' {
    const value = this.normalizeSexo(riesgo);
    if (value === 'ALTO' || value === 'ALTA') return 'red';
    if (value === 'BAJO' || value === 'BAJA') return 'green';
    return 'yellow';
  }

  protected viabilidadTone(viabilidad: string): EntityTone {
    const value = this.normalizeSexo(viabilidad);
    if (value === 'VIABLE') return 'green';
    if (value === 'NO_VIABLE') return 'red';
    return 'yellow';
  }

  protected viabilidadLabel(viabilidad: string): string {
    const value = this.normalizeSexo(viabilidad);
    if (value === 'VIABLE') return 'Viable';
    if (value === 'NO_VIABLE') return 'No viable';
    if (value === 'OBSERVACION') return 'Observación';
    return viabilidad;
  }

  protected estadoPrenezLabel(estado: string): string {
    const value = this.normalizeSexo(estado);
    if (value === 'PRENADA') return 'Preñada';
    if (value === 'VACIA') return 'Vacía';
    if (value === 'CONTROL') return 'Control';
    return estado;
  }

  protected formatSigned(value?: number): string {
    if (value === undefined || value === null) {
      return 's/d';
    }
    const formatted = value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return value > 0 ? `+${formatted}` : formatted;
  }

  protected formatNumber(value?: number): string {
    if (value === undefined || value === null) {
      return 's/d';
    }
    return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  }

  // ---- Cruzamientos ----
  protected recommendationQuality(item: RecomendacionCruzamiento) {
    if (item.score >= 70) return 'Alta';
    if (item.score >= 35) return 'Media';
    return 'Baja';
  }

  protected recommendationTone(item: RecomendacionCruzamiento): EntityTone {
    if (item.score >= 70) return 'green';
    if (item.score >= 35) return 'yellow';
    return 'red';
  }

  protected viewRecommendation(item: RecomendacionCruzamiento) {
    this.selectedGenealogiaId.set(item.vacaId);
    this.loadGenealogia();
    this.setTab('GENEALOGIA');
  }

  // ---- Cards (vista Tarjetas) ----
  protected proximoChips(row: ProximoRow): EntityChip[] {
    return [
      { label: `${row.dias} días`, tone: 'blue' },
      { label: `${row.partoNumero}° parto`, tone: 'neutral' },
    ];
  }

  protected proximoMetrics(row: ProximoRow): EntityMetric[] {
    return [
      { label: 'Potrero', value: row.potrero },
      { label: 'Fecha estimada', value: row.fecha },
    ];
  }

  protected servicioChips(row: ServicioRow): EntityChip[] {
    return [
      { label: row.tipoLabel, tone: this.servicioTipoTone(row.tipo) },
      { label: row.resultado, tone: this.resultadoTone(row.resultado) },
    ];
  }

  protected servicioMetrics(row: ServicioRow): EntityMetric[] {
    return [
      { label: 'Toro / Genética', value: row.detalle },
      { label: 'Fecha', value: row.fecha },
      { label: 'Técnico', value: row.tecnico },
    ];
  }

  protected prenezChips(row: PrenezRow): EntityChip[] {
    return [
      { label: this.estadoPrenezLabel(row.estado), tone: this.estadoPrenezTone(row.estado) },
      { label: row.riesgo, tone: this.riesgoTone(row.riesgo) },
    ];
  }

  protected prenezMetrics(row: PrenezRow): EntityMetric[] {
    return [
      { label: 'Diagnóstico', value: row.fechaDiagnostico },
      { label: 'Parto estimado', value: row.fechaEstimadaParto },
      { label: 'Veterinario', value: row.veterinario },
    ];
  }

  protected partoChips(row: PartoRow): EntityChip[] {
    return [
      { label: this.viabilidadLabel(row.viabilidad), tone: this.viabilidadTone(row.viabilidad) },
      { label: `${row.partoNumero}° parto`, tone: 'neutral' },
    ];
  }

  protected partoMetrics(row: PartoRow): EntityMetric[] {
    return [
      { label: 'Ternero', value: row.terneroCaravana },
      { label: 'Sexo', value: row.terneroSexo },
      { label: 'Peso', value: row.terneroPeso },
    ];
  }

  protected indiceChips(row: IndiceRow): EntityChip[] {
    return [{ label: row.sexoLabel, tone: row.esMacho ? 'blue' : row.esHembra ? 'purple' : 'neutral' }];
  }

  protected indiceMetrics(row: IndiceRow): EntityMetric[] {
    return [
      { label: 'EPD', value: this.formatSigned(row.epd) },
      { label: 'DEP', value: this.formatSigned(row.dep) },
      { label: 'Índice productivo', value: this.formatNumber(row.indiceProductivo) },
      { label: 'Ranking rodeo', value: row.ranking },
    ];
  }

  // ---- Modal de detalle de alerta ----
  protected diasRestantes(alerta: AlertaReproductiva) {
    const today = new Date(`${this.today}T00:00:00`);
    const date = new Date(`${alerta.fecha}T00:00:00`);
    return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
  }

  protected riesgoLabel(alerta: AlertaReproductiva) {
    if (alerta.prioridad === 'ALTA') return 'Alto';
    if (alerta.prioridad === 'MEDIA') return 'Medio';
    return 'Bajo';
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
    return this.animales().find((animal) => animal.id === alerta.animalId)?.potreroNombre || 'Sin potrero asignado';
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
    return years ? `${years} años ${remainingMonths} meses` : `${remainingMonths} meses`;
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

  // ---- Guardado ----
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
        this.eventModalOpen.set(false);
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

  private textIncludes(query: string, ...values: (string | number | undefined | null)[]): boolean {
    if (!query.trim()) {
      return true;
    }
    const q = query.trim().toLowerCase();
    return values.filter((value) => value != null).some((value) => String(value).toLowerCase().includes(q));
  }

  private slice<T>(items: T[]): T[] {
    const start = (this.page() - 1) * this.pageSize();
    return items.slice(start, start + this.pageSize());
  }

  private isFemale(animal: Animal) {
    return this.isFemaleSexo(animal.sexo);
  }

  private isMale(animal: Animal) {
    return this.isMaleSexo(animal.sexo);
  }

  private isFemaleSexo(value?: string) {
    return ['FEMENINO', 'HEMBRA', 'F', 'FEMALE'].includes(this.normalizeSexo(value));
  }

  private isMaleSexo(value?: string) {
    return ['MASCULINO', 'MACHO', 'TORO', 'M', 'MALE'].includes(this.normalizeSexo(value));
  }

  private normalizeSexo(value?: string) {
    return (value ?? '')
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
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
