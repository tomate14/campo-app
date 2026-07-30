import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { API_BASE_URL } from '../../core/services/api.config';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { OperariosService } from '../../core/services/operarios.service';
import type { Operario } from '../../core/models/operarios.models';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import type {
  Animal,
  AplicacionVacuna,
  AplicacionVacunaRequest,
  DiagnosticoSanitario,
  DiagnosticoSanitarioRequest,
  PageResponse,
  SanidadDashboard,
  TratamientoMedicamento,
  TratamientoMedicamentoRequest,
  VacunaCatalogo,
  VacunaCatalogoRequest,
} from '../../core/models/ganaderia.models';

type SanidadTab = 'APLICACIONES' | 'TRATAMIENTOS' | 'DIAGNOSTICOS';

@Component({
  selector: 'app-ganaderia-sanidad-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './ganaderia-sanidad-page.component.html',
  styleUrl: './ganaderia-sanidad-page.component.css',
})
export class GanaderiaSanidadPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);
  private readonly operariosService = inject(OperariosService);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly dashboard = signal<SanidadDashboard | null>(null);
  protected readonly animales = signal<Animal[]>([]);
  protected readonly operarios = signal<Operario[]>([]);
  protected readonly vacunas = signal<VacunaCatalogo[]>([]);
  protected readonly aplicaciones = signal<AplicacionVacuna[]>([]);
  protected readonly tratamientos = signal<TratamientoMedicamento[]>([]);
  protected readonly diagnosticos = signal<DiagnosticoSanitario[]>([]);
  protected readonly aplicacionesPage = signal<PageResponse<AplicacionVacuna> | null>(null);
  protected readonly tratamientosPage = signal<PageResponse<TratamientoMedicamento> | null>(null);
  protected readonly diagnosticosPage = signal<PageResponse<DiagnosticoSanitario> | null>(null);

  protected readonly filters = signal({ animalId: '', estadoDiagnostico: '', obligatoria: '' });
  protected readonly vacunaModalOpen = signal(false);
  protected readonly aplicacionModalOpen = signal(false);
  protected readonly tratamientoModalOpen = signal(false);
  protected readonly diagnosticoModalOpen = signal(false);
  protected readonly activeTab = signal<SanidadTab>('APLICACIONES');
  protected readonly tabPage = signal(1);
  protected readonly tabPageSize = 5;
  protected readonly catalogPage = signal(1);
  protected readonly catalogPageSize = 5;
  protected readonly alertasCollapsed = signal(false);
  protected readonly catalogCollapsed = signal(false);
  protected readonly registrosCollapsed = signal(false);
  protected readonly endpoints = {
    animales: `${API_BASE_URL}/ganaderia/trazabilidad/animales`,
    operarios: `${API_BASE_URL}/operarios/gestion/operarios`,
  };
  protected readonly activeOperarioParams = { estado: 'ACTIVO' };
  protected readonly veterinarioParams = { estado: 'ACTIVO', rol: 'VETERINARIO' };

  protected readonly vacunaForm = signal<VacunaCatalogoRequest>({
    codigo: '',
    nombre: '',
    descripcion: '',
    obligatoria: true,
    especie: 'BOVINA',
    frecuenciaDias: undefined,
    edadMinDias: undefined,
    edadMaxDias: undefined,
    dosisRecomendada: '',
    viaAplicacion: '',
    laboratorio: '',
    costoReferencia: undefined,
    stockDisponible: undefined,
    activo: true,
  });

  protected readonly aplicacionForm = signal<AplicacionVacunaRequest>({
    animalId: '',
    vacunaId: '',
    fechaAplicacion: new Date().toISOString().slice(0, 10),
    proximaDosisFecha: '',
    operario: '',
    loteMarca: '',
    costoAplicado: undefined,
    observaciones: '',
  });

  protected readonly tratamientoForm = signal<TratamientoMedicamentoRequest>({
    animalId: '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: '',
    medicamento: '',
    dosis: '',
    viaAplicacion: '',
    responsable: '',
    motivo: '',
    costo: undefined,
    observaciones: '',
  });

  protected readonly diagnosticoForm = signal<DiagnosticoSanitarioRequest>({
    animalId: '',
    fechaDiagnostico: new Date().toISOString().slice(0, 10),
    enfermedad: '',
    severidad: 'MEDIA',
    estado: 'ABIERTO',
    veterinario: '',
    tratamientoIndicado: '',
    observaciones: '',
  });

  // Operarios activos: replica client-side de extraParams { estado: 'ACTIVO' }.
  protected readonly operariosActivos = computed(() =>
    this.operarios().filter((operario) => this.normalizeToken(operario.estado) === 'ACTIVO'),
  );
  // Veterinarios habilitados: replica client-side de extraParams { estado: 'ACTIVO', rol: 'VETERINARIO' }.
  protected readonly veterinarios = computed(() =>
    this.operariosActivos().filter((operario) => this.normalizeToken(operario.rolOperativo) === 'VETERINARIO'),
  );

  protected readonly alertasCriticas = computed(() =>
    (this.dashboard()?.alertasVacunas ?? []).filter((item) => item.estado === 'VENCIDA').length,
  );
  protected readonly alertasVacunacion = computed(() => this.dashboard()?.alertasVacunas ?? []);
  protected readonly alertasVacunacionPorVacuna = computed(() => this.dashboard()?.alertasVacunasPorVacuna ?? []);
  protected readonly totalAnimalesConAlertasVacuna = computed(() =>
    this.alertasVacunacionPorVacuna().reduce((total, item) => total + item.animalesAfectados, 0),
  );
  protected readonly totalProximasAVencer = computed(() =>
    this.alertasVacunacionPorVacuna().reduce((total, item) => total + item.proximasAVencer, 0),
  );
  protected readonly activeTotal = computed(() => {
    if (this.activeTab() === 'TRATAMIENTOS') {
      return this.tratamientosPage()?.totalElements ?? 0;
    }
    if (this.activeTab() === 'DIAGNOSTICOS') {
      return this.diagnosticosPage()?.totalElements ?? 0;
    }
    return this.aplicacionesPage()?.totalElements ?? 0;
  });
  protected readonly tabTotalPages = computed(() => {
    if (this.activeTab() === 'TRATAMIENTOS') {
      return Math.max(1, this.tratamientosPage()?.totalPages ?? 1);
    }
    if (this.activeTab() === 'DIAGNOSTICOS') {
      return Math.max(1, this.diagnosticosPage()?.totalPages ?? 1);
    }
    return Math.max(1, this.aplicacionesPage()?.totalPages ?? 1);
  });
  protected readonly tabPageNumbers = computed(() => Array.from({ length: this.tabTotalPages() }, (_, index) => index + 1));
  protected readonly tabRangeLabel = computed(() => {
    if (!this.activeTotal()) {
      return '0 de 0';
    }
    const activePage = this.activePage();
    const start = (activePage?.number ?? this.tabPage() - 1) * (activePage?.size ?? this.tabPageSize) + 1;
    const end = start + (activePage?.numberOfElements ?? 0) - 1;
    return `${start}-${end} de ${this.activeTotal()}`;
  });
  protected readonly catalogTotalPages = computed(() => Math.max(1, Math.ceil(this.vacunas().length / this.catalogPageSize)));
  protected readonly catalogPageNumbers = computed(() => Array.from({ length: this.catalogTotalPages() }, (_, index) => index + 1));
  protected readonly paginatedVacunas = computed(() => {
    const start = (this.catalogPage() - 1) * this.catalogPageSize;
    return this.vacunas().slice(start, start + this.catalogPageSize);
  });
  protected readonly catalogRangeLabel = computed(() => {
    if (!this.vacunas().length) {
      return '0 de 0';
    }
    const start = (this.catalogPage() - 1) * this.catalogPageSize + 1;
    const end = Math.min(this.catalogPage() * this.catalogPageSize, this.vacunas().length);
    return `${start}-${end} de ${this.vacunas().length}`;
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
        this.loadSanidadData();
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar la base de animales para sanidad.');
      },
    });
  }

  protected loadSanidadData() {
    this.ganaderiaService.getSanidadDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.refreshTables();
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar el dashboard sanitario.');
      },
    });
  }

  protected refreshTables() {
    const obligatoriaValue = this.filters().obligatoria === '' ? undefined : this.filters().obligatoria === 'true';
    const page = this.tabPage() - 1;
    const size = this.tabPageSize;
    forkJoin({
      vacunas: this.ganaderiaService.getVacunas(obligatoriaValue),
      aplicaciones: this.ganaderiaService.getAplicacionesPage({ animalId: this.filters().animalId || undefined, page, size }),
      tratamientos: this.ganaderiaService.getTratamientosPage({ animalId: this.filters().animalId || undefined, page, size }),
      diagnosticos: this.ganaderiaService.getDiagnosticosPage({
        animalId: this.filters().animalId || undefined,
        estado: this.filters().estadoDiagnostico || undefined,
        page,
        size,
      }),
    }).subscribe({
      next: ({ vacunas, aplicaciones, tratamientos, diagnosticos }) => {
        this.vacunas.set(vacunas);
        this.aplicacionesPage.set(aplicaciones);
        this.tratamientosPage.set(tratamientos);
        this.diagnosticosPage.set(diagnosticos);
        this.aplicaciones.set(aplicaciones.content);
        this.tratamientos.set(tratamientos.content);
        this.diagnosticos.set(diagnosticos.content);
        this.catalogPage.set(1);
        this.loading.set(false);
      },
      error: () => this.failLoad(),
    });
  }

  protected updateFilter(key: 'animalId' | 'estadoDiagnostico' | 'obligatoria', value: string) {
    this.filters.update((current) => ({ ...current, [key]: value }));
  }

  protected applyFilters() {
    this.tabPage.set(1);
    this.refreshTables();
  }

  protected setActiveTab(tab: SanidadTab) {
    this.activeTab.set(tab);
    this.tabPage.set(1);
    this.refreshTables();
  }

  protected setTabPage(page: number) {
    this.tabPage.set(Math.min(Math.max(page, 1), this.tabTotalPages()));
    this.refreshTables();
  }

  protected previousTabPage() {
    this.setTabPage(this.tabPage() - 1);
  }

  protected nextTabPage() {
    this.setTabPage(this.tabPage() + 1);
  }

  protected setCatalogPage(page: number) {
    this.catalogPage.set(Math.min(Math.max(page, 1), this.catalogTotalPages()));
  }

  protected previousCatalogPage() {
    this.setCatalogPage(this.catalogPage() - 1);
  }

  protected nextCatalogPage() {
    this.setCatalogPage(this.catalogPage() + 1);
  }

  protected toggleAlertas() {
    this.alertasCollapsed.update((collapsed) => !collapsed);
  }

  protected toggleCatalogo() {
    this.catalogCollapsed.update((collapsed) => !collapsed);
  }

  protected toggleRegistros() {
    this.registrosCollapsed.update((collapsed) => !collapsed);
  }

  private activePage(): PageResponse<AplicacionVacuna | TratamientoMedicamento | DiagnosticoSanitario> | null {
    if (this.activeTab() === 'TRATAMIENTOS') {
      return this.tratamientosPage();
    }
    if (this.activeTab() === 'DIAGNOSTICOS') {
      return this.diagnosticosPage();
    }
    return this.aplicacionesPage();
  }

  protected openVacunaModal() {
    this.vacunaForm.set({
      codigo: '',
      nombre: '',
      descripcion: '',
      obligatoria: true,
      especie: 'BOVINA',
      frecuenciaDias: undefined,
      edadMinDias: undefined,
      edadMaxDias: undefined,
      dosisRecomendada: '',
      viaAplicacion: '',
      laboratorio: '',
      costoReferencia: undefined,
      stockDisponible: undefined,
      activo: true,
    });
    this.vacunaModalOpen.set(true);
  }

  protected openAplicacionModal() {
    this.aplicacionForm.set({
      animalId: this.filters().animalId || '',
      vacunaId: this.vacunas()[0]?.id ?? '',
      fechaAplicacion: new Date().toISOString().slice(0, 10),
      proximaDosisFecha: '',
      operario: '',
      loteMarca: '',
      costoAplicado: undefined,
      observaciones: '',
    });
    this.aplicacionModalOpen.set(true);
  }

  protected openTratamientoModal() {
    this.tratamientoForm.set({
      animalId: this.filters().animalId || '',
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: '',
      medicamento: '',
      dosis: '',
      viaAplicacion: '',
      responsable: '',
      motivo: '',
      costo: undefined,
      observaciones: '',
    });
    this.tratamientoModalOpen.set(true);
  }

  protected openDiagnosticoModal() {
    this.diagnosticoForm.set({
      animalId: this.filters().animalId || '',
      fechaDiagnostico: new Date().toISOString().slice(0, 10),
      enfermedad: '',
      severidad: 'MEDIA',
      estado: 'ABIERTO',
      veterinario: '',
      tratamientoIndicado: '',
      observaciones: '',
    });
    this.diagnosticoModalOpen.set(true);
  }

  protected submitVacuna() {
    this.saving.set(true);
    this.ganaderiaService.createVacuna(this.normalizeVacunaRequest(this.vacunaForm())).subscribe({
      next: () => {
        this.saving.set(false);
        this.vacunaModalOpen.set(false);
        this.refreshTables();
      },
      error: () => this.failSave('No se pudo registrar la vacuna.'),
    });
  }

  protected submitAplicacion() {
    this.saving.set(true);
    this.ganaderiaService.createAplicacion(this.normalizeAplicacionRequest(this.aplicacionForm())).subscribe({
      next: () => {
        this.saving.set(false);
        this.aplicacionModalOpen.set(false);
        this.loadSanidadData();
      },
      error: () => this.failSave('No se pudo registrar la aplicacion.'),
    });
  }

  protected submitTratamiento() {
    this.saving.set(true);
    this.ganaderiaService.createTratamiento(this.normalizeTratamientoRequest(this.tratamientoForm())).subscribe({
      next: () => {
        this.saving.set(false);
        this.tratamientoModalOpen.set(false);
        this.loadSanidadData();
      },
      error: () => this.failSave('No se pudo registrar el tratamiento.'),
    });
  }

  protected submitDiagnostico() {
    this.saving.set(true);
    this.ganaderiaService.createDiagnostico(this.normalizeDiagnosticoRequest(this.diagnosticoForm())).subscribe({
      next: () => {
        this.saving.set(false);
        this.diagnosticoModalOpen.set(false);
        this.loadSanidadData();
      },
      error: () => this.failSave('No se pudo registrar el diagnostico.'),
    });
  }

  protected exportReporte() {
    this.ganaderiaService.exportReporteSanitario().subscribe((content) => {
      const blob = new Blob([content ?? ''], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'sanidad-auditoria.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  protected closeModals() {
    this.vacunaModalOpen.set(false);
    this.aplicacionModalOpen.set(false);
    this.tratamientoModalOpen.set(false);
    this.diagnosticoModalOpen.set(false);
  }

  private normalizeVacunaRequest(form: VacunaCatalogoRequest): VacunaCatalogoRequest {
    return {
      ...form,
      descripcion: form.descripcion || undefined,
      especie: form.especie || 'BOVINA',
      dosisRecomendada: form.dosisRecomendada || undefined,
      viaAplicacion: form.viaAplicacion || undefined,
      laboratorio: form.laboratorio || undefined,
      frecuenciaDias: form.frecuenciaDias === ('' as unknown as number) ? undefined : Number(form.frecuenciaDias),
      edadMinDias: form.edadMinDias === ('' as unknown as number) ? undefined : Number(form.edadMinDias),
      edadMaxDias: form.edadMaxDias === ('' as unknown as number) ? undefined : Number(form.edadMaxDias),
      costoReferencia: form.costoReferencia === ('' as unknown as number) ? undefined : Number(form.costoReferencia),
      stockDisponible: form.stockDisponible === ('' as unknown as number) ? undefined : Number(form.stockDisponible),
    };
  }

  private normalizeAplicacionRequest(form: AplicacionVacunaRequest): AplicacionVacunaRequest {
    return {
      ...form,
      proximaDosisFecha: form.proximaDosisFecha || undefined,
      operario: form.operario || undefined,
      loteMarca: form.loteMarca || undefined,
      costoAplicado: form.costoAplicado === ('' as unknown as number) ? undefined : Number(form.costoAplicado),
      observaciones: form.observaciones || undefined,
    };
  }

  private normalizeTratamientoRequest(form: TratamientoMedicamentoRequest): TratamientoMedicamentoRequest {
    return {
      ...form,
      fechaFin: form.fechaFin || undefined,
      dosis: form.dosis || undefined,
      viaAplicacion: form.viaAplicacion || undefined,
      responsable: form.responsable || undefined,
      motivo: form.motivo || undefined,
      costo: form.costo === ('' as unknown as number) ? undefined : Number(form.costo),
      observaciones: form.observaciones || undefined,
    };
  }

  private normalizeDiagnosticoRequest(form: DiagnosticoSanitarioRequest): DiagnosticoSanitarioRequest {
    return {
      ...form,
      veterinario: form.veterinario || undefined,
      tratamientoIndicado: form.tratamientoIndicado || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  // Normaliza texto (NFD + mayusculas, sin acentos) para comparar estado/rol de operarios.
  private normalizeToken(value?: string) {
    return (value ?? '')
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase();
  }

  private failLoad() {
    this.loading.set(false);
    this.errorMessage.set('No se pudo cargar la informacion sanitaria.');
  }

  private failSave(message: string) {
    this.saving.set(false);
    this.errorMessage.set(message);
  }
}
