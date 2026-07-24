import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import { AgricolaService } from '../../core/services/agricola.service';
import { MaterialDonutChartComponent, type MaterialDonutItem } from '../../shared/material-donut-chart/material-donut-chart.component';
import { MaterialLineChartComponent } from '../../shared/material-line-chart/material-line-chart.component';
import type {
  ReporteAgricolaDashboard,
  ReporteAgricolaKpi,
  ReporteCultivoFenologico,
  ReporteLoteMapa,
  ReporteSeriePunto,
} from '../../core/models/agricola.models';

const EMPTY_MAP: FeatureCollection<Polygon | MultiPolygon> = {
  type: 'FeatureCollection',
  features: [],
};

const DEFAULT_CENTER: [number, number] = [-60.6735049, -36.1966878];
const CULTIVO_COLORS = ['#9FE870', '#A3E635', '#6EA8FF', '#FFB84D', '#B68CFF', '#FF6B6B'];

@Component({
  selector: 'app-reportes-agricola-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMapLibreGLModule, MaterialLineChartComponent, MaterialDonutChartComponent],
  templateUrl: './reportes-agricola-page.component.html',
  styleUrl: './reportes-agricola-page.component.css',
})
export class ReportesAgricolaPageComponent {
  private readonly agricolaService = inject(AgricolaService);

  protected readonly dashboard = signal<ReporteAgricolaDashboard | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedCultivo = signal<string>('');
  protected readonly mapTooltip = signal<{ x: number; y: number; nombre: string; cultivo: string; area: number; salud: string } | null>(null);

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

  protected readonly campaign = computed(() => this.dashboard()?.campania ?? 'Sin campaña');
  protected readonly lastUpdate = computed(() => this.formatDateTime(this.dashboard()?.ultimaActualizacion));
  protected readonly kpis = computed(() => this.dashboard()?.kpis ?? []);
  protected readonly fenologias = computed(() => this.dashboard()?.estadosFenologicos ?? []);
  protected readonly selectedFenologia = computed(() => {
    const items = this.fenologias();
    if (!items.length) {
      return null;
    }
    const selected = this.selectedCultivo();
    return items.find((item) => item.cultivo === selected) ?? items[0];
  });
  protected readonly rendimiento = computed(() => this.dashboard()?.rendimientoComparativo ?? null);
  protected readonly distribucion = computed(() => this.dashboard()?.distribucionCultivos ?? []);
  protected readonly totalLotes = computed(() => this.distribucion().reduce((total, item) => total + item.lotes, 0));
  protected readonly donutItems = computed<MaterialDonutItem[]>(() =>
    this.distribucion().map((item, index) => ({
      label: item.cultivo,
      value: item.lotes,
      percentage: Number(item.porcentaje ?? 0),
      color: this.cropColor(index),
    })),
  );
  protected readonly evolucionSalud = computed(() => this.dashboard()?.evolucionSalud ?? []);
  protected readonly alertas = computed(() => this.dashboard()?.alertasRecientes ?? []);
  protected readonly tareas = computed(() => this.dashboard()?.tareasRecomendadas ?? []);
  protected readonly cropHealthIndex = computed(() => this.kpiByCodigo('INDICE_SALUD_CULTIVOS')?.valorNumerico ?? 0);

  protected readonly mapData = computed<FeatureCollection<Polygon | MultiPolygon>>(() => {
    const lotes = this.dashboard()?.lotesMapa ?? [];
    const features = lotes
      .map((lote) => this.toMapFeature(lote))
      .filter((feature): feature is FeatureCollection<Polygon | MultiPolygon>['features'][number] => feature !== null);

    return { type: 'FeatureCollection', features };
  });

  protected readonly mapCenter = computed<[number, number]>(() => this.computeMapCenter(this.mapData()));
  protected readonly mapZoom = computed<[number]>(() => [this.mapData().features.length ? 10 : 4]);

  constructor() {
    this.loadDashboard();
  }

  protected onCultivoChange(value: string): void {
    this.selectedCultivo.set(value);
  }

  protected kpiByCodigo(codigo: string): ReporteAgricolaKpi | undefined {
    return this.kpis().find((kpi) => kpi.codigo === codigo);
  }

  protected kpiIconPath(codigo: string): string {
    const icons: Record<string, string> = {
      HECTAREAS_PRODUCCION: 'M5 18c7 0 12-5 12-12-7 0-12 5-12 12Z M5 18c0-6 4-10 10-12',
      RENDIMIENTO_PROYECTADO: 'M4 19h16 M6 16l4-5 4 3 5-8 M18 6h1v1',
      ALERTAS_ACTIVAS: 'M12 3l9 16H3L12 3Z M12 9v4 M12 17h.01',
      LOTES_MONITOREO_PENDIENTE: 'M4 7h16 M4 12h16 M4 17h16 M7 4v16 M17 4v16',
      INDICE_SALUD_CULTIVOS: 'M20 8c0 7-8 12-8 12S4 15 4 8a4 4 0 0 1 8 0 4 4 0 0 1 8 0Z M12 20V8',
      PRECIPITACION_ACUMULADA: 'M16 13a4 4 0 0 0-8 0 M12 3v6 M8 21l1-2 M12 21v-2 M16 21l-1-2',
      COSTO_HECTAREA: 'M12 2v20 M17 6H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H7',
      MARGEN_BRUTO_PROYECTADO: 'M4 18h16 M7 15l4-4 3 3 4-8 M18 6h1v1',
    };
    return icons[codigo] ?? 'M12 3v18 M3 12h18';
  }

  protected linePoints(series: ReporteSeriePunto[] | undefined, width = 260, height = 86): string {
    const values = (series ?? []).map((point) => Number(point.valor)).filter((value) => Number.isFinite(value));
    if (!values.length) {
      return '';
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 1);
    const step = values.length === 1 ? width : width / (values.length - 1);

    return values
      .map((value, index) => {
        const x = values.length === 1 ? width / 2 : index * step;
        const y = height - ((value - min) / range) * (height * 0.78) - height * 0.1;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  protected serieLabels(series: ReporteSeriePunto[] | undefined): string[] {
    return (series ?? []).map((point) => point.etiqueta);
  }

  protected cropColor(index: number): string {
    return CULTIVO_COLORS[index % CULTIVO_COLORS.length];
  }

  protected priorityClass(priority: string | undefined): string {
    const value = (priority ?? '').toUpperCase();
    if (value === 'CRITICA' || value === 'ALTA') return 'red';
    if (value === 'MEDIA') return 'yellow';
    if (value === 'BAJA') return 'green';
    return 'blue';
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  protected formatDateTime(value?: string): string {
    if (!value) return 'Sin datos';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin datos';
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  protected onLoteMouseMove(event: any): void {
    const feature = event?.features?.[0];
    const properties = feature?.properties;
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
    });
  }

  protected onLoteMouseLeave(): void {
    this.mapTooltip.set(null);
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.agricolaService.getReporteAgricolaDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.selectedCultivo.set(dashboard.estadosFenologicos[0]?.cultivo ?? '');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el dashboard agrícola.');
        this.loading.set(false);
      },
    });
  }

  private toMapFeature(lote: ReporteLoteMapa): FeatureCollection<Polygon | MultiPolygon>['features'][number] | null {
    try {
      const parsed = JSON.parse(lote.poligono) as Polygon | MultiPolygon;
      if (!parsed || (parsed.type !== 'Polygon' && parsed.type !== 'MultiPolygon')) {
        return null;
      }

      return {
        type: 'Feature',
        geometry: parsed,
        properties: {
          loteId: lote.loteId,
          nombre: lote.nombre,
          cultivo: lote.cultivo,
          area: lote.area,
          salud: lote.salud,
          color: lote.color || '#9FE870',
        },
      };
    } catch {
      return null;
    }
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
}
