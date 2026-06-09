import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import type { Potrero, PotreroRequest } from '../../core/models/ganaderia.models';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { buildPolygon, computeAreaHectares, computeCentroid, parsePolygon, sanitizePoints, type Point } from '../../shared/lote-geometry';

const DEFAULT_CENTER: [number, number] = [-60.6735049, -36.1966878];
const STATUS_COLORS: Record<string, string> = {
  ACTIVO: '#9FE870',
  DESCANSO: '#6EA8FF',
  MANTENIMIENTO: '#FFB84D',
  INACTIVO: '#A6B0CF',
};

@Component({
  selector: 'app-ganaderia-potreros-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMapLibreGLModule],
  templateUrl: './ganaderia-potreros-page.component.html',
  styleUrl: './ganaderia-potreros-page.component.css',
})
export class GanaderiaPotrerosPageComponent {
  private readonly ganaderiaService = inject(GanaderiaService);

  protected readonly potreros = signal<Potrero[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly drawingPoints = signal<Point[]>([]);
  protected readonly modalOpen = signal(false);
  protected readonly editingPotrero = signal<Potrero | null>(null);
  protected readonly selectedPotrero = signal<Potrero | null>(null);
  protected readonly mapTooltip = signal<{ x: number; y: number; potrero: Potrero } | null>(null);
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly detailPotrero = signal<Potrero | null>(null);
  protected readonly form = signal<PotreroRequest>(this.emptyForm());

  protected readonly tipoUsos = ['PASTOREO', 'RESERVA', 'RECRIA', 'MATERNIDAD', 'ENCIERRE', 'OTRO'];
  protected readonly estados = ['ACTIVO', 'DESCANSO', 'MANTENIMIENTO', 'INACTIVO'];

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
  protected readonly mapMode = signal<'satelite' | 'mapa'>('satelite');
  protected readonly mapStyle = computed(() => this.mapMode() === 'satelite' ? this.satelliteStyle : this.streetStyle);
  protected readonly mapZoom = computed<[number]>(() => [this.potreros().length || this.drawingPoints().length ? 13 : 5]);
  protected readonly mapCenter = computed<[number, number]>(() => this.computeMapCenter());
  protected readonly draftAreaHa = computed(() => computeAreaHectares(this.drawingPoints()) ?? 0);

  protected readonly potrerosData = computed<FeatureCollection<Polygon>>(() => ({
    type: 'FeatureCollection',
    features: this.potreros()
      .map((potrero) => this.toFeature(potrero))
      .filter((feature): feature is Feature<Polygon> => feature !== null),
  }));

  protected readonly draftData = computed<FeatureCollection<Polygon>>(() => {
    const points = this.drawingPoints();
    if (points.length < 3) {
      return { type: 'FeatureCollection', features: [] };
    }
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[...points.map((point) => [point.lng, point.lat]), [points[0].lng, points[0].lat]]],
        },
      }],
    };
  });

  protected readonly kpis = computed(() => {
    const potreros = this.potreros();
    const hectares = potreros.reduce((total, item) => total + Number(item.superficieHa || 0), 0);
    const capacity = potreros.reduce((total, item) => total + Number(item.capacidadAnimales || 0), 0);
    const descanso = potreros.filter((item) => item.estado === 'DESCANSO').length;
    return [
      { label: 'Potreros activos', value: potreros.filter((item) => item.estado === 'ACTIVO').length.toString(), helper: 'Sectores disponibles', icon: 'grid' },
      { label: 'Hectareas mapeadas', value: `${hectares.toFixed(2)} ha`, helper: 'Superficie operativa', icon: 'area' },
      { label: 'Capacidad total', value: capacity.toString(), helper: 'Animales estimados', icon: 'capacity' },
      { label: 'En descanso', value: descanso.toString(), helper: 'Rotacion y recuperacion', icon: 'rest' },
    ];
  });

  constructor() {
    this.load();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.detailPotrero()) {
      this.closeDetail();
      return;
    }
    if (this.openMenuId()) {
      this.closeMenu();
      return;
    }
    if (this.modalOpen()) {
      this.closeModal();
    }
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ganaderiaService.getPotrerosMapa().subscribe({
      next: (potreros) => {
        this.potreros.set(potreros);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los potreros.');
        this.loading.set(false);
      },
    });
  }

  protected startNewMapping(): void {
    this.editingPotrero.set(null);
    this.selectedPotrero.set(null);
    this.drawingPoints.set([]);
    this.form.set(this.emptyForm());
    this.modalOpen.set(false);
  }

  protected cancelDrawing(): void {
    this.drawingPoints.set([]);
    this.editingPotrero.set(null);
    this.modalOpen.set(false);
  }

  protected onMapClick(event: any): void {
    if (this.modalOpen()) {
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
    this.openModalFromPoints(points);
  }

  protected undoPoint(): void {
    this.drawingPoints.set(this.drawingPoints().slice(0, -1));
  }

  protected openModalFromPoints(points: Point[]): void {
    const polygon = buildPolygon(points);
    if (!polygon) {
      return;
    }
    const centroid = computeCentroid(points);
    const areaHa = computeAreaHectares(points) ?? 0;
    this.form.set({
      ...this.emptyForm(),
      superficieHa: areaHa,
      poligono: polygon,
      centroideLatitud: centroid.lat,
      centroideLongitud: centroid.lng,
    });
    this.modalOpen.set(true);
  }

  protected savePotrero(): void {
    const data = this.form();
    if (!data.nombre.trim() || !data.poligono) {
      this.error.set('El nombre y el poligono son requeridos.');
      return;
    }

    const current = this.editingPotrero();
    const request$ = current
      ? this.ganaderiaService.updatePotrero(current.id, data)
      : this.ganaderiaService.createPotrero(data);

    request$.subscribe({
      next: () => {
        this.modalOpen.set(false);
        this.editingPotrero.set(null);
        this.drawingPoints.set([]);
        this.load();
      },
      error: () => this.error.set('No se pudo guardar el potrero. Verifica los datos del poligono.'),
    });
  }

  protected editPotrero(potrero: Potrero): void {
    this.closeMenu();
    const points = parsePolygon(potrero.poligono);
    this.editingPotrero.set(potrero);
    this.selectedPotrero.set(potrero);
    this.drawingPoints.set(points);
    this.form.set({
      nombre: potrero.nombre,
      descripcion: potrero.descripcion,
      superficieHa: Number(potrero.superficieHa || 0),
      tipoUso: potrero.tipoUso,
      estado: potrero.estado,
      capacidadAnimales: potrero.capacidadAnimales,
      recursoForrajero: potrero.recursoForrajero,
      disponibilidadAgua: potrero.disponibilidadAgua,
      tieneSombra: potrero.tieneSombra,
      observaciones: potrero.observaciones,
      poligono: potrero.poligono,
      centroideLatitud: potrero.centroideLatitud,
      centroideLongitud: potrero.centroideLongitud,
    });
    this.modalOpen.set(true);
  }

  protected deletePotrero(potrero: Potrero): void {
    this.closeMenu();
    this.ganaderiaService.deletePotrero(potrero.id).subscribe(() => {
      this.selectedPotrero.set(null);
      this.load();
    });
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingPotrero.set(null);
  }

  protected updateForm<K extends keyof PotreroRequest>(key: K, value: PotreroRequest[K]): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  protected onPotreroMouseMove(event: any): void {
    const id = event?.features?.[0]?.properties?.id;
    const potrero = this.potreros().find((item) => item.id === id);
    if (!potrero) {
      this.mapTooltip.set(null);
      return;
    }
    this.mapTooltip.set({ x: Number(event.point?.x ?? 0), y: Number(event.point?.y ?? 0), potrero });
  }

  protected onPotreroMouseLeave(): void {
    this.mapTooltip.set(null);
  }

  protected onPotreroClick(event: any): void {
    const id = event?.features?.[0]?.properties?.id;
    const potrero = this.potreros().find((item) => item.id === id);
    if (potrero) {
      this.selectedPotrero.set(potrero);
    }
  }

  protected colorFor(potrero: Potrero): string {
    return STATUS_COLORS[String(potrero.estado ?? '').toUpperCase()] ?? '#9FE870';
  }

  protected occupancyPercent(potrero: Potrero): number {
    const capacity = Number(potrero.capacidadAnimales || 0);
    const load = Number(potrero.cargaAnimalActual || 0);
    if (capacity <= 0) {
      return 0;
    }
    return Math.round((load / capacity) * 100);
  }

  protected occupancyWidth(potrero: Potrero): number {
    return Math.min(this.occupancyPercent(potrero), 100);
  }

  protected occupancyColor(potrero: Potrero): string {
    const percent = this.occupancyPercent(potrero);
    if (percent > 100) {
      return '#FF6B6B';
    }
    if (percent > 85) {
      return '#FF8A4D';
    }
    if (percent > 60) {
      return '#FFB84D';
    }
    return '#9FE870';
  }

  protected forageLabel(potrero: Potrero): string {
    const value = String(potrero.recursoForrajero || 'Sin recurso').trim();
    return value ? value.toUpperCase() : 'SIN RECURSO';
  }

  protected usageLabel(potrero: Potrero): string {
    return `${this.formatEnum(potrero.tipoUso)} ${this.formatEnum(potrero.estado)}`.trim();
  }

  protected toggleMenu(potrero: Potrero, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => current === potrero.id ? null : potrero.id);
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected showDetail(potrero: Potrero, event?: Event): void {
    event?.stopPropagation();
    this.selectedPotrero.set(potrero);
    this.detailPotrero.set(potrero);
    this.closeMenu();
  }

  protected showHistory(potrero: Potrero, event?: Event): void {
    event?.stopPropagation();
    this.selectedPotrero.set(potrero);
    this.detailPotrero.set(potrero);
    this.closeMenu();
  }

  protected closeDetail(): void {
    this.detailPotrero.set(null);
  }

  protected iconPath(icon: string): string {
    const icons: Record<string, string> = {
      grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
      area: 'M4 17c3-5 13-5 16 0 M7 17c1-3 9-3 10 0 M12 6v9 M8 10h8',
      capacity: 'M7 19v-2a4 4 0 0 1 8 0v2 M9 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M17 19v-2a3 3 0 0 0-2-2.8 M7 14.2A3 3 0 0 0 5 17v2',
      rest: 'M5 18c7 0 12-5 12-12-7 0-12 5-12 12Z M5 18c0-6 4-10 10-12',
    };
    return icons[icon] ?? icons['grid'];
  }

  private toFeature(potrero: Potrero): Feature<Polygon> | null {
    try {
      const geometry = JSON.parse(potrero.poligono) as Polygon;
      if (!geometry || geometry.type !== 'Polygon') {
        return null;
      }
      return {
        type: 'Feature',
        geometry,
        properties: {
          id: potrero.id,
          nombre: potrero.nombre,
          estado: potrero.estado,
          color: this.colorFor(potrero),
        },
      };
    } catch {
      return null;
    }
  }

  private computeMapCenter(): [number, number] {
    const points = this.potreros().flatMap((potrero) => parsePolygon(potrero.poligono));
    if (!points.length) {
      return DEFAULT_CENTER;
    }
    const centroid = computeCentroid(points);
    return [centroid.lng ?? DEFAULT_CENTER[0], centroid.lat ?? DEFAULT_CENTER[1]];
  }

  private formatEnum(value?: string): string {
    return String(value || '')
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private emptyForm(): PotreroRequest {
    return {
      nombre: '',
      descripcion: '',
      superficieHa: 0,
      tipoUso: 'PASTOREO',
      estado: 'ACTIVO',
      capacidadAnimales: undefined,
      recursoForrajero: '',
      disponibilidadAgua: true,
      tieneSombra: false,
      observaciones: '',
      poligono: '',
      centroideLatitud: undefined,
      centroideLongitud: undefined,
    };
  }
}
