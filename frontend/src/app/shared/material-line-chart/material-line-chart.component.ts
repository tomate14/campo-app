import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import type { ReporteSeriePunto } from '../../core/models/agricola.models';
import { PremiumChartTooltipComponent, type PremiumTooltipIcon, type PremiumTooltipMetric } from '../premium-chart-tooltip/premium-chart-tooltip.component';

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
  series: string;
}

@Component({
  selector: 'app-material-line-chart',
  standalone: true,
  imports: [CommonModule, PremiumChartTooltipComponent],
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
  @Input() tooltipTitle = 'MAÍZ';
  @Input() tooltipSubtitle = 'Dashboard agrícola';
  @Input() tooltipIcon: PremiumTooltipIcon = 'crop';
  @Input() tooltipAccentColor = '#F4C542';
  @Input() tooltipStatus = 'Activo';

  protected readonly width = 640;
  protected readonly chartHeight = 250;
  protected readonly margin = { top: 18, right: 20, bottom: 42, left: 58 };
  protected readonly activePoint = signal<ChartPoint | null>(null);

  protected readonly hasData = computed(() => this.primary.length > 0 || this.secondary.length > 0);
  protected readonly labels = computed(() => (this.primary.length ? this.primary : this.secondary).map((point) => point.etiqueta));
  protected readonly yTicks = computed(() => {
    const [min, max] = this.range();
    const step = (max - min) / 4;
    return Array.from({ length: 5 }, (_, index) => {
      const value = max - step * index;
      return { value, y: this.y(value), label: this.formatValue(value) };
    });
  });
  protected readonly xTicks = computed(() => {
    const labels = this.labels();
    const step = labels.length <= 6 ? 1 : Math.ceil(labels.length / 6);
    return labels.map((label, index) => ({ label, x: this.x(index), visible: index === labels.length - 1 || index % step === 0 }));
  });

  protected path(series: ReporteSeriePunto[]): string {
    return this.points(series).map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  }

  protected areaPath(series: ReporteSeriePunto[]): string {
    const points = this.points(series);
    if (!points.length) return '';
    const bottom = this.chartHeight - this.margin.bottom;
    return `${points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')} L ${points.at(-1)!.x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }

  protected points(series: ReporteSeriePunto[], label = this.primaryLabel): ChartPoint[] {
    return series
      .map((point, index) => ({ point, index }))
      .filter(({ point }) => Number.isFinite(Number(point.valor)))
      .map(({ point, index }) => ({ x: this.x(index), y: this.y(Number(point.valor)), label: point.etiqueta, value: Number(point.valor), series: label }));
  }

  protected showTooltip(point: ChartPoint): void { this.activePoint.set(point); }
  protected hideTooltip(): void { this.activePoint.set(null); }

  protected tooltipMetrics(point: ChartPoint): PremiumTooltipMetric[] {
    return [
      { icon: 'yield', label: point.series, value: `${this.formatValue(point.value)}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}` },
      { icon: 'calendar', label: 'Período', value: point.label },
      { icon: 'series', label: 'Serie', value: this.primaryLabel },
      { icon: 'stage', label: 'Referencia', value: this.secondary.length ? this.secondaryLabel : 'Sin histórico' },
      { icon: 'trend', label: 'Variación vs histórico', value: this.variation(point), accent: true },
    ];
  }

  protected formatValue(value: number): string {
    if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString('es-AR');
    if (Math.abs(value) >= 10) return value.toFixed(1);
    return value.toFixed(2).replace(/\.00$/, '');
  }

  private variation(point: ChartPoint): string {
    const index = this.labels().indexOf(point.label);
    const reference = this.secondary[index]?.valor;
    if (!reference || Number(reference) === 0) return 'Sin dato';
    const diff = ((point.value - Number(reference)) / Number(reference)) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  }

  private x(index: number): number {
    const count = Math.max(this.labels().length - 1, 1);
    const plotWidth = this.width - this.margin.left - this.margin.right;
    return this.margin.left + (index / count) * plotWidth;
  }

  private y(value: number): number {
    const [min, max] = this.range();
    const plotHeight = this.chartHeight - this.margin.top - this.margin.bottom;
    return this.margin.top + ((max - value) / Math.max(max - min, 1)) * plotHeight;
  }

  private range(): [number, number] {
    const values = [...this.primary, ...this.secondary].map((point) => Number(point.valor)).filter((value) => Number.isFinite(value));
    if (!values.length) return [0, 1];
    const min = Math.min(0, ...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.12, 1);
    return [min, max + padding];
  }
}
