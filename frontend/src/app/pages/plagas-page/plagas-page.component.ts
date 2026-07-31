import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import { forkJoin, type Observable } from 'rxjs';
import { AgricolaService } from '../../core/services/agricola.service';
import { OperariosService } from '../../core/services/operarios.service';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import type { Operario } from '../../core/models/operarios.models';
import type {
  AplicacionFitosanitaria,
  AplicacionFitosanitariaRequest,
  CatalogoPlaga,
  CatalogoPlagaRequest,
  DeteccionPlaga,
  DeteccionPlagaRequest,
  EstadoDeteccionPlaga,
  EventoSiembra,
  HistoricoCultivo,
  Lote,
  PageResponse,
  PlagasDashboard,
  RegistroCosecha,
  ResultadoSeguimientoPlaga,
  SeguimientoPlaga,
  SeguimientoPlagaRequest,
  SeveridadPlaga,
  TipoPlaga,
} from '../../core/models/agricola.models';

type ActiveTab = 'DETECCIONES' | 'APLICACIONES' | 'SEGUIMIENTOS' | 'CATALOGO';
type ModalType = 'DETECCION' | 'APLICACION' | 'SEGUIMIENTO' | 'HISTORICO' | 'CATALOGO' | null;
type HistorialPlagaEvento = {
  tipo: string;
  fecha: string;
  titulo: string;
  detalle: string;
  responsable?: string;
  estado?: string;
};
type DeteccionPinGroup = {
  key: string;
  latitud: number;
  longitud: number;
  detecciones: DeteccionPlaga[];
};

@Component({
  selector: 'app-plagas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMapLibreGLModule, RemoteSearchSelectComponent],
  templateUrl: './plagas-page.component.html',
  styleUrl: './plagas-page.component.css',
})
export class PlagasPageComponent {
  private readonly agricolaService = inject(AgricolaService);
  private readonly operariosService = inject(OperariosService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly dashboard = signal<PlagasDashboard | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly operarios = signal<Operario[]>([]);
  protected readonly catalogo = signal<CatalogoPlaga[]>([]);
  protected readonly catalogoOpciones = signal<CatalogoPlaga[]>([]);
  protected readonly detecciones = signal<DeteccionPlaga[]>([]);
  protected readonly mapDetecciones = signal<DeteccionPlaga[]>([]);
  protected readonly aplicaciones = signal<AplicacionFitosanitaria[]>([]);
  protected readonly seguimientos = signal<SeguimientoPlaga[]>([]);
  protected readonly activeTab = signal<ActiveTab>('DETECCIONES');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;
  protected readonly tableLoading = signal(false);
  protected readonly pageTotals = signal<Record<ActiveTab, number>>({
    DETECCIONES: 0,
    APLICACIONES: 0,
    SEGUIMIENTOS: 0,
    CATALOGO: 0,
  });
  protected readonly modal = signal<ModalType>(null);
  protected readonly selectedDeteccion = signal<DeteccionPlaga | null>(null);
  protected readonly selectedPinGroup = signal<DeteccionPinGroup | null>(null);
  protected readonly selectedPinIndex = signal(0);
  protected readonly historialEventos = signal<HistorialPlagaEvento[]>([]);
  protected readonly historialLoading = signal(false);
  protected readonly historialLote = signal<Lote | null>(null);
  protected readonly historialScope = signal<'DETECCION' | 'LOTE'>('LOTE');

  protected readonly severidades: SeveridadPlaga[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
  protected readonly estados: EstadoDeteccionPlaga[] = ['ABIERTA', 'EN_TRATAMIENTO', 'CONTROLADA', 'CERRADA'];
  protected readonly tipos: TipoPlaga[] = ['PLAGA', 'ENFERMEDAD', 'MALEZA'];
  protected readonly resultados: ResultadoSeguimientoPlaga[] = ['SIN_CAMBIOS', 'MEJORA', 'EMPEORA', 'CONTROLADA'];
  // Operarios activos para los combos (reemplaza el filtro extraParams estado:ACTIVO)
  protected readonly operariosActivos = computed(() => this.operarios().filter((operario) => operario.estado === 'ACTIVO'));

  protected readonly filters = signal<{ loteId?: string; cultivo?: string; severidad?: SeveridadPlaga; estado?: EstadoDeteccionPlaga }>({});
  protected readonly deteccionForm = signal<DeteccionPlagaRequest>({ loteId: '', catalogoPlagaId: '', severidad: 'MEDIA', estado: 'ABIERTA', origenGeolocalizacion: 'WEB_MAPA', fechaDeteccion: this.nowLocalDateTime() });
  protected readonly aplicacionForm = signal<AplicacionFitosanitariaRequest>({ producto: '', dosis: 0, unidadDosis: 'l/ha', operarioResponsableId: '', operarioResponsable: '', fechaAplicacion: this.nowLocalDateTime() });
  protected readonly seguimientoForm = signal<SeguimientoPlagaRequest>({ resultado: 'SIN_CAMBIOS', severidad: 'MEDIA', fecha: this.nowLocalDateTime() });
  protected readonly catalogoForm = signal<CatalogoPlagaRequest>({ nombreComun: '', tipo: 'PLAGA', activo: true });

  protected readonly mapMode = signal<'satelite' | 'mapa'>('satelite');
  protected readonly streetStyle = 'https://tiles.openfreemap.org/styles/bright';
  protected readonly satelliteStyle: StyleSpecification = {
    version: 8,
    sources: {
      satellite: {
        type: 'raster',
        tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'],
        tileSize: 256,
        attribution: 'EOX Sentinel-2 cloudless',
      },
    },
    layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
  };
  protected readonly mapStyle = computed(() => this.mapMode() === 'satelite' ? this.satelliteStyle : this.streetStyle);
  protected readonly center = computed<[number, number]>(() => {
    const lote = this.selectedLote();
    if (lote?.longitud !== undefined && lote?.latitud !== undefined) {
      return [lote.longitud, lote.latitud];
    }

    return this.computeMapCenter(this.mapData());
  });
  protected readonly zoom = computed<[number]>(() => this.filters().loteId ? [13] : [9]);
  protected readonly selectedLote = computed(() => this.lotes().find((lote) => lote.id === this.filters().loteId));
  protected readonly filteredLotes = computed(() => {
    const filters = this.filters();
    return this.lotes().filter((lote) => {
      const sameLote = !filters.loteId || lote.id === filters.loteId;
      const sameCultivo = !filters.cultivo || lote.cultivo?.toLowerCase().includes(filters.cultivo.toLowerCase());
      return sameLote && sameCultivo;
    });
  });
  protected readonly mapData = computed<FeatureCollection<Polygon | MultiPolygon>>(() => {
    const features = this.filteredLotes()
      .map((lote) => this.toLoteFeature(lote))
      .filter((feature): feature is FeatureCollection<Polygon | MultiPolygon>['features'][number] => feature !== null);

    return { type: 'FeatureCollection', features };
  });
  protected readonly selectedLoteLabel = computed(() => this.selectedLote()?.nombre ?? 'Todos los lotes');
  protected readonly selectedLoteCultivo = computed(() => this.selectedLote()?.cultivo);
  protected readonly selectedLoteForForm = computed(() => this.selectedLote() ?? this.filteredLotes()[0] ?? this.lotes()[0]);
  protected readonly mapTitle = computed(() => this.filters().loteId ? 'Mapa operativo del lote' : 'Mapa operativo de lotes');
  protected readonly mapSubtitle = computed(() => this.filters().loteId
    ? 'Seleccioná un punto para registrar una detección web. Los pins muestran alertas ya cargadas.'
    : 'Vista global de los lotes filtrados. Seleccioná un lote específico para registrar una detección.'
  );
  // Centro (centroide) de cada lote a partir de su poligono, para ubicar
  // detecciones sin coordenadas propias (fallback igual al del mobile).
  private readonly loteCenters = computed<Map<string, { lat: number; lng: number }>>(() => {
    const centers = new Map<string, { lat: number; lng: number }>();
    this.lotes().forEach((lote) => {
      const center = this.loteCenterFromPolygon(lote.poligono);
      if (center) {
        centers.set(lote.id, center);
      }
    });
    return centers;
  });
  protected readonly pins = computed<DeteccionPinGroup[]>(() => {
    const filters = this.filters();
    const groups = new Map<string, DeteccionPinGroup>();

    const loteCenters = this.loteCenters();
    this.mapDetecciones().forEach((item) => {
      const sameLote = !filters.loteId || item.loteId === filters.loteId;
      const sameCultivo = !filters.cultivo || item.cultivo?.toLowerCase().includes(filters.cultivo.toLowerCase()) || false;
      const sameSeveridad = !filters.severidad || item.severidad === filters.severidad;
      const sameEstado = !filters.estado || item.estado === filters.estado;
      if (!sameLote || !sameCultivo || !sameSeveridad || !sameEstado) return;

      // Coordenada propia de la deteccion; si no trae, fallback al centro del lote
      // (mismo criterio que mobile, para que web y mobile muestren los mismos pines)
      let latitud = Number(item.latitud);
      let longitud = Number(item.longitud);
      if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
        const center = loteCenters.get(item.loteId);
        if (!center) return;
        latitud = center.lat;
        longitud = center.lng;
      }

      const key = `${latitud.toFixed(7)},${longitud.toFixed(7)}`;
      const current = groups.get(key);
      if (current) {
        current.detecciones.push(item);
        return;
      }

      groups.set(key, { key, latitud, longitud, detecciones: [item] });
    });

    return Array.from(groups.values());
  });
  protected readonly selectedPin = computed(() => {
    const group = this.selectedPinGroup();
    return group?.detecciones[this.selectedPinIndex()] ?? null;
  });
  protected readonly selectedPinTotal = computed(() => this.selectedPinGroup()?.detecciones.length ?? 0);
  protected readonly totalItems = computed(() => this.pageTotals()[this.activeTab()]);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));
  protected readonly currentItems = computed<Array<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>(() => {
    switch (this.activeTab()) {
      case 'APLICACIONES': return this.aplicaciones();
      case 'SEGUIMIENTOS': return this.seguimientos();
      case 'CATALOGO': return this.catalogo();
      default: return this.detecciones();
    }
  });
  protected readonly pageItems = computed<Array<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>(() => this.currentItems());

  constructor() {
    this.loadAll();
  }

  protected loadAll() {
    this.loading.set(true);
    this.errorMessage.set('');
    forkJoin({
      dashboard: this.agricolaService.getPlagasDashboard(),
      lotes: this.agricolaService.getLotes(),
      operarios: this.operariosService.getOperarios({ estado: 'ACTIVO' }),
      catalogo: this.agricolaService.getCatalogoPlagasPage({ page: 0, size: this.pageSize }),
      catalogoCompleto: this.agricolaService.getCatalogoPlagas(),
      detecciones: this.agricolaService.getDeteccionesPlagaPage({ ...this.filters(), page: 0, size: this.pageSize }),
      mapaDetecciones: this.agricolaService.getDeteccionesPlaga(this.filters()),
      aplicaciones: this.agricolaService.getAplicacionesFitosanitariasPage({ page: 0, size: this.pageSize }),
      seguimientos: this.agricolaService.getSeguimientosPlagaPage({ page: 0, size: this.pageSize }),
    }).subscribe({
      next: (data) => {
        this.dashboard.set(data.dashboard);
        this.lotes.set(data.lotes);
        this.operarios.set(data.operarios);
        this.catalogo.set(data.catalogo.content);
        this.catalogoOpciones.set(data.catalogoCompleto);
        this.detecciones.set(data.detecciones.content);
        this.mapDetecciones.set(data.mapaDetecciones);
        this.aplicaciones.set(data.aplicaciones.content);
        this.seguimientos.set(data.seguimientos.content);
        this.pageTotals.set({
          DETECCIONES: data.detecciones.totalElements,
          APLICACIONES: data.aplicaciones.totalElements,
          SEGUIMIENTOS: data.seguimientos.totalElements,
          CATALOGO: data.catalogo.totalElements,
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar control de plagas.');
        this.loading.set(false);
      },
    });
  }

  protected applyFilters() {
    this.currentPage.set(1);
    const filters = this.filters();
    forkJoin({
      mapaDetecciones: this.agricolaService.getDeteccionesPlaga(filters),
      page: this.agricolaService.getDeteccionesPlagaPage({ ...filters, page: 0, size: this.pageSize }),
    }).subscribe({
      next: ({ mapaDetecciones, page }) => {
        this.mapDetecciones.set(mapaDetecciones);
        this.detecciones.set(page.content);
        this.pageTotals.update((totals) => ({ ...totals, DETECCIONES: page.totalElements }));
        this.closePinCard();
        if (this.activeTab() !== 'DETECCIONES') {
          this.setTab('DETECCIONES');
        }
      },
      error: () => this.errorMessage.set('No se pudieron aplicar los filtros.'),
    });
  }

  protected setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadTablePage(tab, 1);
  }

  protected setPage(page: number) {
    const normalized = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(normalized);
    this.loadTablePage(this.activeTab(), normalized);
  }

  protected visiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, Math.min(current - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  protected pageFrom(): number {
    return this.totalItems() ? ((this.currentPage() - 1) * this.pageSize) + 1 : 0;
  }

  protected pageTo(): number {
    return Math.min(this.currentPage() * this.pageSize, this.totalItems());
  }

  protected openModal(type: ModalType, deteccion?: DeteccionPlaga) {
    this.selectedDeteccion.set(deteccion ?? null);
    if (type !== 'HISTORICO') {
      this.historialEventos.set([]);
      this.historialLote.set(null);
      this.historialLoading.set(false);
    }
    if (type === 'DETECCION') {
      const lote = this.selectedLoteForForm();
      this.deteccionForm.set({ loteId: lote?.id ?? '', catalogoPlagaId: this.catalogoOpciones()[0]?.id ?? '', cultivo: lote?.cultivo, severidad: 'MEDIA', estado: 'ABIERTA', origenGeolocalizacion: 'WEB_MAPA', fechaDeteccion: this.nowLocalDateTime() });
    }
    if (type === 'APLICACION') {
      this.aplicacionForm.set({ producto: '', dosis: 0, unidadDosis: 'l/ha', operarioResponsableId: '', operarioResponsable: '', fechaAplicacion: this.nowLocalDateTime() });
    }
    if (type === 'SEGUIMIENTO') {
      this.seguimientoForm.set({ resultado: 'SIN_CAMBIOS', severidad: deteccion?.severidad ?? 'MEDIA', fecha: this.nowLocalDateTime() });
    }
    if (type === 'HISTORICO' && deteccion) {
      this.loadHistorialDeteccion(deteccion);
    }
    this.modal.set(type);
  }

  protected closeModal() {
    this.modal.set(null);
    this.selectedDeteccion.set(null);
    this.historialEventos.set([]);
    this.historialLote.set(null);
    this.historialScope.set('LOTE');
    this.historialLoading.set(false);
  }

  protected onMapClick(event: any) {
    const lat = Number(event.lngLat.lat.toFixed(7));
    const lng = Number(event.lngLat.lng.toFixed(7));
    const selected = this.selectedLote();
    if (selected) {
      this.openDetectionFromMap(selected, lat, lng);
      return;
    }

    this.agricolaService.resolverLotePorPunto(lat, lng).subscribe({
      next: (response) => {
        const resolved = response.loteId ? this.lotes().find((lote) => lote.id === response.loteId) : undefined;
        this.openDetectionFromMap(resolved ?? this.selectedLoteForForm(), lat, lng);
      },
      error: () => this.openDetectionFromMap(this.selectedLoteForForm(), lat, lng),
    });
  }

  protected submitDeteccion() {
    this.saving.set(true);
    this.agricolaService.createDeteccionPlaga(this.deteccionForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo guardar la detección.') });
  }

  protected submitAplicacion() {
    const deteccion = this.selectedDeteccion();
    if (!deteccion) return;
    this.saving.set(true);
    this.agricolaService.createAplicacionFitosanitaria(deteccion.id, this.aplicacionForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo registrar la aplicación.') });
  }

  protected submitSeguimiento() {
    const deteccion = this.selectedDeteccion();
    if (!deteccion) return;
    this.saving.set(true);
    this.agricolaService.createSeguimientoPlaga(deteccion.id, this.seguimientoForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo registrar el seguimiento.') });
  }

  protected submitCatalogo() {
    this.saving.set(true);
    this.agricolaService.createCatalogoPlaga(this.catalogoForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo guardar el catálogo.') });
  }

  protected openHistorialLoteSeleccionado() {
    const lote = this.selectedLote();
    if (!lote) return;
    this.selectedDeteccion.set(null);
    this.modal.set('HISTORICO');
    this.loadHistorialLoteById(lote.id);
  }

  protected historialModalTitle() {
    return this.historialScope() === 'DETECCION' ? 'Historico de la deteccion' : 'Historico del lote';
  }

  protected historialModalSubtitle() {
    const deteccion = this.selectedDeteccion();
    if (this.historialScope() === 'DETECCION' && deteccion) {
      return `${deteccion.plagaNombre} · ${deteccion.loteNombre}`;
    }
    return `${this.historialLote()?.nombre || deteccion?.loteNombre || 'Lote'} · eventos productivos y sanitarios`;
  }

  protected severityClass(value?: SeveridadPlaga) {
    return `severity-${(value ?? 'MEDIA').toLowerCase()}`;
  }

  protected pinColor(value?: SeveridadPlaga) {
    return value === 'CRITICA' ? '#ff6b6b' : value === 'ALTA' ? '#ff8a4c' : value === 'MEDIA' ? '#ffb84d' : '#9fe870';
  }

  protected openPinCard(group: DeteccionPinGroup) {
    this.selectedPinGroup.set(group);
    this.selectedPinIndex.set(0);
  }

  protected closePinCard() {
    this.selectedPinGroup.set(null);
    this.selectedPinIndex.set(0);
  }

  protected previousPinDetection() {
    this.selectedPinIndex.update((value) => Math.max(value - 1, 0));
  }

  protected nextPinDetection() {
    const total = this.selectedPinGroup()?.detecciones.length ?? 0;
    this.selectedPinIndex.update((value) => Math.min(value + 1, Math.max(total - 1, 0)));
  }

  private afterSave() {
    this.saving.set(false);
    this.closeModal();
    this.loadAll();
  }

  private loadTablePage(tab: ActiveTab, page: number) {
    this.tableLoading.set(true);
    const requestPage = Math.max(0, page - 1);
    const request$: Observable<PageResponse<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>> = tab === 'APLICACIONES'
      ? this.agricolaService.getAplicacionesFitosanitariasPage({ page: requestPage, size: this.pageSize }) as Observable<PageResponse<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>
      : tab === 'SEGUIMIENTOS'
        ? this.agricolaService.getSeguimientosPlagaPage({ page: requestPage, size: this.pageSize }) as Observable<PageResponse<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>
        : tab === 'CATALOGO'
          ? this.agricolaService.getCatalogoPlagasPage({ page: requestPage, size: this.pageSize }) as Observable<PageResponse<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>
          : this.agricolaService.getDeteccionesPlagaPage({ ...this.filters(), page: requestPage, size: this.pageSize }) as Observable<PageResponse<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>;

    request$.subscribe({
      next: (pageData) => {
        if (tab === 'APLICACIONES') this.aplicaciones.set(pageData.content as AplicacionFitosanitaria[]);
        if (tab === 'SEGUIMIENTOS') this.seguimientos.set(pageData.content as SeguimientoPlaga[]);
        if (tab === 'CATALOGO') this.catalogo.set(pageData.content as CatalogoPlaga[]);
        if (tab === 'DETECCIONES') this.detecciones.set(pageData.content as DeteccionPlaga[]);
        this.pageTotals.update((totals) => ({ ...totals, [tab]: pageData.totalElements }));
        this.tableLoading.set(false);
      },
      error: () => {
        this.tableLoading.set(false);
        this.errorMessage.set('No se pudo cargar la pagina solicitada.');
      },
    });
  }

  private failSave(message: string) {
    this.saving.set(false);
    this.errorMessage.set(message);
  }

  private openDetectionFromMap(lote: Lote | undefined, lat: number, lng: number) {
    this.openModal('DETECCION');
    this.deteccionForm.update((form) => ({
      ...form,
      loteId: lote?.id ?? form.loteId,
      cultivo: lote?.cultivo ?? form.cultivo,
      latitud: lat,
      longitud: lng,
      origenGeolocalizacion: 'WEB_MAPA',
    }));
  }

  private loadHistorialLote(deteccion: DeteccionPlaga) {
    this.loadHistorialLoteById(deteccion.loteId);
  }

  private loadHistorialLoteById(loteId: string) {
    const lote = this.lotes().find((item) => item.id === loteId) ?? null;
    this.historialLote.set(lote);
    this.historialScope.set('LOTE');
    this.historialLoading.set(true);
    this.historialEventos.set([]);

    forkJoin({
      siembra: this.agricolaService.getEventosByLote(loteId),
      cosechas: this.agricolaService.getCosechasByLote(loteId),
      cultivos: this.agricolaService.getHistorialByLote(loteId),
      aplicaciones: this.agricolaService.getAplicacionesFitosanitarias(),
      seguimientos: this.agricolaService.getSeguimientosPlaga(),
    }).subscribe({
      next: ({ siembra, cosechas, cultivos, aplicaciones, seguimientos }) => {
        this.historialEventos.set(this.buildHistorialLote(loteId, siembra, cosechas, cultivos, aplicaciones, seguimientos));
        this.historialLoading.set(false);
      },
      error: () => {
        this.historialEventos.set(this.buildHistorialLote(loteId, [], [], [], [], []));
        this.historialLoading.set(false);
        this.errorMessage.set('No se pudo cargar el historial completo del lote.');
      },
    });
  }

  private loadHistorialDeteccion(deteccion: DeteccionPlaga) {
    const lote = this.lotes().find((item) => item.id === deteccion.loteId) ?? null;
    this.historialLote.set(lote);
    this.historialScope.set('DETECCION');
    this.historialLoading.set(true);
    this.historialEventos.set([]);

    forkJoin({
      aplicaciones: this.agricolaService.getAplicacionesFitosanitarias(),
      seguimientos: this.agricolaService.getSeguimientosPlaga(),
    }).subscribe({
      next: ({ aplicaciones, seguimientos }) => {
        this.historialEventos.set(this.buildHistorialDeteccion(deteccion, aplicaciones, seguimientos));
        this.historialLoading.set(false);
      },
      error: () => {
        this.historialEventos.set(this.buildHistorialDeteccion(deteccion, [], []));
        this.historialLoading.set(false);
        this.errorMessage.set('No se pudo cargar el historial de la deteccion.');
      },
    });
  }

  private buildHistorialDeteccion(
    deteccion: DeteccionPlaga,
    aplicaciones: AplicacionFitosanitaria[],
    seguimientos: SeguimientoPlaga[],
  ): HistorialPlagaEvento[] {
    const deteccionEvent: HistorialPlagaEvento = {
      tipo: 'DETECCION',
      fecha: deteccion.fechaDeteccion,
      titulo: deteccion.plagaNombre,
      detalle: `${deteccion.severidad}${deteccion.areaAfectadaHa ? ` · ${deteccion.areaAfectadaHa} ha` : ''}`,
      responsable: deteccion.responsable,
      estado: deteccion.estado,
    };
    const aplicacionEvents = aplicaciones
      .filter((item) => item.deteccionId === deteccion.id)
      .map((item): HistorialPlagaEvento => ({
        tipo: 'APLICACION',
        fecha: item.fechaAplicacion,
        titulo: item.producto,
        detalle: `${item.dosis} ${item.unidadDosis}${item.superficieTratadaHa ? ` · ${item.superficieTratadaHa} ha` : ''}`,
        responsable: item.operarioResponsable,
        estado: item.principioActivo || 'Aplicada',
      }));
    const seguimientoEvents = seguimientos
      .filter((item) => item.deteccionId === deteccion.id)
      .map((item): HistorialPlagaEvento => ({
        tipo: 'SEGUIMIENTO',
        fecha: item.fecha,
        titulo: item.plagaNombre,
        detalle: item.observaciones || item.resultado,
        responsable: item.responsable,
        estado: item.severidad,
      }));

    return [deteccionEvent, ...aplicacionEvents, ...seguimientoEvents]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  private buildHistorialLote(
    loteId: string,
    siembra: EventoSiembra[],
    cosechas: RegistroCosecha[],
    cultivos: HistoricoCultivo[],
    aplicaciones: AplicacionFitosanitaria[],
    seguimientos: SeguimientoPlaga[],
  ): HistorialPlagaEvento[] {
    const detecciones = this.mapDetecciones().filter((item) => item.loteId === loteId);
    const detectionIds = new Set(detecciones.map((item) => item.id));
    const deteccionEvents = detecciones.map((item): HistorialPlagaEvento => ({
      tipo: 'DETECCION',
      fecha: item.fechaDeteccion,
      titulo: item.plagaNombre,
      detalle: `${item.severidad}${item.areaAfectadaHa ? ` · ${item.areaAfectadaHa} ha` : ''}`,
      responsable: item.responsable,
      estado: item.estado,
    }));
    const aplicacionEvents = aplicaciones
      .filter((item) => item.loteId === loteId)
      .map((item): HistorialPlagaEvento => ({
        tipo: 'APLICACION',
        fecha: item.fechaAplicacion,
        titulo: item.producto,
        detalle: `${item.dosis} ${item.unidadDosis}${item.superficieTratadaHa ? ` · ${item.superficieTratadaHa} ha` : ''}`,
        responsable: item.operarioResponsable,
        estado: item.principioActivo || 'Aplicada',
      }));
    const seguimientoEvents = seguimientos
      .filter((item) => detectionIds.has(item.deteccionId))
      .map((item): HistorialPlagaEvento => ({
        tipo: 'SEGUIMIENTO',
        fecha: item.fecha,
        titulo: item.plagaNombre,
        detalle: item.observaciones || item.resultado,
        responsable: item.responsable,
        estado: item.severidad,
      }));
    const siembraEvents = siembra.map((item): HistorialPlagaEvento => ({
      tipo: item.tipoEvento === 'SIEMBRA' ? 'SIEMBRA' : 'EVENTO',
      fecha: item.fecha,
      titulo: item.estadoFenologico || item.tipoEvento,
      detalle: item.descripcion || item.loteNombre,
      estado: item.tipoEvento,
    }));
    const cosechaEvents = cosechas.map((item): HistorialPlagaEvento => ({
      tipo: 'COSECHA',
      fecha: item.fecha,
      titulo: `${item.rendimientoKgHa} kg/ha`,
      detalle: `${item.toneladasTotal} tn${item.humedad ? ` · Humedad ${item.humedad}%` : ''}`,
      estado: item.calidadGrano,
    }));
    const cultivoEvents = cultivos.flatMap((item): HistorialPlagaEvento[] => {
      const events: HistorialPlagaEvento[] = [];
      if (item.fechaSiembra) {
        events.push({
          tipo: 'HISTORIAL',
          fecha: item.fechaSiembra,
          titulo: `Siembra ${item.cultivo}`,
          detalle: item.temporada,
          estado: item.observaciones,
        });
      }
      if (item.fechaCosecha) {
        events.push({
          tipo: 'HISTORIAL',
          fecha: item.fechaCosecha,
          titulo: `Cosecha ${item.cultivo}`,
          detalle: item.rendimientoKgHa ? `${item.rendimientoKgHa} kg/ha` : item.temporada,
          estado: item.observaciones,
        });
      }
      return events;
    });

    return [
      ...deteccionEvents,
      ...aplicacionEvents,
      ...seguimientoEvents,
      ...siembraEvents,
      ...cosechaEvents,
      ...cultivoEvents,
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  private nowLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  private toLoteFeature(lote: Lote): FeatureCollection<Polygon | MultiPolygon>['features'][number] | null {
    if (!lote.poligono) {
      return null;
    }

    try {
      const geometry = JSON.parse(lote.poligono) as Polygon | MultiPolygon;
      if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
        return null;
      }

      return {
        type: 'Feature',
        properties: {
          loteId: lote.id,
          nombre: lote.nombre,
          cultivo: lote.cultivo,
          color: this.loteHealthColor(lote.id),
          salud: this.loteHealthLabel(lote.id),
        },
        geometry,
      };
    } catch {
      return null;
    }
  }

  private computeMapCenter(data: FeatureCollection<Polygon | MultiPolygon>): [number, number] {
    const coordinates = data.features.flatMap((feature) => this.flattenCoordinates(feature.geometry));
    const valid = coordinates.filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
    if (!valid.length) {
      return [-58.3816, -34.6037];
    }

    const sum = valid.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
    return [sum[0] / valid.length, sum[1] / valid.length];
  }

  // Centroide (promedio de vertices) del poligono de un lote; null si no hay poligono valido.
  private loteCenterFromPolygon(poligono?: string | null): { lat: number; lng: number } | null {
    if (!poligono) {
      return null;
    }
    try {
      const geometry = JSON.parse(poligono) as Polygon | MultiPolygon;
      if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
        return null;
      }
      const coords = this.flattenCoordinates(geometry)
        .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
      if (!coords.length) {
        return null;
      }
      const sum = coords.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
      return { lng: sum[0] / coords.length, lat: sum[1] / coords.length };
    } catch {
      return null;
    }
  }

  private flattenCoordinates(geometry: Polygon | MultiPolygon): [number, number][] {
    if (geometry.type === 'Polygon') {
      return geometry.coordinates.flat().map(([lng, lat]) => [lng, lat]);
    }

    return geometry.coordinates.flat(2).map(([lng, lat]) => [lng, lat]);
  }

  private loteHealthColor(loteId: string): string {
    const severities = this.detecciones()
      .filter((deteccion) => deteccion.loteId === loteId && ['ABIERTA', 'EN_TRATAMIENTO'].includes(deteccion.estado))
      .map((deteccion) => deteccion.severidad);

    if (severities.includes('CRITICA')) return '#FF6B6B';
    if (severities.includes('ALTA')) return '#FF8A4C';
    if (severities.includes('MEDIA')) return '#FFB84D';
    if (severities.includes('BAJA')) return '#A3E635';
    return '#9FE870';
  }

  private loteHealthLabel(loteId: string): string {
    const color = this.loteHealthColor(loteId);
    if (color === '#FF6B6B') return 'Malo';
    if (color === '#FF8A4C') return 'Regular';
    if (color === '#FFB84D') return 'Bueno';
    if (color === '#A3E635') return 'Muy bueno';
    return 'Excelente';
  }
}
