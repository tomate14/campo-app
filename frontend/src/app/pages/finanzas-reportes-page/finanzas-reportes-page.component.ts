import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FinanzasService, type ReporteFinancieroPeriodo, type ReportesFinancierosDashboard } from '../../core/services/finanzas.service';

@Component({
  selector: 'app-finanzas-reportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './finanzas-reportes-page.component.html',
  styleUrl: './finanzas-reportes-page.component.css',
})
export class FinanzasReportesPageComponent implements OnInit {
  private readonly service = inject(FinanzasService);

  protected readonly dashboard = signal<ReportesFinancierosDashboard | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected fechaDesde = this.firstDayOfMonth();
  protected fechaHasta = this.today();
  protected topClientesLimit = 5;
  protected topProveedoresLimit = 5;

  protected readonly kpis = computed(() => this.dashboard()?.kpis ?? []);

  protected readonly lineChart = {
    type: 'line',
    height: 320,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 650 },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as const;

  protected readonly rankingBarChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    animations: { enabled: true, speed: 650 },
    states: {
      normal: { filter: { type: 'none' } },
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as any;

  protected readonly barChart = {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
    animations: { enabled: true, speed: 650 },
    states: {
      normal: { filter: { type: 'none' } },
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    foreColor: '#A6B0CF',
    background: 'transparent',
  } as any;

  protected readonly grid = { borderColor: 'rgba(255,255,255,.06)', strokeDashArray: 4, padding: { left: 8, right: 8 } } as const;
  protected readonly rankingGrid = { show: false } as const;
  protected readonly legend = { position: 'top', horizontalAlign: 'left', labels: { colors: '#A6B0CF' }, markers: { size: 6 }, itemMargin: { horizontal: 12 } } as any;
  protected readonly dataLabelsOff = { enabled: false } as const;
  protected readonly strokeLine = { curve: 'smooth', width: 3 } as const;
  protected readonly cashFlowStroke: any = { curve: 'smooth', width: [3, 3, 3], dashArray: [0, 0, 6] };
  protected readonly lineMarkers = { size: 0, hover: { size: 6 } } as const;
  protected readonly barPlotOptions = {
    bar: { horizontal: false, borderRadius: 6, columnWidth: '42%' },
  } as const;
  protected readonly rankingBarPlotOptions = {
    bar: { horizontal: true, borderRadius: 6, barHeight: '55%' },
  } as const;
  protected readonly barDataLabels = { enabled: false } as const;
  protected readonly shortCurrency = (value: number): string => `${Math.round(Number(value ?? 0) / 1000)}k`;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.reportesDashboard({
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      topClientesLimit: this.topClientesLimit,
      topProveedoresLimit: this.topProveedoresLimit,
    }).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el dashboard financiero.');
        this.loading.set(false);
      },
    });
  }

  protected ingresosEgresosSeries(data: ReporteFinancieroPeriodo[]): Array<{ name: string; data: number[] }> {
    return [
      { name: 'Ingresos', data: data.map((item) => Number(item.ingresos ?? 0)) },
      { name: 'Egresos', data: data.map((item) => Number(item.egresos ?? 0)) },
    ];
  }

  protected flujoSeries(data: ReporteFinancieroPeriodo[]): Array<{ name: string; data: number[] }> {
    return [
      { name: 'Ingresos', data: data.map((item) => Number(item.ingresos ?? 0)) },
      { name: 'Egresos', data: data.map((item) => Number(item.egresos ?? 0)) },
      { name: 'Flujo neto', data: data.map((item) => Number(item.neto ?? 0)) },
    ];
  }

  protected categories(data: ReporteFinancieroPeriodo[]): string[] {
    return data.map((item) => item.periodo);
  }

  protected rankingSeries(data: Array<{ total: number }>, name: string): Array<{ name: string; data: number[] }> {
    return [{ name, data: data.map((item) => Number(item.total ?? 0)) }];
  }

  protected rankingCategories(data: Array<{ nombre: string }>): string[] {
    return data.map((item) => item.nombre);
  }

  protected rankingWidth(data: Array<{ total: number }>, value: number | undefined): number {
    const max = Math.max(...data.map((item) => Number(item.total ?? 0)), 0);
    if (max <= 0) return 0;
    return Math.max(4, Math.min(100, (Number(value ?? 0) / max) * 100));
  }

  protected rankingXaxis(categories: string[]): any {
    return {
      categories,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    };
  }

  protected rankingYaxis(): any {
    return {
      labels: {
        style: { colors: '#A6B0CF', fontSize: '11px', fontFamily: 'Inter' },
        maxWidth: 150,
      },
    };
  }

  protected formatValue(value: number | undefined, format: string): string {
    if (format === 'currency') return this.currency(value);
    if (format === 'percent') return `${this.number(value, 1)}%`;
    return this.number(value);
  }

  protected currency(value: number | undefined): string {
    return this.usd(value);
  }

  protected usd(value: number | undefined): string {
    return `USD ${this.number(value)}`;
  }

  protected number(value: number | undefined, digits = 0): string {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(Number(value ?? 0));
  }

  protected formatDate(value: string | undefined): string {
    return value ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'Sin fecha';
  }

  protected lineTooltip(title: string, subtitle: string, suffix = 'USD'): any {
    return {
      enabled: true,
      shared: false,
      intersect: false,
      followCursor: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const safeSeriesIndex = seriesIndex ?? 0;
        const label = w.globals.categoryLabels?.[dataPointIndex] ?? w.globals.labels?.[dataPointIndex] ?? 'Sin periodo';
        const name = w.globals.seriesNames?.[safeSeriesIndex] ?? title;
        const value = series?.[safeSeriesIndex]?.[dataPointIndex] ?? 0;
        const color = w.globals.colors?.[safeSeriesIndex] ?? '#9FE870';
        return this.tooltipHtml({
          title,
          subtitle,
          status: name,
          accent: color,
          rows: [
            ['Valor', suffix === 'USD' ? this.currency(value) : `${this.number(value, 1)} ${suffix}`],
            ['Periodo', label],
            ['Serie', name],
          ],
          legends: [[name, color]],
        });
      },
    };
  }

  protected sharedFinancialTooltip(title: string, subtitle: string): any {
    return {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const label = w.globals.labels?.[dataPointIndex] ?? w.globals.categoryLabels?.[dataPointIndex] ?? 'Sin periodo';
        const rows = (w.globals.seriesNames ?? []).map((name: string, index: number) => [
          name,
          this.usd(series?.[index]?.[dataPointIndex] ?? 0),
        ]);
        const legends = (w.globals.seriesNames ?? []).map((name: string, index: number) => [
          name,
          w.globals.colors?.[index] ?? '#9FE870',
        ]);
        return this.tooltipHtml({
          title,
          subtitle,
          status: label,
          accent: w.globals.colors?.[seriesIndex ?? 0] ?? '#9FE870',
          rows,
          legends,
        });
      },
    };
  }

  protected barTooltip(title: string, subtitle: string): any {
    return {
      enabled: true,
      custom: ({ series, dataPointIndex, w }: any) => {
        const label = w.globals.labels?.[dataPointIndex] ?? w.globals.categoryLabels?.[dataPointIndex] ?? title;
        const value = series?.[0]?.[dataPointIndex] ?? 0;
        return this.tooltipHtml({
          title: label,
          subtitle,
          status: title,
          accent: '#9FE870',
          rows: [
            ['Total', this.currency(value)],
            ['Posicion', `#${dataPointIndex + 1}`],
            ['Serie', title],
          ],
          legends: [[title, '#9FE870']],
        });
      },
    };
  }

  protected rankingTooltip(title: string, accent: string): any {
    return {
      enabled: true,
      theme: 'dark',
      custom: ({ series, dataPointIndex, w }: any) => {
        const label = w.globals.labels?.[dataPointIndex] ?? w.globals.categoryLabels?.[dataPointIndex] ?? title;
        const value = series?.[0]?.[dataPointIndex] ?? 0;
        return this.tooltipHtml({
          title: label,
          subtitle: title,
          status: this.usd(value),
          accent,
          rows: [
            ['Total', this.usd(value)],
            ['Ranking', `#${dataPointIndex + 1}`],
          ],
          legends: [[title, accent]],
        });
      },
    };
  }

  protected trackByCode(_: number, item: { codigo?: string; titulo?: string }): string {
    return item.codigo ?? item.titulo ?? String(_);
  }

  protected toneClass(tone: string | undefined): string {
    return `tone-${tone ?? 'green'}`;
  }

  private tooltipHtml(config: { title: string; subtitle: string; status: string; accent: string; rows: string[][]; legends: string[][] }): string {
    const rows = config.rows.map(([label, value]) => `<div class="apex-tooltip-row"><span>${label}</span><strong>${value}</strong></div>`).join('');
    const legends = config.legends.map(([label, color]) => `<span><i style="background:${color}"></i>${label}</span>`).join('');
    return `
      <div class="apex-tooltip-card" style="--accent:${config.accent}">
        <div class="apex-tooltip-band"></div>
        <div class="apex-tooltip-head">
          <span class="apex-tooltip-icon">
            <svg viewBox="0 0 24 24"><path d="M4 19h16" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-4" /></svg>
          </span>
          <div><strong>${config.title}</strong><small>${config.subtitle}</small></div>
          <em>${config.status}</em>
        </div>
        <div class="apex-tooltip-rows">${rows}</div>
        <div class="apex-tooltip-footer">${legends}</div>
      </div>
    `;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private firstDayOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  }
}
