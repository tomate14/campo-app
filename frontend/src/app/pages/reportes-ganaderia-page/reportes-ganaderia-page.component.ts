import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import type {
  GanaderoBarraCategoria,
  GanaderoDashboard,
  GanaderoDiagnosticoSeveridad,
  GanaderoDistribucionRodeo,
  GanaderoSerieCategoria,
  GanaderoSeriePunto,
} from '../../core/models/ganaderia.models';

@Component({
  selector: 'app-reportes-ganaderia-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './reportes-ganaderia-page.component.html',
  styleUrl: './reportes-ganaderia-page.component.css',
})
export class ReportesGanaderiaPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);

  readonly dashboard = signal<GanaderoDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly kpis = computed(() => this.dashboard()?.kpis ?? []);

  readonly lineChart = {
    type: 'line',
    height: 250,
    toolbar: { show: false },
    zoom: { enabled: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly areaChart = {
    type: 'area',
    height: 220,
    toolbar: { show: false },
    zoom: { enabled: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly donutChart = {
    type: 'donut',
    height: 270,
    toolbar: { show: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly compactDonutChart = {
    type: 'donut',
    height: 205,
    toolbar: { show: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly barChart = {
    type: 'bar',
    height: 280,
    toolbar: { show: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly horizontalBarChart = {
    type: 'bar',
    height: 205,
    toolbar: { show: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly gaugeChart = {
    type: 'radialBar',
    height: 270,
    toolbar: { show: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly compactGaugeChart = {
    type: 'radialBar',
    height: 185,
    toolbar: { show: false },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  readonly strokeLine = { curve: 'smooth', width: 3 } as const;
  readonly grid = { borderColor: 'rgba(255,255,255,.08)', strokeDashArray: 4, padding: { left: 8, right: 8 } } as const;
  readonly legend = { labels: { colors: '#A6B0CF' }, markers: { size: 6 }, itemMargin: { horizontal: 12 } } as const;
  readonly compactLegend: any = {
    position: 'right',
    horizontalAlign: 'center',
    fontSize: '11px',
    labels: { colors: '#A6B0CF' },
    markers: { size: 5 },
    itemMargin: { horizontal: 8, vertical: 2 },
  };
  readonly dataLabelsOff = { enabled: false } as const;
  readonly donutPlotOptions = {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          name: { color: '#A6B0CF' },
          value: { color: '#FFFFFF', fontSize: '24px', fontWeight: 800 },
          total: { show: true, label: 'Total', color: '#A6B0CF' },
        },
      },
    },
  } as const;
  readonly livestockDonutPlotOptions = {
    pie: {
      donut: {
        size: '66%',
        labels: {
          show: true,
          name: { color: '#A6B0CF', fontSize: '11px' },
          value: { color: '#FFFFFF', fontSize: '20px', fontWeight: 800 },
          total: { show: true, label: 'Animales', color: '#A6B0CF' },
        },
      },
    },
  } as const;
  readonly barPlotOptions = {
    bar: {
      horizontal: false,
      borderRadius: 8,
      columnWidth: '44%',
      dataLabels: { position: 'top' },
    },
  } as const;
  readonly horizontalBarPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '48%',
      distributed: false,
      dataLabels: { position: 'right' },
    },
  } as const;
  readonly reproductiveBarPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 3,
      barHeight: '42%',
      distributed: true,
      dataLabels: { position: 'right' },
    },
  } as const;
  readonly barDataLabels: any = {
    enabled: true,
    offsetY: -18,
    style: { colors: ['#FFFFFF'], fontWeight: 700 },
  };
  readonly horizontalBarDataLabels: any = {
    enabled: true,
    offsetX: 6,
    style: { colors: ['#A6B0CF'], fontSize: '10px', fontWeight: 600 },
    formatter: (value: number) => Math.round(value).toLocaleString('es-AR'),
  };
  readonly reproductiveBarDataLabels: any = {
    enabled: true,
    offsetX: 6,
    style: { colors: ['#FFFFFF'], fontSize: '10px', fontWeight: 700 },
    formatter: (value: number, opts: any) => {
      const total = opts?.w?.config?.series?.[0]?.data?.reduce((sum: number, item: number) => sum + Number(item ?? 0), 0) ?? 0;
      const pct = total > 0 ? Math.round((Number(value ?? 0) / total) * 100) : 0;
      return `${Math.round(value).toLocaleString('es-AR')}   ${pct}%`;
    },
  };
  readonly areaDataLabels: any = {
    enabled: true,
    offsetY: -8,
    style: { colors: ['#FFFFFF'], fontSize: '10px', fontWeight: 700 },
    background: { enabled: false },
  };
  readonly areaFill: any = {
    type: 'gradient',
    gradient: { shade: 'dark', type: 'vertical', opacityFrom: 0.42, opacityTo: 0.04, stops: [0, 100] },
  };
  readonly livestockBarGrid = {
    borderColor: 'rgba(255,255,255,.06)',
    strokeDashArray: 0,
    padding: { left: 10, right: 6, top: -8, bottom: -8 },
  } as const;
  readonly compactGrid = {
    borderColor: 'rgba(255,255,255,.06)',
    strokeDashArray: 0,
    padding: { left: 0, right: 6, top: -8, bottom: -8 },
  } as const;
  readonly gaugePlotOptions = {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: { size: '64%', background: '#081225' },
      track: { background: 'rgba(255,255,255,.08)', strokeWidth: '96%' },
      dataLabels: {
        name: { color: '#A6B0CF', fontSize: '13px' },
        value: { color: '#FFFFFF', fontSize: '32px', fontWeight: 800, formatter: (value: number) => `${Math.round(value)}%` },
      },
    },
  } as const;
  readonly fillGradient: any = {
    type: 'gradient',
    gradient: { shade: 'dark', type: 'vertical', opacityFrom: 0.85, opacityTo: 0.35, stops: [0, 100] },
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ganaderiaService.getGanaderoDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el dashboard ganadero.');
        this.loading.set(false);
      },
    });
  }

  lineSeries(points: GanaderoSeriePunto[], name: string): Array<{ name: string; data: number[] }> {
    return [{ name, data: points.map((point) => Number(point.valor ?? 0)) }];
  }

  multiLineSeries(series: GanaderoSerieCategoria[]): Array<{ name: string; data: number[] }> {
    return series.map((item) => ({ name: item.categoria, data: item.puntos.map((point) => Number(point.valor ?? 0)) }));
  }

  categories(points: GanaderoSeriePunto[]): string[] {
    return points.map((point) => point.etiqueta);
  }

  categoriesFromSeries(series: GanaderoSerieCategoria[]): string[] {
    return series[0]?.puntos.map((point) => point.etiqueta) ?? [];
  }

  donutSeries(items: Array<{ cantidad: number }>): number[] {
    return items.map((item) => Number(item.cantidad ?? 0));
  }

  donutLabels(items: Array<{ categoria?: string; severidad?: string }>): string[] {
    return items.map((item) => item.categoria ?? this.titleCase(item.severidad ?? 'Sin dato'));
  }

  chartColors(items?: Array<{ color?: string }>): string[] {
    return items?.map((item, index) => item.color ?? this.serieColor(index)) ?? this.palette();
  }

  barSeries(items: GanaderoBarraCategoria[]): Array<{ name: string; data: number[] }> {
    return [{ name: 'Animales', data: items.map((item) => Number(item.valor ?? 0)) }];
  }

  barCategories(items: GanaderoBarraCategoria[]): string[] {
    return items.map((item) => item.etiqueta);
  }

  reproductiveSeries(data: GanaderoDashboard): Array<{ name: string; data: number[] }> {
    return [{
      name: 'Estado reproductivo',
      data: [
        data.estadoReproductivo.prenadas,
        data.estadoReproductivo.vacias,
        data.estadoReproductivo.enControl,
        data.estadoReproductivo.proximasAParir,
        data.estadoReproductivo.torosActivos,
      ],
    }];
  }

  reproductiveHorizontalSeries(data: GanaderoDashboard): Array<{ name: string; data: number[] }> {
    return [{
      name: 'Animales',
      data: [
        data.estadoReproductivo.prenadas,
        data.estadoReproductivo.vacias,
        data.estadoReproductivo.enControl,
        data.estadoReproductivo.proximasAParir,
        data.estadoReproductivo.torosActivos,
      ],
    }];
  }

  reproductiveCategories(): string[] {
    return ['Preñadas', 'Vacías', 'En control', 'Próx. parto', 'Toros'];
  }

  reproductiveColors(): string[] {
    return ['#69C94F', '#FFB84D', '#6EA8FF', '#9A7DFF', '#4CD8C4'];
  }

  reproductiveItems(data: GanaderoDashboard): Array<{ label: string; value: number; percent: number; width: string; color: string }> {
    const labels = this.reproductiveCategories();
    const values = [
      data.estadoReproductivo.prenadas,
      data.estadoReproductivo.vacias,
      data.estadoReproductivo.enControl,
      data.estadoReproductivo.proximasAParir,
      data.estadoReproductivo.torosActivos,
    ];
    const colors = this.reproductiveColors();
    const total = values.reduce((sum, value) => sum + Number(value ?? 0), 0);
    const max = Math.max(...values, 1);
    return values.map((value, index) => ({
      label: labels[index],
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
      width: `${Math.max(value > 0 ? 6 : 0, Math.round((value / max) * 100))}%`,
      color: colors[index],
    }));
  }

  genealogyGapItems(data: GanaderoDashboard): Array<{ label: string; value: number; color: string }> {
    return [
      { label: 'Sin madre', value: data.genealogiaTrazabilidad.sinMadre, color: '#FFB84D' },
      { label: 'Sin padre', value: data.genealogiaTrazabilidad.sinPadre, color: '#FFB84D' },
      { label: 'Sin raza', value: data.genealogiaTrazabilidad.sinRaza, color: '#6EA8FF' },
      { label: 'Sin fecha nacimiento', value: data.genealogiaTrazabilidad.sinFechaNacimiento, color: '#6EA8FF' },
      { label: 'Sin trazabilidad completa', value: data.genealogiaTrazabilidad.sinTrazabilidad, color: '#FF6B6B' },
    ];
  }

  gaugeSeries(value: number | undefined): number[] {
    return [Math.max(0, Math.min(100, Number(value ?? 0)))];
  }

  donutTooltip(title: string, subtitle: string, items: Array<GanaderoDistribucionRodeo | GanaderoDiagnosticoSeveridad>): any {
    return {
      enabled: true,
      custom: ({ seriesIndex, w }: any) => {
        const item = items[seriesIndex] as any;
        const label = item?.categoria ?? this.titleCase(item?.severidad ?? w.globals.labels?.[seriesIndex] ?? title);
        const value = item?.cantidad ?? w.globals.series?.[seriesIndex] ?? 0;
        const pct = item?.porcentaje ?? 0;
        const color = item?.color ?? this.serieColor(seriesIndex);
        return this.tooltipHtml({
          title: label,
          subtitle,
          status: `${pct}%`,
          accent: color,
          rows: [
            ['Cantidad', `${value}`],
            ['Participación', `${pct}%`],
            ['Serie', title],
          ],
          legends: [[label, color]],
        });
      },
    };
  }

  lineTooltip(title: string, subtitle: string, suffix: string, showStatus = true): any {
    return {
      enabled: true,
      shared: false,
      intersect: false,
      followCursor: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const safeSeriesIndex = seriesIndex ?? 0;
        const label = w.globals.categoryLabels?.[dataPointIndex] ?? w.globals.labels?.[dataPointIndex] ?? 'Sin período';
        const name = w.globals.seriesNames?.[safeSeriesIndex] ?? title;
        const value = series?.[safeSeriesIndex]?.[dataPointIndex] ?? 0;
        const color = w.globals.colors?.[safeSeriesIndex] ?? '#9FE870';
        return this.tooltipHtml({
          title,
          subtitle,
          status: name,
          showStatus,
          accent: color,
          rows: [
            ['Valor', `${this.formatNumber(value, 1)} ${suffix}`.trim()],
            ['Período', label],
            ['Serie', name],
          ],
          legends: [[name, color]],
        });
      },
    };
  }

  barTooltip(title: string, subtitle: string, suffix: string, showStatus = true): any {
    return {
      enabled: true,
      custom: ({ series, dataPointIndex, w }: any) => {
        const label = w.globals.labels?.[dataPointIndex] ?? w.globals.categoryLabels?.[dataPointIndex] ?? title;
        const value = series?.[0]?.[dataPointIndex] ?? 0;
        return this.tooltipHtml({
          title: label,
          subtitle,
          status: title,
          showStatus,
          accent: '#9FE870',
          rows: [
            ['Valor', `${this.formatNumber(value)} ${suffix}`.trim()],
            ['Categoría', label],
            ['Serie', title],
          ],
          legends: [[title, '#9FE870']],
        });
      },
    };
  }

  gaugeTooltip(title: string, subtitle: string): any {
    return {
      enabled: true,
      custom: ({ series }: any) => this.tooltipHtml({
        title,
        subtitle,
        status: 'Activo',
        accent: '#9FE870',
        rows: [
          ['Completitud', `${Math.round(series?.[0] ?? 0)}%`],
          ['Indicador', title],
        ],
        legends: [[title, '#9FE870']],
      }),
    };
  }

  progressWidth(value: number | undefined): string {
    return `${Math.max(0, Math.min(100, Number(value ?? 0)))}%`;
  }

  sanitaryWidth(value: number | undefined, type: 'vencidas' | 'proximas' | 'programadas'): string {
    const maxByType = { vencidas: 18, proximas: 30, programadas: 45 };
    const pct = (Number(value ?? 0) / maxByType[type]) * 100;
    return `${Math.max(8, Math.min(100, pct))}%`;
  }

  progressTone(value: number | undefined): string {
    const pct = Number(value ?? 0);
    if (pct >= 100) return 'danger';
    if (pct >= 85) return 'orange';
    if (pct >= 60) return 'warning';
    return 'green';
  }

  formatNumber(value: number | undefined, digits = 0): string {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(Number(value ?? 0));
  }

  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value ?? 0));
  }

  formatDateTime(value: string | undefined): string {
    if (!value) {
      return 'Sin fecha';
    }
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }

  serieColor(index: number): string {
    return this.palette()[index % this.palette().length];
  }

  totalSerie(serie: GanaderoSerieCategoria): number {
    return Number(serie.total ?? serie.puntos.reduce((sum, point) => sum + Number(point.valor ?? 0), 0));
  }

  trackByCode(_: number, item: { codigo?: string; titulo?: string }): string {
    return item.codigo ?? item.titulo ?? String(_);
  }

  private palette(): string[] {
    return ['#9FE870', '#6EA8FF', '#9A7DFF', '#FFB84D', '#4CD8C4', '#FF6B6B'];
  }

  private titleCase(value: string): string {
    return value.toLowerCase().replace(/(^|\s|_)\S/g, (match) => match.toUpperCase()).replaceAll('_', ' ');
  }

  private tooltipHtml(config: { title: string; subtitle: string; status: string; showStatus?: boolean; accent: string; rows: string[][]; legends: string[][] }): string {
    const rows = config.rows.map(([label, value]) => `<div class="apex-tooltip-row"><span>${label}</span><strong>${value}</strong></div>`).join('');
    const legends = config.legends.map(([label, color]) => `<span><i style="background:${color}"></i>${label}</span>`).join('');
    const status = config.showStatus === false ? '' : `<em>${config.status}</em>`;
    return `
      <div class="apex-tooltip-card" style="--accent:${config.accent}">
        <div class="apex-tooltip-band"></div>
        <div class="apex-tooltip-head">
          <span class="apex-tooltip-icon">
            <svg viewBox="0 0 24 24"><path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M10 15v4h4v-4" /></svg>
          </span>
          <div><strong>${config.title}</strong><small>${config.subtitle}</small></div>
          ${status}
        </div>
        <div class="apex-tooltip-rows">${rows}</div>
        <div class="apex-tooltip-footer">${legends}</div>
      </div>
    `;
  }
}
