import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import { forkJoin, type Observable } from 'rxjs';
import { AgricolaService } from '../../core/services/agricola.service';
import { API_ORIGIN } from '../../core/services/api.config';
import { OperariosService } from '../../core/services/operarios.service';
import { SessionService } from '../../core/services/session.service';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import { ConfigurableSelectComponent } from '../../shared/configurable-select/configurable-select.component';
import { SearchableMultiSelectComponent } from '../../shared/searchable-multi-select/searchable-multi-select.component';
import type { Operario } from '../../core/models/operarios.models';
import type {
  AplicacionFitosanitaria,
  AplicacionFitosanitariaRequest,
  CatalogoPlaga,
  CatalogoPlagaImagen,
  CatalogoPlagaRequest,
  PlagaSugerida,
  EspecieSimilar,
  PlagaReferencia,
  SyncResumenReferencia,
  DeteccionPlaga,
  DeteccionPlagaRequest,
  EstadoDeteccionPlaga,
  EventoSiembra,
  EventoSiembraRequest,
  TipoEvento,
  HistoricoCultivo,
  Lote,
  PageResponse,
  PlagasDashboard,
  RegistroCosecha,
  ResultadoSeguimientoPlaga,
  SeguimientoPlaga,
  SeguimientoPlagaRequest,
  SeveridadPlaga,
} from '../../core/models/agricola.models';

type ActiveTab = 'DETECCIONES' | 'APLICACIONES' | 'SEGUIMIENTOS' | 'CATALOGO' | 'REFERENCIA';
// Feature 73: grupo de plagas de referencia agrupadas por cultivo.
type ReferenciaGrupo = { cultivoNombre: string; items: PlagaReferencia[] };
type ModalType = 'DETECCION' | 'APLICACION' | 'SEGUIMIENTO' | 'EVENTO' | 'HISTORICO' | 'CATALOGO' | 'FICHA' | null;
type HistorialPlagaEvento = {
  tipo: string;
  fecha: string;
  titulo: string;
  detalle: string;
  responsable?: string;
  estado?: string;
  // Color de la serie (banda/punto de la card). Replica el mapeo del historico mobile.
  color: string;
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
  imports: [CommonModule, FormsModule, NgxMapLibreGLModule, RemoteSearchSelectComponent, ConfigurableSelectComponent, SearchableMultiSelectComponent],
  templateUrl: './plagas-page.component.html',
  styleUrl: './plagas-page.component.css',
})
export class PlagasPageComponent {
  private readonly agricolaService = inject(AgricolaService);
  private readonly operariosService = inject(OperariosService);
  private readonly sessionService = inject(SessionService);

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
    REFERENCIA: 0,
  });
  protected readonly modal = signal<ModalType>(null);
  protected readonly selectedDeteccion = signal<DeteccionPlaga | null>(null);
  protected readonly selectedPinGroup = signal<DeteccionPinGroup | null>(null);
  protected readonly selectedPinIndex = signal(0);
  protected readonly historialEventos = signal<HistorialPlagaEvento[]>([]);
  protected readonly historialLoading = signal(false);
  protected readonly historialLote = signal<Lote | null>(null);
  protected readonly historialScope = signal<'DETECCION' | 'LOTE'>('LOTE');
  // Card colapsable del historico: indice del evento expandido (null = todos colapsados).
  protected readonly historialExpandido = signal<number | null>(null);

  protected toggleHistorialEvento(index: number) {
    this.historialExpandido.set(this.historialExpandido() === index ? null : index);
  }

  protected readonly severidades: SeveridadPlaga[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
  protected readonly estados: EstadoDeteccionPlaga[] = ['ABIERTA', 'EN_TRATAMIENTO', 'CONTROLADA', 'CERRADA'];
  // Feature 57: estados que se consideran "resueltos" (salen del mapa por defecto).
  private readonly estadosResueltos: EstadoDeteccionPlaga[] = ['CONTROLADA', 'CERRADA'];
  // Feature 57: toggle "Mostrar resueltos" del mapa (pines + circulos de area).
  protected readonly mostrarResueltos = signal(false);
  protected readonly resultados: ResultadoSeguimientoPlaga[] = ['SIN_CAMBIOS', 'MEJORA', 'EMPEORA', 'CONTROLADA'];
  // Operarios activos para los combos (reemplaza el filtro extraParams estado:ACTIVO)
  protected readonly operariosActivos = computed(() => this.operarios().filter((operario) => operario.estado === 'ACTIVO'));
  // Feature 57: % afectado derivado (solo lectura) = areaAfectadaHa / area del lote * 100.
  // null cuando no hay lote, area de lote o area afectada valida.
  protected readonly porcentajeAfectadoCalc = computed<number | null>(() => {
    const form = this.deteccionForm();
    const lote = this.lotes().find((item) => item.id === form.loteId);
    const area = Number(form.areaAfectadaHa);
    if (!lote?.area || !Number.isFinite(area) || area <= 0) return null;
    return Math.round((area / lote.area) * 100 * 10) / 10;
  });

  protected readonly filters = signal<{ loteId?: string; cultivo?: string; severidad?: SeveridadPlaga; estado?: EstadoDeteccionPlaga }>({});
  protected readonly deteccionForm = signal<DeteccionPlagaRequest>({ loteId: '', catalogoPlagaId: '', severidad: 'MEDIA', estado: 'ABIERTA', origenGeolocalizacion: 'WEB_MAPA', fechaDeteccion: this.nowLocalDateTime() });
  // Feature 79: flujo foto-primero. Paso 1 (FOTO) selecciona la imagen opcional, paso 2 (FORM) el formulario.
  protected readonly deteccionPaso = signal<'FOTO' | 'FORM'>('FOTO');
  protected readonly deteccionFoto = signal<File | null>(null);
  protected readonly deteccionFotoPreview = signal<string>('');
  protected readonly deteccionFotoError = signal<string>('');
  protected readonly aplicacionForm = signal<AplicacionFitosanitariaRequest>({ producto: '', dosis: 0, unidadDosis: 'l/ha', operarioResponsableId: '', operarioResponsable: '', fechaAplicacion: this.nowLocalDateTime() });
  protected readonly seguimientoForm = signal<SeguimientoPlagaRequest>({ resultado: 'SIN_CAMBIOS', severidad: 'MEDIA', fecha: this.nowLocalDateTime() });
  protected readonly catalogoForm = signal<CatalogoPlagaRequest>({ nombreComun: '', tipo: 'PLAGA', activo: true });
  // Feature 82: form del nuevo modal EVENTO (evento de siembra) y selector de deteccion
  // para aplicacion/seguimiento cuando se abren desde el rail (sin deteccion pre-seleccionada).
  protected readonly tiposEvento: TipoEvento[] = ['SIEMBRA', 'MONITOREO_FENOLOGICO', 'ALERTA', 'TRATAMIENTO'];
  protected readonly eventoForm = signal<EventoSiembraRequest>({ loteId: '', tipoEvento: 'SIEMBRA', fecha: this.todayDate() });
  protected readonly deteccionSeleccionadaId = signal<string>('');
  // Detecciones disponibles para el selector de aplicacion/seguimiento (todas las cargadas en el mapa).
  protected readonly deteccionesParaSelector = computed<DeteccionPlaga[]>(() => this.mapDetecciones());

  // Feature 54: id del catálogo en edición (null = alta). Marca principal al subir imagen.
  protected readonly catalogoEditId = signal<string | null>(null);
  protected readonly fichaPlaga = signal<CatalogoPlaga | null>(null);
  protected readonly fichaImagenes = signal<CatalogoPlagaImagen[]>([]);
  protected readonly fichaImagenesLoading = signal(false);
  protected readonly fichaSugeridas = signal<PlagaSugerida[]>([]);
  protected readonly fichaSugeridasLoading = signal(false);
  // Feature 75: especies similares (GBIF) de la ficha (desde el cache local).
  protected readonly fichaSimilares = signal<EspecieSimilar[]>([]);
  protected readonly fichaSimilaresLoading = signal(false);
  // Feature 75: panel de búsqueda en vivo de similares en el form de catálogo.
  protected readonly similaresGbif = signal<EspecieSimilar[]>([]);
  protected readonly similaresGbifLoading = signal(false);
  protected readonly similaresGbifError = signal('');
  protected readonly similaresGbifBuscado = signal(false);
  // El botón "Buscar similares" se habilita solo con un nombre científico cargado.
  protected readonly puedeBuscarSimilares = computed(() => (this.catalogoForm().nombreCientifico ?? '').trim().length > 0);
  // Feature 77: "Ver más resultados" muestra las primeras N y revela el resto client-side.
  protected readonly similaresVisibleLimit = 6;
  protected readonly similaresGbifExpanded = signal(false);
  protected readonly fichaSimilaresExpanded = signal(false);
  protected readonly similaresGbifVisibles = computed(() =>
    this.similaresGbifExpanded() ? this.similaresGbif() : this.similaresGbif().slice(0, this.similaresVisibleLimit),
  );
  protected readonly fichaSimilaresVisibles = computed(() =>
    this.fichaSimilaresExpanded() ? this.fichaSimilares() : this.fichaSimilares().slice(0, this.similaresVisibleLimit),
  );
  // Enlace canónico a la ficha de la especie en GBIF.
  protected readonly gbifHomeUrl = 'https://www.gbif.org';
  protected readonly fichaImagenActivaId = signal<string | null>(null);
  protected readonly uploadingImagen = signal(false);
  protected readonly uploadPrincipal = signal(false);
  protected readonly uploadError = signal('');
  // Validación de imágenes en front (el backend también valida).
  private readonly maxImagenBytes = 5 * 1024 * 1024;
  private readonly allowedImagenTypes = ['image/jpeg', 'image/png', 'image/webp'];

  // Feature 73: estado del catálogo de referencia (imágenes GBIF) y de la sincronización on-demand.
  protected readonly referencia = signal<PlagaReferencia[]>([]);
  protected readonly referenciaLoading = signal(false);
  protected readonly referenciaLoaded = signal(false);
  protected readonly referenciaError = signal('');
  protected readonly syncing = signal(false);
  protected readonly syncResumen = signal<SyncResumenReferencia | null>(null);
  // Solo admins (o quien tenga create:lotes) pueden disparar la descarga desde GBIF.
  protected readonly canSync = computed(() => {
    const user = this.sessionService.getCurrentUser();
    if (!user) return false;
    const permisos = user.permissions ?? [];
    const roles = user.roles ?? [];
    return permisos.includes('create:lotes') || roles.some((rol) => rol.toUpperCase().includes('ADMIN'));
  });
  // Agrupa las plagas de referencia por cultivo para el listado premium.
  protected readonly referenciaGrupos = computed<ReferenciaGrupo[]>(() => {
    const grupos = new Map<string, ReferenciaGrupo>();
    this.referencia().forEach((item) => {
      const cultivoNombre = item.cultivoNombre || 'Sin cultivo';
      const grupo = grupos.get(cultivoNombre);
      if (grupo) {
        grupo.items.push(item);
        return;
      }
      grupos.set(cultivoNombre, { cultivoNombre, items: [item] });
    });
    return Array.from(grupos.values());
  });
  // Texto resumen legible tras una sincronización (ej. "16 descargadas, 16 omitidas, 1 falló").
  protected readonly syncResumenTexto = computed(() => {
    const resumen = this.syncResumen();
    if (!resumen) return '';
    const partes = [
      `${resumen.descargados} descargada(s)`,
      `${resumen.omitidos} omitida(s)`,
      `${resumen.fallidos} fallida(s)`,
    ];
    return `${resumen.cultivos} cultivo(s) · ${resumen.procesados} procesada(s): ${partes.join(', ')}`;
  });

  protected readonly catalogoModalTitle = computed(() => this.catalogoEditId() ? 'Editar catálogo' : 'Nuevo catálogo');
  // Imagen principal destacada de la ficha (activa manualmente o principal/primera).
  protected readonly fichaImagenPrincipal = computed<CatalogoPlagaImagen | null>(() => {
    const imagenes = this.fichaImagenes();
    if (!imagenes.length) return null;
    const activeId = this.fichaImagenActivaId();
    return imagenes.find((img) => img.id === activeId)
      ?? imagenes.find((img) => img.esPrincipal)
      ?? imagenes[0];
  });

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
      // Feature 72: cultivo es un id de catalogo, se compara por igualdad exacta (id contra id).
      const sameCultivo = !filters.cultivo || lote.cultivo === filters.cultivo;
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
    const mostrarResueltos = this.mostrarResueltos();
    const groups = new Map<string, DeteccionPinGroup>();

    const loteCenters = this.loteCenters();
    this.mapDetecciones().forEach((item) => {
      const sameLote = !filters.loteId || item.loteId === filters.loteId;
      // Feature 72: cultivo es un id de catalogo, se compara por igualdad exacta (id contra id).
      const sameCultivo = !filters.cultivo || item.cultivo === filters.cultivo;
      const sameSeveridad = !filters.severidad || item.severidad === filters.severidad;
      const sameEstado = !filters.estado || item.estado === filters.estado;
      if (!sameLote || !sameCultivo || !sameSeveridad || !sameEstado) return;
      // Feature 57: las detecciones resueltas salen del mapa salvo que el toggle este activo.
      if (this.isResuelta(item.estado) && !mostrarResueltos) return;

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
  // Feature 57: circulos de area afectada (proporcionales) por deteccion visible.
  // Radio en metros = sqrt(areaAfectadaHa * 10000 / PI); se dibujan debajo de los pines.
  protected readonly areaCirclesData = computed<FeatureCollection<Polygon>>(() => {
    const filters = this.filters();
    const mostrarResueltos = this.mostrarResueltos();
    const loteCenters = this.loteCenters();
    const features: Feature<Polygon>[] = [];

    this.mapDetecciones().forEach((item) => {
      const sameLote = !filters.loteId || item.loteId === filters.loteId;
      const sameCultivo = !filters.cultivo || item.cultivo === filters.cultivo;
      const sameSeveridad = !filters.severidad || item.severidad === filters.severidad;
      const sameEstado = !filters.estado || item.estado === filters.estado;
      if (!sameLote || !sameCultivo || !sameSeveridad || !sameEstado) return;
      if (this.isResuelta(item.estado) && !mostrarResueltos) return;

      const area = Number(item.areaAfectadaHa);
      if (!Number.isFinite(area) || area <= 0) return;

      // Misma resolucion de coordenada que los pines (propia o centroide del lote).
      let latitud = Number(item.latitud);
      let longitud = Number(item.longitud);
      if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
        const center = loteCenters.get(item.loteId);
        if (!center) return;
        latitud = center.lat;
        longitud = center.lng;
      }

      const radiusMeters = Math.sqrt((area * 10000) / Math.PI);
      features.push(this.buildCirclePolygon(latitud, longitud, radiusMeters, this.pinColor(item.severidad)));
    });

    return { type: 'FeatureCollection', features };
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
        this.pageTotals.update((totals) => ({
          ...totals,
          DETECCIONES: data.detecciones.totalElements,
          APLICACIONES: data.aplicaciones.totalElements,
          SEGUIMIENTOS: data.seguimientos.totalElements,
          CATALOGO: data.catalogo.totalElements,
        }));
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
    if (tab === 'REFERENCIA') {
      // Feature 73: la referencia no es paginada; carga su listado agrupado la primera vez.
      if (!this.referenciaLoaded()) {
        this.loadReferencia();
      }
      return;
    }
    this.loadTablePage(tab, 1);
  }

  // Feature 73: carga el catálogo de referencia (imágenes GBIF) agrupado por cultivo.
  protected loadReferencia() {
    this.referenciaLoading.set(true);
    this.referenciaError.set('');
    this.agricolaService.getCatalogoReferencia().subscribe({
      next: (items) => {
        this.referencia.set(items);
        this.referenciaLoaded.set(true);
        this.referenciaLoading.set(false);
        this.pageTotals.update((totals) => ({ ...totals, REFERENCIA: items.length }));
      },
      error: () => {
        this.referenciaLoading.set(false);
        this.referenciaError.set('No se pudo cargar el catálogo de referencia.');
      },
    });
  }

  // Feature 73: dispara la sincronización on-demand (descarga desde GBIF) y refresca el listado.
  protected syncReferencia() {
    if (this.syncing()) return;
    this.syncing.set(true);
    this.syncResumen.set(null);
    this.referenciaError.set('');
    this.agricolaService.syncCatalogoReferencia().subscribe({
      next: (resumen) => {
        this.syncResumen.set(resumen);
        this.syncing.set(false);
        // Tras sincronizar, releemos el listado para mostrar las imágenes nuevas.
        this.loadReferencia();
      },
      error: () => {
        this.syncing.set(false);
        this.referenciaError.set('No se pudo actualizar el catálogo de referencia.');
      },
    });
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

  protected readonly capturandoUbicacion = signal(false);

  // Alta de deteccion desde el boton: abre el form y precarga la ubicacion actual
  // por GPS del navegador (equivalente web al boton de GPS del mobile).
  protected nuevaDeteccion() {
    this.openModal('DETECCION');
    this.capturarUbicacionActual();
  }

  // Captura la posicion actual del navegador y la vuelca al form de deteccion.
  // Si el GPS se deniega o falla, se puede seguir cargando por click en el mapa.
  protected capturarUbicacionActual() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }
    this.capturandoUbicacion.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitud = Number(position.coords.latitude.toFixed(7));
        const longitud = Number(position.coords.longitude.toFixed(7));
        const precisionMetros = Number.isFinite(position.coords.accuracy)
          ? Math.round(position.coords.accuracy)
          : undefined;
        this.deteccionForm.update((form) => ({
          ...form,
          latitud,
          longitud,
          precisionMetros,
          origenGeolocalizacion: 'WEB_GPS',
        }));
        this.capturandoUbicacion.set(false);
      },
      () => this.capturandoUbicacion.set(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  protected openModal(type: ModalType, deteccion?: DeteccionPlaga) {
    this.selectedDeteccion.set(deteccion ?? null);
    // Feature 82: sin deteccion pre-seleccionada, el modal muestra su propio selector.
    this.deteccionSeleccionadaId.set('');
    if (type === 'EVENTO') {
      const lote = this.selectedLoteForForm();
      this.eventoForm.set({ loteId: lote?.id ?? '', tipoEvento: 'SIEMBRA', fecha: this.todayDate() });
    }
    if (type !== 'HISTORICO') {
      this.historialEventos.set([]);
      this.historialLote.set(null);
      this.historialLoading.set(false);
    }
    if (type === 'DETECCION') {
      const lote = this.selectedLoteForForm();
      this.deteccionForm.set({ loteId: lote?.id ?? '', catalogoPlagaId: this.catalogoOpciones()[0]?.id ?? '', cultivo: lote?.cultivo, severidad: 'MEDIA', estado: 'ABIERTA', origenGeolocalizacion: 'WEB_MAPA', fechaDeteccion: this.nowLocalDateTime(), responsableId: this.defaultResponsableId() });
      // Feature 79: siempre arranca en el paso de foto (opcional) al abrir el modal.
      this.resetDeteccionFoto();
      this.deteccionPaso.set('FOTO');
    }
    if (type === 'APLICACION') {
      this.aplicacionForm.set({ producto: '', dosis: 0, unidadDosis: 'l/ha', operarioResponsableId: '', operarioResponsable: '', fechaAplicacion: this.nowLocalDateTime() });
    }
    if (type === 'SEGUIMIENTO') {
      this.seguimientoForm.set({ resultado: 'SIN_CAMBIOS', severidad: deteccion?.severidad ?? 'MEDIA', fecha: this.nowLocalDateTime(), responsableId: this.defaultResponsableId() });
    }
    if (type === 'HISTORICO' && deteccion) {
      this.loadHistorialDeteccion(deteccion);
    }
    this.modal.set(type);
  }

  protected closeModal() {
    this.modal.set(null);
    this.selectedDeteccion.set(null);
    // Feature 82: limpieza del selector de deteccion y del form de evento.
    this.deteccionSeleccionadaId.set('');
    this.eventoForm.set({ loteId: '', tipoEvento: 'SIEMBRA', fecha: this.todayDate() });
    this.historialEventos.set([]);
    this.historialLote.set(null);
    this.historialScope.set('LOTE');
    this.historialLoading.set(false);
    // Feature 54: limpieza del estado de ficha y edición de catálogo.
    this.catalogoEditId.set(null);
    this.fichaPlaga.set(null);
    this.fichaImagenes.set([]);
    this.fichaSugeridas.set([]);
    this.fichaImagenActivaId.set(null);
    this.uploadError.set('');
    this.uploadPrincipal.set(false);
    this.uploadingImagen.set(false);
    // Feature 75: limpieza del estado de especies similares (ficha + panel del form).
    this.fichaSimilares.set([]);
    this.fichaSimilaresLoading.set(false);
    this.fichaSimilaresExpanded.set(false);
    this.resetSimilaresGbif();
    // Feature 79: limpieza del estado de foto de detección.
    this.resetDeteccionFoto();
    this.deteccionPaso.set('FOTO');
  }

  // Feature 79: resetea el estado de la foto de detección (libera el object URL del preview).
  private resetDeteccionFoto() {
    const preview = this.deteccionFotoPreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    this.deteccionFoto.set(null);
    this.deteccionFotoPreview.set('');
    this.deteccionFotoError.set('');
  }

  // Feature 79: valida y guarda la foto elegida en el paso 1 (JPG/PNG/WEBP hasta 5 MB).
  protected onDeteccionFotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.deteccionFotoError.set('');
    if (!this.allowedImagenTypes.includes(file.type)) {
      this.deteccionFotoError.set('Formato no permitido. Usá JPG, PNG o WEBP.');
      input.value = '';
      return;
    }
    if (file.size > this.maxImagenBytes) {
      this.deteccionFotoError.set('La imagen supera el máximo de 5 MB.');
      input.value = '';
      return;
    }
    const preview = this.deteccionFotoPreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    this.deteccionFoto.set(file);
    this.deteccionFotoPreview.set(URL.createObjectURL(file));
    input.value = '';
  }

  // Feature 79: quita la foto elegida sin cerrar el paso.
  protected quitarDeteccionFoto() {
    this.resetDeteccionFoto();
  }

  // Feature 79: navegación entre los 2 pasos del modal de detección.
  protected continuarDeteccionConFoto() {
    this.deteccionPaso.set('FORM');
  }

  protected continuarDeteccionSinFoto() {
    this.resetDeteccionFoto();
    this.deteccionPaso.set('FORM');
  }

  protected volverAFotoDeteccion() {
    this.deteccionPaso.set('FOTO');
  }

  // Feature 75: resetea el panel de búsqueda en vivo de similares.
  private resetSimilaresGbif() {
    this.similaresGbif.set([]);
    this.similaresGbifLoading.set(false);
    this.similaresGbifError.set('');
    this.similaresGbifBuscado.set(false);
    this.similaresGbifExpanded.set(false);
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
    // Feature 79: si hay foto elegida, se envía multipart; si no, el create JSON de siempre.
    const foto = this.deteccionFoto();
    const request$ = foto
      ? this.agricolaService.createDeteccionPlagaConFoto(this.deteccionForm(), foto)
      : this.agricolaService.createDeteccionPlaga(this.deteccionForm());
    request$.subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo guardar la detección.') });
  }

  protected submitAplicacion() {
    // Feature 82: la deteccion puede venir fija (pin/fila) o elegida en el selector del rail.
    const deteccionId = this.selectedDeteccion()?.id ?? this.deteccionSeleccionadaId();
    if (!deteccionId) return;
    this.saving.set(true);
    this.agricolaService.createAplicacionFitosanitaria(deteccionId, this.aplicacionForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo registrar la aplicación.') });
  }

  protected submitSeguimiento() {
    // Feature 82: la deteccion puede venir fija (pin/fila) o elegida en el selector del rail.
    const deteccionId = this.selectedDeteccion()?.id ?? this.deteccionSeleccionadaId();
    if (!deteccionId) return;
    this.saving.set(true);
    this.agricolaService.createSeguimientoPlaga(deteccionId, this.seguimientoForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo registrar el seguimiento.') });
  }

  // Feature 82: alta de evento de siembra desde el modal EVENTO (misma firma que siembra-page).
  protected submitEvento() {
    const form = this.eventoForm();
    if (!form.loteId) return;
    this.saving.set(true);
    this.agricolaService.createEvento(form).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo registrar el evento.') });
  }

  // Feature 82: acciones del rail de burbujas sobre el mapa (abren formularios inline).
  protected abrirEventoDesdeRail() {
    this.openModal('EVENTO');
  }

  protected abrirAplicacionDesdeRail() {
    this.openModal('APLICACION');
  }

  protected abrirSeguimientoDesdeRail() {
    this.openModal('SEGUIMIENTO');
  }

  protected submitCatalogo() {
    this.saving.set(true);
    const editId = this.catalogoEditId();
    const request$ = editId
      ? this.agricolaService.updateCatalogoPlaga(editId, this.catalogoForm())
      : this.agricolaService.createCatalogoPlaga(this.catalogoForm());
    request$.subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo guardar el catálogo.') });
  }

  // Feature 54: alta de catálogo (form vacío).
  protected openNuevoCatalogo() {
    this.catalogoEditId.set(null);
    this.catalogoForm.set({ nombreComun: '', tipo: 'PLAGA', activo: true });
    this.resetSimilaresGbif();
    this.selectedDeteccion.set(null);
    this.modal.set('CATALOGO');
  }

  // Feature 54: edición de catálogo (precarga el form y usa PUT).
  protected openEditarCatalogo(plaga: CatalogoPlaga) {
    this.catalogoEditId.set(plaga.id);
    this.catalogoForm.set({
      nombreComun: plaga.nombreComun,
      nombreCientifico: plaga.nombreCientifico,
      tipo: plaga.tipo,
      cultivosAfectados: plaga.cultivosAfectados,
      descripcion: plaga.descripcion,
      sintomas: plaga.sintomas,
      umbralAccion: plaga.umbralAccion,
      zonaTipica: plaga.zonaTipica ?? undefined,
      activo: plaga.activo,
    });
    this.resetSimilaresGbif();
    this.selectedDeteccion.set(null);
    this.modal.set('CATALOGO');
  }

  // Feature 54: abre la ficha de detalle premium y carga imágenes + sugeridas.
  protected openFicha(plaga: CatalogoPlaga) {
    this.fichaPlaga.set(plaga);
    this.fichaImagenActivaId.set(null);
    this.uploadError.set('');
    this.uploadPrincipal.set(false);
    this.selectedDeteccion.set(null);
    this.modal.set('FICHA');
    this.loadFichaImagenes(plaga.id);
    this.loadFichaSugeridas(plaga.id);
    this.loadFichaSimilares(plaga.id);
  }

  // Feature 75: carga las especies similares (GBIF) desde el cache local para la ficha.
  private loadFichaSimilares(id: string) {
    this.fichaSimilares.set([]);
    this.fichaSimilaresExpanded.set(false);
    this.fichaSimilaresLoading.set(true);
    this.agricolaService.getCatalogoPlagaSimilares(id).subscribe({
      next: (similares) => {
        this.fichaSimilares.set(similares);
        this.fichaSimilaresLoading.set(false);
      },
      error: () => {
        this.fichaSimilares.set([]);
        this.fichaSimilaresLoading.set(false);
      },
    });
  }

  // Feature 75: búsqueda en vivo de especies similares desde GBIF por el nombre científico del form.
  protected buscarSimilares() {
    const nombreCientifico = (this.catalogoForm().nombreCientifico ?? '').trim();
    if (!nombreCientifico || this.similaresGbifLoading()) return;
    this.similaresGbifLoading.set(true);
    this.similaresGbifError.set('');
    this.similaresGbifBuscado.set(true);
    this.agricolaService.buscarSimilaresGbif(nombreCientifico).subscribe({
      next: (similares) => {
        this.similaresGbif.set(similares);
        this.similaresGbifLoading.set(false);
      },
      error: () => {
        this.similaresGbif.set([]);
        this.similaresGbifLoading.set(false);
        this.similaresGbifError.set('No se pudieron buscar especies similares.');
      },
    });
  }

  // Feature 75: usa el nombre científico de una candidata en el form de catálogo.
  protected usarSimilar(similar: EspecieSimilar) {
    this.catalogoForm.update((form) => ({ ...form, nombreCientifico: similar.nombreCientifico }));
  }

  // Feature 75: etiqueta legible del nivel de proximidad taxonómica.
  protected nivelSimilarLabel(nivel: string): string {
    return nivel === 'GENERO' ? 'Género' : nivel === 'FAMILIA' ? 'Familia' : nivel;
  }

  // Feature 77: badge de confianza derivado del nivel taxonómico (no hay score real).
  // GENERO -> "Coincidencia alta"; FAMILIA -> "Posible".
  protected confianzaSimilarLabel(nivel: string): string {
    return nivel === 'GENERO' ? 'Coincidencia alta' : 'Posible';
  }

  // Feature 77: enlace a la ficha de la especie en GBIF.
  protected gbifSpeciesUrl(usageKey: number): string {
    return `https://www.gbif.org/species/${usageKey}`;
  }

  // Feature 77: licencia + atribución para el tooltip del enlace "Ver fuente".
  protected similarFuenteTitle(similar: EspecieSimilar): string {
    const partes = [similar.atribucion, similar.licencia].filter((parte) => !!parte);
    const detalle = partes.length ? partes.join(' · ') : 'Fuente: GBIF';
    return `${detalle} — Ver en GBIF`;
  }

  private loadFichaImagenes(id: string) {
    this.fichaImagenesLoading.set(true);
    this.agricolaService.getCatalogoPlagaImagenes(id).subscribe({
      next: (imagenes) => {
        this.fichaImagenes.set(imagenes);
        this.fichaImagenesLoading.set(false);
      },
      error: () => {
        this.fichaImagenes.set([]);
        this.fichaImagenesLoading.set(false);
      },
    });
  }

  private loadFichaSugeridas(id: string) {
    this.fichaSugeridasLoading.set(true);
    this.agricolaService.getCatalogoPlagaSugeridas(id).subscribe({
      next: (sugeridas) => {
        this.fichaSugeridas.set(sugeridas);
        this.fichaSugeridasLoading.set(false);
      },
      error: () => {
        this.fichaSugeridas.set([]);
        this.fichaSugeridasLoading.set(false);
      },
    });
  }

  // Abre la ficha de una plaga sugerida (busca el catálogo completo por id).
  protected openFichaSugerida(sugerida: PlagaSugerida) {
    const plaga = this.catalogoOpciones().find((item) => item.id === sugerida.id)
      ?? this.catalogo().find((item) => item.id === sugerida.id);
    if (plaga) {
      this.openFicha(plaga);
      return;
    }
    // Fallback: reconstruye una ficha mínima con los datos de la sugerida.
    this.openFicha({
      id: sugerida.id,
      nombreComun: sugerida.nombreComun,
      nombreCientifico: sugerida.nombreCientifico,
      tipo: sugerida.tipo,
      tipoNombre: sugerida.tipoNombre,
      activo: true,
      createdAt: '',
      updatedAt: '',
    });
  }

  protected setFichaImagenActiva(imagen: CatalogoPlagaImagen) {
    this.fichaImagenActivaId.set(imagen.id);
  }

  // Prepend del origin del backend a la url relativa /uploads/...
  // Feature 73: parte un CSV de nombres de cultivos en chips (tolera espacios/vacíos).
  protected splitCsv(csv?: string | null): string[] {
    if (!csv) return [];
    return csv
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.length > 0);
  }

  protected imagenUrl(url?: string | null): string {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`;
  }

  protected onImagenSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadError.set('');

    if (!this.allowedImagenTypes.includes(file.type)) {
      this.uploadError.set('Formato no permitido. Usá JPG, PNG o WEBP.');
      input.value = '';
      return;
    }
    if (file.size > this.maxImagenBytes) {
      this.uploadError.set('La imagen supera el máximo de 5 MB.');
      input.value = '';
      return;
    }

    const plaga = this.fichaPlaga();
    if (!plaga) return;
    this.uploadingImagen.set(true);
    this.agricolaService.uploadCatalogoPlagaImagen(plaga.id, file, this.uploadPrincipal()).subscribe({
      next: () => {
        this.uploadingImagen.set(false);
        this.uploadPrincipal.set(false);
        input.value = '';
        this.loadFichaImagenes(plaga.id);
      },
      error: () => {
        this.uploadingImagen.set(false);
        this.uploadError.set('No se pudo subir la imagen.');
        input.value = '';
      },
    });
  }

  protected deleteImagen(imagen: CatalogoPlagaImagen) {
    const plaga = this.fichaPlaga();
    if (!plaga) return;
    this.agricolaService.deleteCatalogoPlagaImagen(plaga.id, imagen.id).subscribe({
      next: () => {
        if (this.fichaImagenActivaId() === imagen.id) {
          this.fichaImagenActivaId.set(null);
        }
        this.loadFichaImagenes(plaga.id);
      },
      error: () => this.uploadError.set('No se pudo borrar la imagen.'),
    });
  }

  protected plagaTipoIconKey(tipoNombre?: string): 'PLAGA' | 'MALEZA' | 'ENFERMEDAD' | 'OTRO' {
    const value = (tipoNombre ?? '').toUpperCase();
    if (value === 'PLAGA') return 'PLAGA';
    if (value === 'MALEZA') return 'MALEZA';
    if (value === 'ENFERMEDAD') return 'ENFERMEDAD';
    return 'OTRO';
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

  // Feature 57: una deteccion esta "resuelta" cuando esta CONTROLADA o CERRADA.
  protected isResuelta(estado?: EstadoDeteccionPlaga): boolean {
    return !!estado && this.estadosResueltos.includes(estado);
  }

  // Feature 57: alterna la visibilidad de detecciones resueltas en el mapa.
  protected toggleMostrarResueltos() {
    this.mostrarResueltos.update((value) => !value);
  }

  // Feature 57: id del operario asociado al usuario logueado (userId === AuthUser.id).
  // undefined cuando no hay usuario o no existe un operario vinculado.
  private defaultResponsableId(): string | undefined {
    const userId = this.sessionService.getCurrentUser()?.id;
    if (!userId) return undefined;
    return this.operarios().find((operario) => operario.userId === userId)?.id;
  }

  // Feature 57: recalcula y persiste el % afectado en el form de deteccion.
  private recalcPorcentajeAfectado() {
    this.deteccionForm.update((form) => {
      const lote = this.lotes().find((item) => item.id === form.loteId);
      const area = Number(form.areaAfectadaHa);
      const porcentaje = lote?.area && Number.isFinite(area) && area > 0
        ? Math.round((area / lote.area) * 100 * 10) / 10
        : 0;
      return { ...form, porcentajeAfectado: porcentaje };
    });
  }

  // Feature 57: handlers del form de deteccion que disparan el recalculo del % afectado.
  protected onDeteccionAreaChange(value: number | undefined) {
    this.deteccionForm.update((form) => ({ ...form, areaAfectadaHa: value }));
    this.recalcPorcentajeAfectado();
  }

  protected onDeteccionLoteChange(loteId: string) {
    this.deteccionForm.update((form) => ({ ...form, loteId }));
    this.recalcPorcentajeAfectado();
  }

  // Feature 57: construye un poligono-circulo (~48 vertices) de radio en metros
  // centrado en (lat, lng), convirtiendo metros a grados para lat/lng.
  private buildCirclePolygon(lat: number, lng: number, radiusMeters: number, color: string): Feature<Polygon> {
    const points = 48;
    const latRad = (lat * Math.PI) / 180;
    const dLat = radiusMeters / 111320;
    const dLng = radiusMeters / (111320 * Math.cos(latRad));
    const ring: [number, number][] = [];
    for (let i = 0; i <= points; i += 1) {
      const angle = (i / points) * 2 * Math.PI;
      ring.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
    }
    return {
      type: 'Feature',
      properties: { color },
      geometry: { type: 'Polygon', coordinates: [ring] },
    };
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
    // Feature 57: al fijar el lote desde el mapa, recalcula el % afectado.
    this.recalcPorcentajeAfectado();
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
    this.historialExpandido.set(null);

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
    this.historialExpandido.set(null);

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
      tipo: 'Detección',
      fecha: deteccion.fechaDeteccion,
      titulo: deteccion.plagaNombre,
      detalle: `${deteccion.severidad}${deteccion.areaAfectadaHa ? ` · ${deteccion.areaAfectadaHa} ha` : ''}`,
      responsable: deteccion.responsable,
      estado: deteccion.estado,
      color: this.pinColor(deteccion.severidad),
    };
    const aplicacionEvents = aplicaciones
      .filter((item) => item.deteccionId === deteccion.id)
      .map((item): HistorialPlagaEvento => ({
        tipo: 'Aplicación',
        fecha: item.fechaAplicacion,
        titulo: item.producto,
        detalle: `${item.dosis} ${item.unidadDosis}${item.superficieTratadaHa ? ` · ${item.superficieTratadaHa} ha` : ''}`,
        responsable: item.operarioResponsable,
        estado: item.principioActivo || 'Aplicada',
        color: '#6EA8FF',
      }));
    const seguimientoEvents = seguimientos
      .filter((item) => item.deteccionId === deteccion.id)
      .map((item): HistorialPlagaEvento => ({
        tipo: 'Seguimiento',
        fecha: item.fecha,
        titulo: item.plagaNombre,
        detalle: item.observaciones || item.resultado,
        responsable: item.responsable,
        estado: item.severidad,
        color: '#39D0D8',
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
    const lote = this.lotes().find((item) => item.id === loteId) ?? null;
    const deteccionEvents = detecciones.map((item): HistorialPlagaEvento => ({
      tipo: 'Detección',
      fecha: item.fechaDeteccion,
      titulo: item.plagaNombre,
      detalle: `${item.severidad}${item.areaAfectadaHa ? ` · ${item.areaAfectadaHa} ha` : ''}`,
      responsable: item.responsable,
      estado: item.estado,
      color: this.pinColor(item.severidad),
    }));
    const aplicacionEvents = aplicaciones
      .filter((item) => item.loteId === loteId)
      .map((item): HistorialPlagaEvento => ({
        tipo: 'Aplicación',
        fecha: item.fechaAplicacion,
        titulo: item.producto,
        detalle: `${item.dosis} ${item.unidadDosis}${item.superficieTratadaHa ? ` · ${item.superficieTratadaHa} ha` : ''}`,
        responsable: item.operarioResponsable,
        estado: item.principioActivo || 'Aplicada',
        color: '#6EA8FF',
      }));
    const seguimientoEvents = seguimientos
      .filter((item) => detectionIds.has(item.deteccionId))
      .map((item): HistorialPlagaEvento => ({
        tipo: 'Seguimiento',
        fecha: item.fecha,
        titulo: item.plagaNombre,
        detalle: item.observaciones || item.resultado,
        responsable: item.responsable,
        estado: item.severidad,
        color: '#39D0D8',
      }));
    const siembraEvents = siembra.map((item): HistorialPlagaEvento => ({
      tipo: item.tipoEvento === 'SIEMBRA' ? 'Siembra' : 'Evento',
      fecha: item.fecha,
      titulo: item.estadoFenologico || item.tipoEvento,
      detalle: item.descripcion || lote?.cultivoNombre || lote?.cultivo || item.loteNombre,
      estado: item.tipoEvento,
      color: '#9FE870',
    }));
    const cosechaEvents = cosechas.map((item): HistorialPlagaEvento => ({
      tipo: 'Cosecha',
      fecha: item.fecha,
      titulo: `${Number(item.rendimientoKgHa ?? 0).toLocaleString('es-AR')} kg/ha`,
      detalle: `${Number(item.toneladasTotal ?? 0).toLocaleString('es-AR')} tn${item.humedad ? ` · Humedad ${item.humedad}%` : ''}`,
      estado: item.calidadGrano,
      color: '#FFB84D',
    }));
    const cultivoEvents = cultivos.flatMap((item): HistorialPlagaEvento[] => {
      const events: HistorialPlagaEvento[] = [];
      if (item.fechaSiembra) {
        events.push({
          tipo: 'Historial',
          fecha: item.fechaSiembra,
          titulo: `Siembra ${item.cultivo}`,
          detalle: item.temporada,
          estado: item.observaciones,
          color: '#9FE870',
        });
      }
      if (item.fechaCosecha) {
        events.push({
          tipo: 'Historial',
          fecha: item.fechaCosecha,
          titulo: `Cosecha ${item.cultivo}`,
          detalle: item.rendimientoKgHa ? `${item.rendimientoKgHa} kg/ha` : item.temporada,
          estado: item.observaciones,
          color: '#FFB84D',
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

  // Feature 82: fecha local (yyyy-MM-dd) para el input date del evento de siembra.
  private todayDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
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
