import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ReporteSeriePunto } from '../../core/models/agricola.models';
import { buildApexTooltipHtml } from '../apex-tooltip/apex-tooltip.util';

@Component({
  selector: 'app-material-line-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './material-line-chart.component.html',
  styleUrl: './material-line-chart.component.css',
})
export class MaterialLineChartComponent {
  @Input() primary: ReporteSeriePunto[] = [];
  @Input() secondary: ReporteSeriePunto[] = [];
  @Input() primaryLabel = 'Actual';
  @Input() secondaryLabel = 'Histórico';
  @Input() valueSuffix = '';
  @Input() emptyText = 'Sin datos.';

  protected readonly hasData = computed(() => this.primary.length > 0 || this.secondary.length > 0);

  private readonly categories = computed(() => (this.primary.length ? this.primary : this.secondary).map((point) => point.etiqueta));

  protected readonly series = computed(() => {
    const result: { name: string; data: (number | null)[] }[] = [];
    if (this.primary.length) result.push({ name: this.primaryLabel, data: this.primary.map((point) => this.numOrNull(point.valor)) });
    if (this.secondary.length) result.push({ name: this.secondaryLabel, data: this.secondary.map((point) => this.numOrNull(point.valor)) });
    return result;
  });

  protected readonly colors = computed(() => (this.secondary.length ? ['#9FE870', '#7C93B8'] : ['#9FE870']));

  protected readonly chart = computed<any>(() => ({
    type: 'area',
    height: 260,
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    animations: { enabled: false },
    dropShadow: { enabled: true, top: 3, left: 0, blur: 6, color: this.colors()[0], opacity: 0.35 },
  }));

  protected readonly stroke = computed<any>(() => ({
    curve: 'smooth',
    width: this.secondary.length ? [3, 2] : [3],
    dashArray: this.secondary.length ? [0, 6] : [0],
  }));

  protected readonly fill = computed<any>(() => ({
    type: this.secondary.length ? ['gradient', 'solid'] : 'gradient',
    opacity: this.secondary.length ? [1, 0] : 1,
    gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.5, opacityFrom: 0.42, opacityTo: 0.03, stops: [0, 100] },
  }));

  protected readonly markers = computed<any>(() => ({
    size: 4,
    colors: ['#081225'],
    strokeColors: this.colors(),
    strokeWidth: 2,
    hover: { size: 6 },
  }));

  protected readonly xaxis = computed<any>(() => ({
    categories: this.categories(),
    labels: { style: { colors: '#8892AD', fontSize: '10px' }, rotate: -30, trim: true },
    axisBorder: { color: 'rgba(255,255,255,0.12)' },
    axisTicks: { color: 'rgba(255,255,255,0.12)' },
  }));

  protected readonly yaxis = computed<any>(() => ({
    labels: { style: { colors: '#8892AD', fontSize: '10px' }, formatter: (value: number) => this.formatValue(value) },
  }));

  protected readonly grid: any = { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 4, padding: { left: 8, right: 8 } };

  protected readonly tooltip = computed<any>(() => ({
    enabled: true,
    shared: false,
    intersect: false,
    followCursor: true,
    custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
      const safeIndex = seriesIndex ?? 0;
      const label = w.globals.categoryLabels?.[dataPointIndex] ?? this.categories()[dataPointIndex] ?? 'Sin período';
      const name = w.globals.seriesNames?.[safeIndex] ?? this.primaryLabel;
      const value = series?.[safeIndex]?.[dataPointIndex];
      const color = w.globals.colors?.[safeIndex] ?? this.colors()[0];
      const rows = [
        { label: 'Valor', value: value == null ? 'Sin dato' : `${this.formatValue(Number(value))}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}` },
        { label: 'Período', value: label },
      ];
      if (this.secondary.length) {
        const otherIndex = safeIndex === 0 ? 1 : 0;
        const otherName = w.globals.seriesNames?.[otherIndex];
        const otherValue = series?.[otherIndex]?.[dataPointIndex];
        if (otherName != null && otherValue != null) {
          rows.push({ label: otherName, value: `${this.formatValue(Number(otherValue))}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}` });
        }
      }
      return buildApexTooltipHtml({
        title: name,
        subtitle: label,
        status: name,
        accent: color,
        rows,
        legends: [{ label: name, color }],
      });
    },
  }));

  protected formatValue(value: number): string {
    if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString('es-AR');
    if (Math.abs(value) >= 10) return value.toFixed(1);
    return value.toFixed(2).replace(/\.00$/, '');
  }

  private numOrNull(value: number | string | undefined): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
