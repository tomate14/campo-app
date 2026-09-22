import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import type {
  DeteccionPlaga,
  Lote,
  LoteReporte,
  LoteRequest,
  NdviManifestItem,
} from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { LoteFormComponent } from '../../shared/lote-form/lote-form.component';
import { LoteHistorialComponent } from '../../shared/lote-historial/lote-historial.component';
import {
  buildPolygon,
  computeAreaHectares,
  computeCentroid,
  parsePolygon,
  sanitizePoints,
  type Point,
} from '../../shared/lote-geometry';

const DEFAULT_CENTER: [number, number] = [-60.6735049, -36.1966878];

// Color de lote sano (sin detecciones abiertas), identico a mobile.
const HEALTHY_COLOR = '#9FE870';

// Estados de deteccion que se consideran "abiertas" para colorear por salud (igual que mobile).
const OPEN_DETECTION_STATES = ['ABIERTA', 'EN_TRATAMIENTO'];

// Leyenda fija por salud del lote (feature 81): mismo criterio que mobile.
const HEALTH_LEGEND: Array<{ label: string; color: string }> = [
  { label: 'Sano', color: HEALTHY_COLOR },
  { label: 'Baja', color: '#A3E635' },
  { label: 'Media', color: '#FFB84D' },
  { label: 'Alta', color: '#FF8A4C' },
  { label: 'Crítica', color: '#FF6B6B' },
];

type WebMapMode = 'satelite' | 'mapa' | 'hibrido' | 'terreno' | 'ndvi';
type NdviMapOverlay = NdviManifestItem & {
  url: string;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
};

@Component({
  selector: 'app-lotes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMapLibreGLModule, LoteFormComponent, LoteHistorialComponent],
  templateUrl: './lotes-page.component.html',
  styleUrl: './lotes-page.component.css',
})
export class LotesPageComponent implements OnDestroy {
  private readonly agricolaService = inject(AgricolaService);
  private readonly router = inject(Router);

  protected readonly lotes = signal<Lote[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Estado de dibujo (igual patron que potreros).
  protected readonly drawingPoints = signal<Point[]>([]);

  // Estado de alta/edicion.
  protected readonly showForm = signal(false);
  protected readonly editingLote = signal<Lote | null>(null);
  protected readonly formLote = signal<Lote | null>(null);

  // Seleccion y UI de panel.
  protected readonly selectedLote = signal<Lote | null>(null);
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly mapTooltip = signal<{ x: number; y: number; lote: Lote } | null>(null);

  // Import GeoJSON.
  protected readonly importModalOpen = signal(false);
  protected readonly importPayload = signal('');

  // Historico (modal de detalle, feature 81). El timeline de eventos lo renderiza
  // el componente compartido app-lote-historial; aca solo queda el resumen (reporte).
  protected readonly detailLote = signal<Lote | null>(null);
  protected readonly reporte = signal<LoteReporte | null>(null);
  // Todas las detecciones del establecimiento (feature 81): alimentan el color por salud del mapa.
  protected readonly detecciones = signal<DeteccionPlaga[]>([]);
  protected readonly loadingReporte = signal(false);
  protected readonly ndviOverlays = signal<NdviMapOverlay[]>([]);

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

  protected readonly streetStyle = 'https://tiles.openfreemap.org/styles/bright';
  protected readonly terrainStyle: StyleSpecification = {
    version: 8,
    sources: {
      terrain: {
        type: 'raster',
        tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: 'OpenTopoMap',
      },
    },
    layers: [{ id: 'terrain', type: 'raster', source: 'terrain' }],
  };
  protected readonly mapMode = signal<WebMapMode>('satelite');
  protected readonly mapStyle = computed(() => {
    if (this.mapMode() === 'mapa') return this.streetStyle;
    if (this.mapMode() === 'terreno') return this.terrainStyle;
    return this.satelliteStyle;
  });
  protected readonly mapZoom = computed<[number]>(() => {
    if (this.selectedLote() || this.drawingPoints().length) {
      return [14];
    }
    return [this.lotes().length ? 12 : 5];
  });
  protected readonly mapCenter = computed<[number, number]>(() => this.computeMapCenter());
  protected readonly draftAreaHa = computed(() => computeAreaHectares(this.drawingPoints()) ?? 0);

  // Leyenda por salud fija (feature 81): mismo criterio de color que mobile.
  protected readonly legendItems = HEALTH_LEGEND;

  protected readonly lotesData = computed<FeatureCollection<Polygon>>(() => ({
    type: 'FeatureCollection',
    features: this.lotes()
      .map((lote) => this.toFeature(lote))
      .filter((feature): feature is Feature<Polygon> => feature !== null),
  }));

  protected readonly draftData = computed<FeatureCollection<Polygon>>(() => {
    const points = this.drawingPoints();
    if (points.length < 3) {
      return { type: 'FeatureCollection', features: [] };
    }
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[...points.map((point) => [point.lng, point.lat]), [points[0].lng, points[0].lat]]],
          },
        },
      ],
    };
  });

  // Etiqueta discreta por lote (feature 81): nombre + ha en el centroide, como mobile/potreros.
  // Es solo texto (pointer-events: none), el lote se representa por su poligono.
  protected readonly loteLabels = computed<Array<{ lote: Lote; lngLat: [number, number] }>>(() => {
    return this.lotes()
      .map((lote) => {
        const lngLat = this.resolveLoteLngLat(lote);
        if (!lngLat) {
          return null;
        }
        return { lote, lngLat };
      })
      .filter((label): label is { lote: Lote; lngLat: [number, number] } => label !== null);
  });

  protected readonly kpis = computed(() => {
    const lotes = this.lotes();
    const hectares = lotes.reduce((total, item) => total + Number(item.area || 0), 0);
    const cultivos = new Set(lotes.map((item) => this.cultivoKey(item)).filter((value) => value !== 'Sin cultivo'));
    return [
      { label: 'Lotes registrados', value: lotes.length.toString(), helper: 'Parcelas cargadas', icon: 'grid' },
      { label: 'Superficie total', value: `${hectares.toFixed(2)} ha`, helper: 'Area operativa', icon: 'area' },
      { label: 'Cultivos distintos', value: cultivos.size.toString(), helper: 'Diversidad de siembra', icon: 'crop' },
    ];
  });

  constructor() {
    this.load();
  }

  ngOnDestroy(): void {
    this.clearNdviUrls();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.detailLote()) {
      this.closeDetail();
      return;
    }
    if (this.importModalOpen()) {
      this.closeImportModal();
      return;
    }
    if (this.showForm()) {
      this.closeForm();
      return;
    }
    if (this.openMenuId()) {
      this.closeMenu();
      return;
    }
    if (this.drawingPoints().length) {
      this.cancelDrawing();
    }
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.agricolaService.getLotes(undefined).subscribe({
      next: (lotes) => {
        this.lotes.set(Array.isArray(lotes) ? lotes : []);
        this.loading.set(false);
        this.loadNdviOverlays();
      },
      error: () => {
        this.lotes.set([]);
        this.loading.set(false);
        this.error.set('No se pudieron cargar los lotes.');
      },
    });

    // Feature 81: cargar todas las detecciones para colorear los lotes por salud (igual que mobile).
    this.agricolaService.getDeteccionesPlaga().subscribe({
      next: (detecciones) => this.detecciones.set(Array.isArray(detecciones) ? detecciones : []),
      error: () => this.detecciones.set([]),
    });
  }

  // ---- Dibujo (feature 81, patron de potreros) ----

  protected startDrawing(): void {
    this.editingLote.set(null);
    this.formLote.set(null);
    this.selectedLote.set(null);
    this.drawingPoints.set([]);
    this.showForm.set(false);
    this.closeMenu();
  }

  protected cancelDrawing(): void {
    this.drawingPoints.set([]);
    this.editingLote.set(null);
    this.formLote.set(null);
    this.showForm.set(false);
  }

  protected undoPoint(): void {
    this.drawingPoints.set(this.drawingPoints().slice(0, -1));
  }

  protected onMapClick(event: any): void {
    // No agregar vertices con cualquier modal abierto.
    if (this.showForm() || this.importModalOpen() || this.detailLote()) {
      return;
    }
    // Sin dibujo en curso, el click sobre un lote abre su historico (lo maneja layerClick).
    if (!this.drawingPoints().length && this.clickHitsLote(event)) {
      return;
    }
    const lng = Number(event.lngLat.lng.toFixed(7));
    const lat = Number(event.lngLat.lat.toFixed(7));
    this.drawingPoints.set(sanitizePoints([...this.drawingPoints(), { lat, lng }]));
  }

  protected onMapDoubleClick(event: any): void {
    event.preventDefault?.();
    const points = this.drawingPoints();
    if (points.length < 3) {
      return;
    }
    this.openFormFromPoints(points);
  }

  protected openFormFromPoints(points: Point[]): void {
    const polygon = buildPolygon(points);
    if (!polygon) {
      return;
    }
    const centroid = computeCentroid(points);
    const areaHa = computeAreaHectares(points) ?? 0;
    this.editingLote.set(null);
    this.formLote.set(this.buildDraftLote(polygon, centroid, areaHa));
    this.showForm.set(true);
  }

  // ---- Interaccion en el mapa ----

  protected onLoteMouseMove(event: any): void {
    const id = event?.features?.[0]?.properties?.id;
    const lote = this.lotes().find((item) => item.id === id);
    if (!lote) {
      this.mapTooltip.set(null);
      return;
    }
    this.mapTooltip.set({ x: Number(event.point?.x ?? 0), y: Number(event.point?.y ?? 0), lote });
  }

  protected onLoteMouseLeave(): void {
    this.mapTooltip.set(null);
  }

  protected onLoteClick(event: any): void {
    const id = event?.features?.[0]?.properties?.id;
    const lote = this.lotes().find((item) => item.id === id);
    if (!lote) {
      return;
    }
    this.selectedLote.set(lote);
    // Con dibujo en curso u otro modal abierto, el click solo selecciona.
    if (this.drawingPoints().length || this.showForm() || this.importModalOpen() || this.detailLote()) {
      return;
    }
    this.openHistorico(lote);
  }

  protected focusLote(lote: Lote): void {
    this.selectedLote.set(lote);
    this.closeMenu();
  }

  // ---- Historico (modal de detalle) ----

  protected openHistorico(lote: Lote, event?: Event): void {
    event?.stopPropagation();
    this.closeMenu();
    this.selectedLote.set(lote);
    this.detailLote.set(lote);
    this.reporte.set(null);

    this.loadingReporte.set(true);
    this.agricolaService.getReporteLote(lote.id).subscribe({
      next: (reporte) => {
        this.reporte.set(reporte ?? null);
        this.loadingReporte.set(false);
      },
      error: () => this.loadingReporte.set(false),
    });
  }

  protected closeDetail(): void {
    this.detailLote.set(null);
  }

  protected openClimate(lote: Lote): void {
    void this.router.navigate(['/clima'], { queryParams: { loteId: lote.id } });
  }

  protected openNdvi(lote: Lote): void {
    void this.router.navigate(['/agricola/lotes', lote.id, 'ndvi']);
  }

  private loadNdviOverlays(): void {
    this.clearNdviUrls();
    this.agricolaService.getNdviManifest().subscribe({
      next: (manifest) => {
        const available = manifest.filter((item) => item.disponible && item.version);
        if (!available.length) return;

        forkJoin(available.map((item) => this.agricolaService.getNdviImage(item.loteId).pipe(
          map((blob) => ({ item, blob })),
          catchError(() => of(null)),
        ))).subscribe((downloads) => {
          const overlays = downloads.map((download) => {
            if (!download) return null;
            const lote = this.lotes().find((candidate) => candidate.id === download.item.loteId);
            const points = lote ? parsePolygon(lote.poligono) : [];
            if (!lote || points.length < 3) return null;
            const lngs = points.map((point) => point.lng);
            const lats = points.map((point) => point.lat);
            const west = Math.min(...lngs);
            const east = Math.max(...lngs);
            const south = Math.min(...lats);
            const north = Math.max(...lats);
            return {
              ...download.item,
              url: URL.createObjectURL(download.blob),
              coordinates: [[west, north], [east, north], [east, south], [west, south]],
            } as NdviMapOverlay;
          }).filter((item): item is NdviMapOverlay => item !== null);
          this.ndviOverlays.set(overlays);
        });
      },
      error: () => this.ndviOverlays.set([]),
    });
  }

  private clearNdviUrls(): void {
    this.ndviOverlays().forEach((overlay) => URL.revokeObjectURL(overlay.url));
    this.ndviOverlays.set([]);
  }

  // ---- Alta / edicion / borrado ----

  protected startEdit(lote: Lote, event?: Event): void {
    event?.stopPropagation();
    this.closeMenu();
    this.drawingPoints.set([]);
    this.editingLote.set(lote);
    this.formLote.set(lote);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editingLote.set(null);
    this.formLote.set(null);
    this.drawingPoints.set([]);
  }

  protected persist(data: LoteRequest): void {
    const currentLote = this.editingLote();
    const request$ = currentLote
      ? this.agricolaService.updateLote(currentLote.id, data)
      : this.agricolaService.createLote(data);

    request$.subscribe({
      next: () => {
        this.closeForm();
        this.load();
      },
      error: () => this.error.set('No se pudo guardar el lote. Verifica los datos del poligono.'),
    });
  }

  protected remove(lote: Lote, event?: Event): void {
    event?.stopPropagation();
    this.closeMenu();
    this.agricolaService.deleteLote(lote.id).subscribe(() => {
      if (this.selectedLote()?.id === lote.id) {
        this.selectedLote.set(null);
      }
      this.load();
    });
  }

  // ---- Menu kebab ----

  protected toggleMenu(lote: Lote, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === lote.id ? null : lote.id));
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  // ---- Import / Export GeoJSON ----

  protected openImportModal(): void {
    this.importPayload.set('');
    this.importModalOpen.set(true);
  }

  protected closeImportModal(): void {
    this.importModalOpen.set(false);
    this.importPayload.set('');
  }

  protected importGeoJson(): void {
    this.agricolaService.importGeoJson(this.importPayload()).subscribe(() => {
      this.closeImportModal();
      this.load();
    });
  }

  protected exportGeoJson(): void {
    this.agricolaService.exportGeoJson().subscribe((geoJson) => {
      const blob = new Blob([geoJson], { type: 'application/geo+json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'lotes.geojson';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  // ---- Helpers de presentacion ----

  protected colorFor(lote: Lote): string {
    return this.loteHealthColor(lote.id);
  }

  // Color por salud del lote (feature 81): EXACTO criterio de mobile (loteHealthColor).
  // Toma las severidades de las detecciones abiertas del lote y devuelve el peor color.
  protected loteHealthColor(loteId: string): string {
    const severities = this.detecciones()
      .filter(
        (deteccion) =>
          deteccion.loteId === loteId && OPEN_DETECTION_STATES.includes(String(deteccion.estado)),
      )
      .map((deteccion) => String(deteccion.severidad));

    if (severities.includes('CRITICA')) {
      return '#FF6B6B';
    }
    if (severities.includes('ALTA')) {
      return '#FF8A4C';
    }
    if (severities.includes('MEDIA')) {
      return '#FFB84D';
    }
    if (severities.includes('BAJA')) {
      return '#A3E635';
    }
    return HEALTHY_COLOR;
  }

  protected cultivoLabel(lote: Lote): string {
    return this.cultivoKey(lote);
  }

  protected latestSeason(lote: Lote): string {
    return lote.temporada || 'Sin temporada';
  }

  protected formatArea(area?: number): string {
    return area === undefined || area === null ? '-' : `${Number(area).toFixed(2)} ha`;
  }

  protected formatDate(value?: string | null): string {
    if (!value) {
      return 'Sin dato';
    }
    const [year, month, day] = String(value).split('T')[0].split('-');
    return year && month && day ? `${day}/${month}/${year}` : String(value);
  }

  protected metricValue(lote: Lote, key: 'phMin' | 'phMax' | 'siembra' | 'cosecha'): string {
    switch (key) {
      case 'phMin':
        return lote.phMinimo !== undefined && lote.phMinimo !== null ? String(lote.phMinimo) : 'Sin dato';
      case 'phMax':
        return lote.phMaximo !== undefined && lote.phMaximo !== null ? String(lote.phMaximo) : 'Sin dato';
      case 'siembra':
        return this.formatDate(lote.fechaSiembra);
      case 'cosecha':
        return this.formatDate(lote.fechaCosechaEstimada);
      default:
        return 'Sin dato';
    }
  }

  protected iconPath(icon: string): string {
    const icons: Record<string, string> = {
      grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
      area: 'M4 7l8-3 8 3v10l-8 3-8-3V7Z M12 4v16',
      crop: 'M12 21V8 M6 12c4 0 6-2 6-6-4 0-6 2-6 6Z M18 15c-4 0-6-2-6-6 4 0 6 2 6 6Z',
    };
    return icons[icon] ?? icons['grid'];
  }

  // ---- Internos ----

  private cultivoKey(lote: Lote): string {
    return (lote.cultivoNombre || lote.cultivo || 'Sin cultivo').trim() || 'Sin cultivo';
  }

  private buildDraftLote(polygon: string, centroid: { lat?: number; lng?: number }, areaHa: number): Lote {
    return {
      id: '',
      nombre: '',
      area: areaHa,
      cultivo: '',
      temporada: '',
      latitud: centroid.lat,
      longitud: centroid.lng,
      poligono: polygon,
      createdAt: '',
      updatedAt: '',
    };
  }

  private toFeature(lote: Lote): Feature<Polygon> | null {
    if (!lote.poligono) {
      return null;
    }
    try {
      const geometry = JSON.parse(lote.poligono) as Polygon;
      if (!geometry || geometry.type !== 'Polygon') {
        return null;
      }
      return {
        type: 'Feature',
        geometry,
        properties: {
          id: lote.id,
          nombre: lote.nombre,
          color: this.colorFor(lote),
        },
      };
    } catch {
      return null;
    }
  }

  private clickHitsLote(event: any): boolean {
    try {
      const features = event?.target?.queryRenderedFeatures?.(event.point, { layers: ['lotes-fill'] });
      return Array.isArray(features) && features.length > 0;
    } catch {
      return false;
    }
  }

  private resolveLoteLngLat(lote: Lote): [number, number] | null {
    const points = parsePolygon(lote.poligono);
    if (points.length) {
      const centroid = computeCentroid(points);
      if (centroid.lng != null && centroid.lat != null) {
        return [centroid.lng, centroid.lat];
      }
    }
    if (lote.longitud != null && lote.latitud != null) {
      return [Number(lote.longitud), Number(lote.latitud)];
    }
    return null;
  }

  private computeMapCenter(): [number, number] {
    const selected = this.selectedLote();
    if (selected) {
      const lngLat = this.resolveLoteLngLat(selected);
      if (lngLat) {
        return lngLat;
      }
    }
    const points = this.lotes().flatMap((lote) => parsePolygon(lote.poligono));
    if (!points.length) {
      return DEFAULT_CENTER;
    }
    const centroid = computeCentroid(points);
    return [centroid.lng ?? DEFAULT_CENTER[0], centroid.lat ?? DEFAULT_CENTER[1]];
  }
}
