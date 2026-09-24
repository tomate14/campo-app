import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import { AgricolaService } from '../../core/services/agricola.service';
import { MultiSearchSelectComponent } from '../../shared/multi-search-select/multi-search-select.component';
import type {
  Lote,
  ReporteCostosAgricolaResponse,
  ReporteGestionAgricolaResponse,
  ReporteLoteCostoMapa,
  ReporteSeriePunto,
} from '../../core/models/agricola.models';

type Section = 'estadisticas' | 'gestion';
type MapMode = 'salud' | 'costo';

interface FilterOption {
  id: string;
  nombre: string;
  metaText: string;
  color: string;
}

interface LinePoint {
  x: number;
  y: number;
  leftPct: number;
  topPct: number;
  etiqueta: string;
  valor: number;
}

const DEFAULT_CENTER: [number, number] = [-60.6735049, -36.1966878];
const CULTIVO_COLORS = ['#9FE870', '#FFB84D', '#6EA8FF', '#B68CFF', '#A3E635', '#39D0D8', '#FF6B6B'];
// Escala verde -> rojo para el modo "Costo/ha" del mapa (bajo a alto).
const COSTO_SCALE = ['#9FE870', '#A3E635', '#FFB84D', '#FF8A4C', '#FF6B6B'];

@Component({
  selector: 'app-reportes-agricola-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMapLibreGLModule, MultiSearchSelectComponent],
  templateUrl: './reportes-agricola-page.component.html',
  styleUrl: './reportes-agricola-page.component.css',
})
export class ReportesAgricolaPageComponent {
  private readonly agricolaService = inject(AgricolaService);

  protected readonly section = signal<Section>('estadisticas');

  // Parte 1 · estadísticas.
  protected readonly costos = signal<ReporteCostosAgricolaResponse | null>(null);
  protected readonly loadingCostos = signal(true);
  protected readonly errorCostos = signal<string | null>(null);
  protected readonly mapMode = signal<MapMode>('salud');

  // Parte 2 · gestión.
  protected readonly gestion = signal<ReporteGestionAgricolaResponse | null>(null);
  protected readonly loadingGestion = signal(true);
  protected readonly errorGestion = signal<string | null>(null);
  protected readonly validatingId = signal<string | null>(null);

  // Filtros.
  protected readonly desde = signal(this.daysAgo(365));
  protected readonly hasta = signal(this.today());
  protected readonly loteIds = signal<string[]>([]);
  protected readonly cultivoIds = signal<string[]>([]);
  protected readonly loteOptions = signal<FilterOption[]>([]);
  protected readonly cultivoOptions = signal<FilterOption[]>([]);

  protected readonly mapTooltip = signal<{ x: number; y: number; nombre: string; cultivo: string; area: number; salud: string; costoHa: number } | null>(null);

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

  protected readonly kpis = computed(() => this.costos()?.kpis ?? null);
  protected readonly periodo = computed(() => this.costos()?.periodo ?? null);
  protected readonly advertencias = computed(() => this.costos()?.advertencias ?? []);

  protected readonly ranking = computed(() => {
    const rows = this.costos()?.rankingLotes ?? [];
    const max = Math.max(...rows.map((r) => r.costoHa), 1);
    return rows.map((row, index) => ({
      ...row,
      widthPct: (row.costoHa / max) * 100,
      color: COSTO_SCALE[Math.min(COSTO_SCALE.length - 1, Math.floor((index / Math.max(rows.length - 1, 1)) * (COSTO_SCALE.length - 1)))],
    }));
  });

  protected readonly composicion = computed(() => {
    const rows = this.costos()?.composicion ?? [];
    return rows.map((row, index) => ({ ...row, color: this.cropColor(index) }));
  });

  protected readonly donutGradient = computed(() => {
    const rows = this.composicion();
    if (!rows.length) {
      return 'conic-gradient(rgba(110,168,255,.15) 0 100%)';
    }
    let acc = 0;
    const stops = rows.map((row) => {
      const start = acc;
      acc += Number(row.porcentaje ?? 0);
      return `${row.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  protected readonly cultivoBars = computed(() => {
    const rows = this.costos()?.costoPorCultivo ?? [];
    const max = Math.max(...rows.map((r) => r.costoHa), 1);
    return rows.map((row, index) => ({
      ...row,
      heightPct: (row.costoHa / max) * 100,
      color: this.cropColor(index),
    }));
  });

  protected readonly evolucion = computed<LinePoint[]>(() => {
    const rows = this.costos()?.evolucionMensual ?? [];
    return this.buildLinePoints(rows);
  });

  protected readonly evoAreaPoints = computed(() => {
    const points = this.evolucion();
    if (!points.length) return '';
    const body = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const first = points[0];
    const last = points[points.length - 1];
    return `${first.x.toFixed(1)},180 ${body} ${last.x.toFixed(1)},180`;
  });

  protected readonly evoLinePoints = computed(() =>
    this.evolucion().map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
  );

  protected readonly evoMax = computed(() => {
    const values = (this.costos()?.evolucionMensual ?? []).map((p) => Number(p.valor ?? 0));
    return Math.max(...values, 1);
  });

  protected readonly contexto = computed(() => this.costos()?.contexto ?? null);
  protected readonly rendimiento = computed(() => this.contexto()?.rendimientoComparativo ?? null);
  protected readonly rendimientoBars = computed(() => {
    const comp = this.rendimiento();
    if (!comp) return [];
    const actual = comp.actual ?? [];
    const historico = comp.historico ?? [];
    const max = Math.max(...actual.map((p) => Number(p.valor ?? 0)), ...historico.map((p) => Number(p.valor ?? 0)), 1);
    return actual.map((point, index) => ({
      etiqueta: point.etiqueta,
      actualValue: Number(point.valor ?? 0),
      actualPct: (Number(point.valor ?? 0) / max) * 100,
      historicoPct: (Number(historico[index]?.valor ?? 0) / max) * 100,
    }));
  });

  protected readonly distribucion = computed(() => {
    const rows = this.contexto()?.distribucionCultivos ?? [];
    return rows.map((row, index) => ({ ...row, color: this.cropColor(index) }));
  });

  protected readonly fenologias = computed(() => {
    const rows = this.contexto()?.estadosFenologicos ?? [];
    return rows.map((row, index) => ({ ...row, color: this.cropColor(index) }));
  });

  protected readonly resumenCosecha = computed(() => this.contexto()?.resumenCosecha ?? null);
  protected readonly destinos = computed(() => {
    const rows = this.resumenCosecha()?.destinos ?? [];
    const total = rows.reduce((sum, row) => sum + Number(row.cantidadTn ?? 0), 0) || 1;
    return rows.map((row) => ({ ...row, pct: (Number(row.cantidadTn ?? 0) / total) * 100 }));
  });

  protected readonly actividad = computed(() => this.costos()?.actividadAplicaciones ?? null);

  // Gestión.
  protected readonly alertas = computed(() => this.gestion()?.alertas ?? []);
  protected readonly ordenesPorValidar = computed(() => this.gestion()?.ordenesPorValidar ?? []);
  protected readonly ordenesTrabajo = computed(() => this.gestion()?.ordenesTrabajo ?? null);
  protected readonly tareas = computed(() => this.gestion()?.tareasRecomendadas ?? []);

  protected readonly mapData = computed<FeatureCollection<Polygon | MultiPolygon>>(() => {
    const lotes = this.costos()?.lotesMapa ?? [];
    const mode = this.mapMode();
    const costos = lotes.map((l) => Number(l.costoHa ?? 0));
    const min = Math.min(...costos, 0);
    const max = Math.max(...costos, 1);
    const features = lotes
      .map((lote) => this.toMapFeature(lote, mode, min, max))
      .filter((feature): feature is FeatureCollection<Polygon | MultiPolygon>['features'][number] => feature !== null);
    return { type: 'FeatureCollection', features };
  });

  protected readonly mapCenter = computed<[number, number]>(() => this.computeMapCenter(this.mapData()));
  protected readonly mapZoom = computed<[number]>(() => [this.mapData().features.length ? 10 : 4]);

  constructor() {
    this.loadLotesCatalogo();
    this.loadCostos();
    this.loadGestion();
  }

  protected setSection(value: Section): void {
    this.section.set(value);
  }

  protected setMapMode(value: MapMode): void {
    this.mapMode.set(value);
  }

  protected onLoteIdsChange(values: string[]): void {
    this.loteIds.set(values);
  }

  protected onCultivoIdsChange(values: string[]): void {
    this.cultivoIds.set(values);
  }

  protected applyFilters(): void {
    this.loadCostos();
  }

  protected loadCostos(): void {
    this.loadingCostos.set(true);
    this.errorCostos.set(null);
    const total = this.loteOptions().length;
    const loteSel = this.loteIds();
    const cultivoTotal = this.cultivoOptions().length;
    const cultivoSel = this.cultivoIds();
    this.agricolaService
      .getReporteCostosAgricola({
        desde: this.desde(),
        hasta: this.hasta(),
        loteIds: loteSel.length && loteSel.length < total ? loteSel : undefined,
        cultivos: cultivoSel.length && cultivoSel.length < cultivoTotal ? cultivoSel : undefined,
      })
      .subscribe({
        next: (data) => {
          this.costos.set(data);
          this.loadingCostos.set(false);
        },
        error: () => {
          this.errorCostos.set('No se pudieron cargar las estadísticas de costos.');
          this.loadingCostos.set(false);
        },
      });
  }

  protected loadGestion(): void {
    this.loadingGestion.set(true);
    this.errorGestion.set(null);
    this.agricolaService.getReporteGestionAgricola().subscribe({
      next: (data) => {
        this.gestion.set(data);
        this.loadingGestion.set(false);
      },
      error: () => {
        this.errorGestion.set('No se pudo cargar la gestión operativa.');
        this.loadingGestion.set(false);
      },
    });
  }

  protected validarOrden(id: string): void {
    if (this.validatingId()) return;
    this.validatingId.set(id);
    this.agricolaService.validarOrdenAplicacion(id).subscribe({
      next: () => {
        this.validatingId.set(null);
        this.loadGestion();
        this.loadCostos();
      },
      error: () => {
        this.validatingId.set(null);
        this.errorGestion.set('No se pudo validar la orden de aplicación.');
      },
    });
  }

  protected onLoteMouseMove(event: any): void {
    const properties = event?.features?.[0]?.properties;
    if (!properties) {
      this.mapTooltip.set(null);
      return;
    }
    this.mapTooltip.set({
      x: Number(event.point?.x ?? 0),
      y: Number(event.point?.y ?? 0),
      nombre: String(properties.nombre ?? 'Lote'),
      cultivo: String(properties.cultivo ?? 'Sin cultivo'),
      area: Number(properties.area ?? 0),
      salud: String(properties.salud ?? 'Sin dato'),
      costoHa: Number(properties.costoHa ?? 0),
    });
  }

  protected onLoteMouseLeave(): void {
    this.mapTooltip.set(null);
  }

  protected severityClass(severidad: string | undefined): string {
    const value = (severidad ?? '').toUpperCase();
    if (value === 'ALTA' || value === 'CRITICA') return 'high';
    if (value === 'MEDIA') return 'mid';
    return 'low';
  }

  protected severityLabel(severidad: string | undefined): string {
    const value = (severidad ?? '').toUpperCase();
    if (value === 'ALTA') return 'Alta';
    if (value === 'CRITICA') return 'Crítica';
    if (value === 'MEDIA') return 'Media';
    if (value === 'BAJA') return 'Baja';
    return severidad ?? 'Info';
  }

  protected cropColor(index: number): string {
    return CULTIVO_COLORS[index % CULTIVO_COLORS.length];
  }

  protected moneyCompact(value: number | undefined | null): string {
    const num = Number(value ?? 0);
    const abs = Math.abs(num);
    if (abs >= 1_000_000) return `$ ${this.decimal(num / 1_000_000, 1)} M`;
    if (abs >= 1_000) return `$ ${this.decimal(num / 1_000, 1)} k`;
    return `$ ${this.decimal(num, 0)}`;
  }

  protected money(value: number | undefined | null): string {
    return `$ ${this.decimal(Number(value ?? 0), 0)}`;
  }

  protected decimal(value: number, digits: number): string {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);
  }

  protected number(value: number | undefined | null, digits = 0): string {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(Number(value ?? 0));
  }

  protected percent(value: number | undefined | null): string {
    return `${this.number(value, 0)}%`;
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  private loadLotesCatalogo(): void {
    this.agricolaService.getLotes().subscribe({
      next: (lotes) => {
        this.loteOptions.set(
          lotes.map((lote, index) => ({
            id: lote.id,
            nombre: lote.nombre,
            metaText: `${this.number(lote.area, 2)} ha · ${lote.cultivoNombre ?? lote.cultivo ?? 'Sin cultivo'}`,
            color: this.cropColor(index),
          })),
        );
        this.cultivoOptions.set(this.buildCultivoOptions(lotes));
      },
      error: () => {
        this.loteOptions.set([]);
        this.cultivoOptions.set([]);
      },
    });
  }

  private buildCultivoOptions(lotes: Lote[]): FilterOption[] {
    const groups = new Map<string, { nombre: string; lotes: number }>();
    for (const lote of lotes) {
      const id = lote.cultivo ?? '';
      if (!id) continue;
      const current = groups.get(id) ?? { nombre: lote.cultivoNombre ?? id, lotes: 0 };
      current.lotes += 1;
      groups.set(id, current);
    }
    return Array.from(groups.entries()).map(([id, info], index) => ({
      id,
      nombre: info.nombre,
      metaText: info.lotes === 1 ? '1 lote' : `${info.lotes} lotes`,
      color: this.cropColor(index),
    }));
  }

  private buildLinePoints(series: ReporteSeriePunto[]): LinePoint[] {
    const values = series.map((point) => Number(point.valor ?? 0));
    if (!values.length) return [];
    const max = Math.max(...values, 1);
    const width = 600;
    const height = 180;
    const step = values.length === 1 ? 0 : width / (values.length - 1);
    return series.map((point, index) => {
      const value = Number(point.valor ?? 0);
      const x = values.length === 1 ? width / 2 : index * step;
      const y = height - (value / max) * (height * 0.9);
      return {
        x,
        y,
        leftPct: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
        topPct: (y / height) * 100,
        etiqueta: point.etiqueta,
        valor: value,
      };
    });
  }

  private toMapFeature(lote: ReporteLoteCostoMapa, mode: MapMode, min: number, max: number): FeatureCollection<Polygon | MultiPolygon>['features'][number] | null {
    try {
      const parsed = JSON.parse(lote.poligono) as Polygon | MultiPolygon;
      if (!parsed || (parsed.type !== 'Polygon' && parsed.type !== 'MultiPolygon')) {
        return null;
      }
      const color = mode === 'costo' ? this.costoColor(Number(lote.costoHa ?? 0), min, max) : lote.saludColor || '#9FE870';
      return {
        type: 'Feature',
        geometry: parsed,
        properties: {
          loteId: lote.loteId,
          nombre: lote.nombre,
          cultivo: lote.cultivo,
          area: lote.area,
          salud: lote.salud,
          costoHa: lote.costoHa,
          color,
        },
      };
    } catch {
      return null;
    }
  }

  private costoColor(value: number, min: number, max: number): string {
    const range = Math.max(max - min, 1);
    const ratio = Math.min(1, Math.max(0, (value - min) / range));
    const index = Math.min(COSTO_SCALE.length - 1, Math.round(ratio * (COSTO_SCALE.length - 1)));
    return COSTO_SCALE[index];
  }

  private computeMapCenter(data: FeatureCollection<Polygon | MultiPolygon>): [number, number] {
    const coordinates = data.features.flatMap((feature) => this.flattenCoordinates(feature.geometry));
    const valid = coordinates.filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
    if (!valid.length) return DEFAULT_CENTER;
    const sum = valid.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
    return [sum[0] / valid.length, sum[1] / valid.length];
  }

  private flattenCoordinates(geometry: Polygon | MultiPolygon): [number, number][] {
    if (geometry.type === 'Polygon') {
      return geometry.coordinates.flat().map(([lng, lat]) => [lng, lat]);
    }
    return geometry.coordinates.flat(2).map(([lng, lat]) => [lng, lat]);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private daysAgo(days: number): string {
    return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  }
}
