import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { PremiumChartTooltipComponent, type PremiumTooltipMetric } from '../premium-chart-tooltip/premium-chart-tooltip.component';

export interface MaterialBarPoint {
  label: string;
  value: number;
}

interface BarRenderPoint extends MaterialBarPoint {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-material-bar-chart',
  standalone: true,
  imports: [CommonModule, PremiumChartTooltipComponent],
  templateUrl: './material-bar-chart.component.html',
  styleUrl: './material-bar-chart.component.css',
})
export class MaterialBarChartComponent {
  @Input() points: MaterialBarPoint[] = [];
  @Input() averageValue?: number;
  @Input() color = '#9FE870';
  @Input() seriesLabel = 'Valor';
  @Input() averageLabel = 'Promedio';
  @Input() valueSuffix = '';
  @Input() xAxisTitle = 'Referencia';
  @Input() yAxisTitle = 'Valor';
  @Input() emptyText = 'Sin datos para graficar.';
  protected readonly activeBar = signal<BarRenderPoint | null>(null);

  protected readonly width = 640;
  protected readonly height = 300;
  protected readonly margin = { top: 26, right: 20, bottom: 58, left: 64 };

  protected readonly validPoints = computed(() => this.points.filter((point) => Number.isFinite(Number(point.value))));
  protected readonly hasData = computed(() => this.validPoints().length > 0);
  protected readonly maxValue = computed(() => Math.max(...this.validPoints().map((point) => Number(point.value)), this.averageValue ?? 0, 1));

  protected readonly yTicks = computed(() => {
    const max = this.maxValue() * 1.12;
    return Array.from({ length: 5 }, (_, index) => {
      const value = max - (max / 4) * index;
      return { value, y: this.y(value), label: this.formatValue(value) };
    });
  });

  protected readonly bars = computed<BarRenderPoint[]>(() => {
    const points = this.validPoints();
    const plotWidth = this.width - this.margin.left - this.margin.right;
    const gap = Math.max(12, plotWidth / Math.max(points.length, 1) * 0.34);
    const slot = plotWidth / Math.max(points.length, 1);
    const barWidth = Math.max(18, slot - gap);
    return points.map((point, index) => {
      const value = Number(point.value);
      const x = this.margin.left + index * slot + (slot - barWidth) / 2;
      const y = this.y(value);
      const baseline = this.height - this.margin.bottom;
      return { ...point, x, y, width: barWidth, height: baseline - y };
    });
  });

  protected showTooltip(bar: BarRenderPoint): void { this.activeBar.set(bar); }
  protected hideTooltip(): void { this.activeBar.set(null); }

  protected tooltipMetrics(bar: BarRenderPoint): PremiumTooltipMetric[] {
    return [
      { icon: 'yield', label: this.seriesLabel, value: `${this.formatValue(bar.value)}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}` },
      { icon: 'crop', label: this.xAxisTitle, value: bar.label },
      { icon: 'series', label: this.yAxisTitle, value: this.formatValue(bar.value) },
      { icon: 'trend', label: this.averageLabel, value: this.averageValue == null ? 'Sin dato' : this.formatValue(this.averageValue), accent: true },
    ];
  }

  protected averageY(): number {
    return this.averageValue == null ? 0 : this.y(this.averageValue);
  }

  protected formatLabel(label: string): string {
    return label.length > 12 ? `${label.slice(0, 10)}...` : label;
  }

  protected formatValue(value: number): string {
    if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString('es-AR');
    if (Math.abs(value) >= 100) return value.toFixed(0);
    if (Math.abs(value) >= 10) return value.toFixed(1);
    return value.toFixed(2).replace(/\.00$/, '');
  }

  private y(value: number): number {
    const plotHeight = this.height - this.margin.top - this.margin.bottom;
    return this.margin.top + (1 - value / (this.maxValue() * 1.12)) * plotHeight;
  }
}
