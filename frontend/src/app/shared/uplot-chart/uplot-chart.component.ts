import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import uPlot from 'uplot';

export type UplotChartType = 'bar' | 'line';

@Component({
  selector: 'app-uplot-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uplot-chart.component.html',
  styleUrl: './uplot-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UplotChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() height = 280;
  @Input() color = '#9FE870';
  @Input() type: UplotChartType = 'bar';
  @Input() averageValue?: number;
  @Input() averageColor = '#F59E0B';
  @Input() seriesLabel = 'Valor';
  @Input() averageLabel = 'Promedio';
  @Input() tooltipIcon = '●';
  @Input() tooltipReferenceLabel = 'Referencia';
  @Input() valueSuffix = '';
  @Input() xAxisTitle = 'Referencia';
  @Input() yAxisTitle = 'Valor';

  @ViewChild('chartHost', { static: true }) private readonly chartHost?: ElementRef<HTMLDivElement>;
  @ViewChild('tooltipRef', { static: true }) private readonly tooltipRef?: ElementRef<HTMLDivElement>;

  private chart?: uPlot;
  private resizeObserver?: ResizeObserver;
  private viewReady = false;
  private readonly cdr = inject(ChangeDetectorRef);

  protected tooltipVisible = false;
  protected tooltipX = 16;
  protected tooltipY = 16;
  protected tooltipLabel = '';
  protected tooltipValue = '';

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
    this.resizeObserver = new ResizeObserver(() => this.renderChart());
    if (this.chartHost?.nativeElement) {
      this.resizeObserver.observe(this.chartHost.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady) {
      return;
    }

    if (changes['labels'] || changes['values'] || changes['height'] || changes['color'] || changes['type']) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.destroy();
  }

  protected get hasData(): boolean {
    return this.labels.length > 0 && this.values.length > 0;
  }

  protected get showAverage(): boolean {
    return this.averageValue != null;
  }

  private renderChart(): void {
    const host = this.chartHost?.nativeElement;
    if (!host) {
      return;
    }

    this.chart?.destroy();
    host.innerHTML = '';

    if (!this.hasData) {
      return;
    }

    const width = Math.max(host.clientWidth || 320, 320);
    const labelStep = this.resolveLabelStep(width, this.labels.length);
    const xValues = this.labels.map((_, index) => index);
    const averageSeries = this.averageValue != null ? xValues.map(() => this.averageValue as number) : [];
    const chartData: uPlot.AlignedData = this.averageValue != null
      ? [xValues, this.values, averageSeries]
      : [xValues, this.values];
    const minValue = Math.min(...this.values);
    const maxValue = Math.max(...this.values);
    const referenceMin = this.averageValue != null ? Math.min(minValue, this.averageValue) : minValue;
    const referenceMax = this.averageValue != null ? Math.max(maxValue, this.averageValue) : maxValue;
    const padding = Math.max(Math.abs(referenceMax - referenceMin) * 0.18, 10);
    const yMin = Math.min(0, referenceMin - padding);
    const yMax = referenceMax + padding;

    this.chart = new uPlot(
      {
        width,
        height: this.height,
        padding: [18, 18, 12, 14],
        legend: { show: false },
        cursor: { drag: { x: false, y: false }, focus: { prox: 16 } },
        hooks: {
          setCursor: [
            (u) => this.updateTooltip(u),
          ],
          setSeries: [],
        },
        scales: {
          x: { time: false, auto: false, range: [-0.5, Math.max(this.labels.length - 0.5, 0.5)] },
          y: { auto: false, range: [yMin, yMax] },
        },
        axes: [
          {
            stroke: 'rgba(148, 163, 184, 0.34)',
            grid: { show: false },
            ticks: { stroke: 'rgba(148, 163, 184, 0.18)', size: 6 },
            splits: () => xValues,
            values: (_u, splits) =>
              splits.map((value) => {
                const index = Number(value);
                if (!Number.isInteger(index)) {
                  return '';
                }
                if (index !== this.labels.length - 1 && index % labelStep !== 0) {
                  return '';
                }
                return this.formatXAxisLabel(this.labels[index] ?? '');
              }),
            size: 62,
            gap: 10,
            font: '600 12px Inter, sans-serif',
            labelGap: 10,
          },
          {
            stroke: 'rgba(148, 163, 184, 0.34)',
            grid: { stroke: 'rgba(148, 163, 184, 0.12)', width: 1 },
            ticks: { stroke: 'rgba(148, 163, 184, 0.22)', size: 6 },
            size: 64,
            gap: 10,
            font: '600 12px Inter, sans-serif',
            values: (_u, splits) => splits.map((value) => this.formatAxisValue(Number(value))),
          },
        ],
        series: [
          {},
          this.type === 'bar'
            ? {
                stroke: this.color,
                width: 1,
                fill: this.withOpacity(this.color, 0.52),
                paths: uPlot.paths.bars?.({
                  size: [0.64, 88],
                  radius: [2, 0],
                  gap: 10,
                }),
              }
            : {
                stroke: this.color,
                width: 2,
                points: {
                  show: true,
                  size: 6,
                  width: 2,
                  stroke: this.color,
                  fill: '#0B1730',
                },
                fill: `${this.color}10`,
              },
          ...(this.averageValue != null
            ? [{
                stroke: this.averageColor,
                width: 2,
                paths: uPlot.paths.linear?.(),
                points: { show: false },
              }]
            : []),
        ],
      },
      chartData,
      host,
    );

    this.chart.over.addEventListener('mouseleave', () => this.hideTooltip());
  }

  private updateTooltip(chart: uPlot) {
    const idx = chart.cursor.idx;
    const host = this.chartHost?.nativeElement;
    if (idx == null || idx < 0 || !host || idx >= this.values.length) {
      this.hideTooltip();
      return;
    }

    const value = this.values[idx];
    const label = this.labels[idx] ?? '';
    this.tooltipLabel = label;
    this.tooltipValue = `${this.formatValue(value)}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}`;
    this.tooltipVisible = true;

    const rawX = (chart.cursor.left ?? 0) + 24;
    const rawY = Math.max((chart.cursor.top ?? 0) - 18, 12);
    const maxX = Math.max(host.clientWidth - 240, 12);
    this.tooltipX = Math.min(rawX, maxX);
    this.tooltipY = rawY;
    this.cdr.markForCheck();
  }

  private hideTooltip() {
    if (!this.tooltipVisible) {
      return;
    }
    this.tooltipVisible = false;
    this.cdr.markForCheck();
  }

  private formatValue(value: number): string {
    if (Math.abs(value) >= 1000) {
      return `${Math.round(value).toLocaleString('es-AR')}`;
    }
    if (Math.abs(value) >= 100) {
      return value.toFixed(0);
    }
    return value.toFixed(1);
  }

  private formatAxisValue(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    if (abs >= 100) {
      return value.toFixed(0);
    }
    if (abs >= 10) {
      return value.toFixed(1);
    }
    return value.toFixed(0);
  }

  private formatXAxisLabel(label: string): string {
    const normalized = label.trim();
    if (normalized.length <= 12) {
      return normalized;
    }
    return `${normalized.slice(0, 10)}…`;
  }

  private resolveLabelStep(width: number, labelsCount: number): number {
    if (labelsCount <= 4) {
      return 1;
    }
    const maxVisible = width < 560 ? 4 : width < 760 ? 6 : 8;
    return Math.max(1, Math.ceil(labelsCount / maxVisible));
  }

  private withOpacity(hex: string, opacity: number): string {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) {
      return hex;
    }

    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }
}
