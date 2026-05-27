import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { FeatureCollection, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import { forkJoin } from 'rxjs';
import { AgricolaService } from '../../core/services/agricola.service';
import type {
  AplicacionFitosanitaria,
  AplicacionFitosanitariaRequest,
  CatalogoPlaga,
  CatalogoPlagaRequest,
  DeteccionPlaga,
  DeteccionPlagaRequest,
  EstadoDeteccionPlaga,
  Lote,
  PlagasDashboard,
  ResultadoSeguimientoPlaga,
  SeguimientoPlaga,
  SeguimientoPlagaRequest,
  SeveridadPlaga,
  TipoPlaga,
} from '../../core/models/agricola.models';

type ActiveTab = 'DETECCIONES' | 'APLICACIONES' | 'SEGUIMIENTOS' | 'CATALOGO';
type ModalType = 'DETECCION' | 'APLICACION' | 'SEGUIMIENTO' | 'CATALOGO' | null;

@Component({
  selector: 'app-plagas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMapLibreGLModule],
  templateUrl: './plagas-page.component.html',
  styleUrl: './plagas-page.component.css',
})
export class PlagasPageComponent {
  private readonly agricolaService = inject(AgricolaService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly dashboard = signal<PlagasDashboard | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly catalogo = signal<CatalogoPlaga[]>([]);
  protected readonly detecciones = signal<DeteccionPlaga[]>([]);
  protected readonly aplicaciones = signal<AplicacionFitosanitaria[]>([]);
  protected readonly seguimientos = signal<SeguimientoPlaga[]>([]);
  protected readonly activeTab = signal<ActiveTab>('DETECCIONES');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 3;
  protected readonly modal = signal<ModalType>(null);
  protected readonly selectedDeteccion = signal<DeteccionPlaga | null>(null);
  protected readonly selectedPin = signal<DeteccionPlaga | null>(null);
  protected readonly selectedLoteId = signal('');
  protected readonly mapFilter = signal<'ACTIVAS' | 'TODAS' | EstadoDeteccionPlaga>('ACTIVAS');

  protected readonly severidades: SeveridadPlaga[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
  protected readonly estados: EstadoDeteccionPlaga[] = ['ABIERTA', 'EN_TRATAMIENTO', 'CONTROLADA', 'CERRADA'];
  protected readonly tipos: TipoPlaga[] = ['PLAGA', 'ENFERMEDAD', 'MALEZA'];
  protected readonly resultados: ResultadoSeguimientoPlaga[] = ['SIN_CAMBIOS', 'MEJORA', 'EMPEORA', 'CONTROLADA'];

  protected readonly filters = signal<{ loteId?: string; cultivo?: string; severidad?: SeveridadPlaga; estado?: EstadoDeteccionPlaga }>({});
  protected readonly deteccionForm = signal<DeteccionPlagaRequest>({ loteId: '', catalogoPlagaId: '', severidad: 'MEDIA', estado: 'ABIERTA', origenGeolocalizacion: 'WEB_MAPA', fechaDeteccion: this.nowLocalDateTime() });
  protected readonly aplicacionForm = signal<AplicacionFitosanitariaRequest>({ producto: '', dosis: 0, unidadDosis: 'l/ha', operarioResponsable: '', fechaAplicacion: this.nowLocalDateTime() });
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
    return [-58.3816, -34.6037];
  });
  protected readonly zoom = computed<[number]>(() => this.selectedLote() ? [13] : [5]);
  protected readonly selectedLote = computed(() => this.lotes().find((lote) => lote.id === this.selectedLoteId()) ?? this.lotes()[0]);
  protected readonly mapData = computed<FeatureCollection<Polygon>>(() => {
    const lote = this.selectedLote();
    if (!lote?.poligono) {
      return { type: 'FeatureCollection', features: [] };
    }
    try {
      return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: JSON.parse(lote.poligono) }] };
    } catch {
      return { type: 'FeatureCollection', features: [] };
    }
  });
  protected readonly pins = computed(() => {
    const loteId = this.selectedLote()?.id;
    const filter = this.mapFilter();
    return this.detecciones().filter((item) => {
      const hasCoords = item.latitud !== undefined && item.longitud !== undefined;
      const sameLote = !loteId || item.loteId === loteId;
      const statusMatch = filter === 'TODAS' || (filter === 'ACTIVAS' ? ['ABIERTA', 'EN_TRATAMIENTO'].includes(item.estado) : item.estado === filter);
      return hasCoords && sameLote && statusMatch;
    });
  });

  protected readonly totalItems = computed(() => this.currentItems().length);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));
  protected readonly currentItems = computed<Array<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>(() => {
    switch (this.activeTab()) {
      case 'APLICACIONES': return this.aplicaciones();
      case 'SEGUIMIENTOS': return this.seguimientos();
      case 'CATALOGO': return this.catalogo();
      default: return this.detecciones();
    }
  });
  protected readonly pageItems = computed<Array<DeteccionPlaga | AplicacionFitosanitaria | SeguimientoPlaga | CatalogoPlaga>>(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.currentItems().slice(start, start + this.pageSize);
  });

  constructor() {
    this.loadAll();
  }

  protected loadAll() {
    this.loading.set(true);
    this.errorMessage.set('');
    forkJoin({
      dashboard: this.agricolaService.getPlagasDashboard(),
      lotes: this.agricolaService.getLotes(),
      catalogo: this.agricolaService.getCatalogoPlagas(),
      detecciones: this.agricolaService.getDeteccionesPlaga(this.filters()),
      aplicaciones: this.agricolaService.getAplicacionesFitosanitarias(),
      seguimientos: this.agricolaService.getSeguimientosPlaga(),
    }).subscribe({
      next: (data) => {
        this.dashboard.set(data.dashboard);
        this.lotes.set(data.lotes);
        this.catalogo.set(data.catalogo);
        this.detecciones.set(data.detecciones);
        this.aplicaciones.set(data.aplicaciones);
        this.seguimientos.set(data.seguimientos);
        if (!this.selectedLoteId() && data.lotes[0]) {
          this.selectedLoteId.set(data.lotes[0].id);
        }
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
    this.agricolaService.getDeteccionesPlaga(this.filters()).subscribe({
      next: (items) => this.detecciones.set(items),
      error: () => this.errorMessage.set('No se pudieron aplicar los filtros.'),
    });
  }

  protected setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  protected setPage(page: number) {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  protected openModal(type: ModalType, deteccion?: DeteccionPlaga) {
    this.selectedDeteccion.set(deteccion ?? null);
    if (type === 'DETECCION') {
      const lote = this.selectedLote();
      this.deteccionForm.set({ loteId: lote?.id ?? '', catalogoPlagaId: this.catalogo()[0]?.id ?? '', cultivo: lote?.cultivo, severidad: 'MEDIA', estado: 'ABIERTA', origenGeolocalizacion: 'WEB_MAPA', fechaDeteccion: this.nowLocalDateTime() });
    }
    if (type === 'APLICACION') {
      this.aplicacionForm.set({ producto: '', dosis: 0, unidadDosis: 'l/ha', operarioResponsable: '', fechaAplicacion: this.nowLocalDateTime() });
    }
    if (type === 'SEGUIMIENTO') {
      this.seguimientoForm.set({ resultado: 'SIN_CAMBIOS', severidad: deteccion?.severidad ?? 'MEDIA', fecha: this.nowLocalDateTime() });
    }
    this.modal.set(type);
  }

  protected closeModal() {
    this.modal.set(null);
    this.selectedDeteccion.set(null);
  }

  protected onMapClick(event: any) {
    const lat = Number(event.lngLat.lat.toFixed(7));
    const lng = Number(event.lngLat.lng.toFixed(7));
    const lote = this.selectedLote();
    this.deteccionForm.update((form) => ({ ...form, loteId: lote?.id ?? form.loteId, latitud: lat, longitud: lng, origenGeolocalizacion: 'WEB_MAPA' }));
    this.openModal('DETECCION');
    this.deteccionForm.update((form) => ({ ...form, loteId: lote?.id ?? form.loteId, latitud: lat, longitud: lng, origenGeolocalizacion: 'WEB_MAPA' }));
  }

  protected submitDeteccion() {
    this.saving.set(true);
    this.agricolaService.createDeteccionPlaga(this.deteccionForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo guardar la deteccion.') });
  }

  protected submitAplicacion() {
    const deteccion = this.selectedDeteccion();
    if (!deteccion) return;
    this.saving.set(true);
    this.agricolaService.createAplicacionFitosanitaria(deteccion.id, this.aplicacionForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo registrar la aplicacion.') });
  }

  protected submitSeguimiento() {
    const deteccion = this.selectedDeteccion();
    if (!deteccion) return;
    this.saving.set(true);
    this.agricolaService.createSeguimientoPlaga(deteccion.id, this.seguimientoForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo registrar el seguimiento.') });
  }

  protected submitCatalogo() {
    this.saving.set(true);
    this.agricolaService.createCatalogoPlaga(this.catalogoForm()).subscribe({ next: () => this.afterSave(), error: () => this.failSave('No se pudo guardar el catalogo.') });
  }

  protected severityClass(value?: SeveridadPlaga) {
    return `severity-${(value ?? 'MEDIA').toLowerCase()}`;
  }

  protected pinColor(value?: SeveridadPlaga) {
    return value === 'CRITICA' ? '#ff6b6b' : value === 'ALTA' ? '#ff8a4c' : value === 'MEDIA' ? '#ffb84d' : '#9fe870';
  }

  private afterSave() {
    this.saving.set(false);
    this.closeModal();
    this.loadAll();
  }

  private failSave(message: string) {
    this.saving.set(false);
    this.errorMessage.set(message);
  }

  private nowLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}
