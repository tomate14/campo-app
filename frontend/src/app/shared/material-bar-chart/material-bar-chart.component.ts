import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { buildApexTooltipHtml } from '../apex-tooltip/apex-tooltip.util';

export interface MaterialBarPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-material-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
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

  protected readonly validPoints = computed(() => this.points.filter((point) => Number.isFinite(Number(point.value))));
  protected readonly hasData = computed(() => this.validPoints().length > 0);

  protected readonly series = computed(() => [
    { name: this.seriesLabel, data: this.validPoints().map((point) => Number(point.value)) },
  ]);

  protected readonly chart = computed<any>(() => ({
    type: 'bar',
    height: 300,
    toolbar: { show: false },
    background: 'transparent',
    animations: { enabled: false },
    dropShadow: { enabled: true, top: 4, left: 0, blur: 6, color: this.color, opacity: 0.4 },
  }));

  protected readonly fill = computed<any>(() => ({
    type: 'gradient',
    gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.55, gradientToColors: [this.color], opacityFrom: 0.95, opacityTo: 0.55, stops: [0, 100] },
  }));

  protected readonly plotOptions: any = {
    bar: { borderRadius: 8, borderRadiusApplication: 'end', columnWidth: '52%' },
  };

  protected readonly dataLabels = { enabled: false };

  protected readonly xaxis = computed<any>(() => ({
    categories: this.validPoints().map((point) => point.label),
    labels: { style: { colors: '#8892AD', fontSize: '10px' }, rotate: -30, trim: true },
    axisBorder: { color: 'rgba(255,255,255,0.12)' },
    axisTicks: { color: 'rgba(255,255,255,0.12)' },
    title: { text: this.xAxisTitle, style: { color: '#8892AD', fontSize: '11px', fontWeight: 600 } },
  }));

  protected readonly yaxis = computed<any>(() => ({
    labels: { style: { colors: '#8892AD', fontSize: '10px' }, formatter: (value: number) => this.formatValue(value) },
    title: { text: this.yAxisTitle, style: { color: '#8892AD', fontSize: '11px', fontWeight: 600 } },
  }));

  protected readonly grid: any = { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 4, padding: { left: 8, right: 8 } };

  protected readonly annotations = computed<any>(() => {
    if (this.averageValue == null) return {};
    return {
      yaxis: [{
        y: this.averageValue,
        borderColor: 'rgba(255,255,255,0.4)',
        strokeDashArray: 6,
        label: {
          borderColor: 'transparent',
          style: { color: '#0B1730', background: '#9FE870', fontSize: '10px', fontWeight: 700, padding: { left: 8, right: 8, top: 2, bottom: 2 } },
          text: `${this.averageLabel}: ${this.formatValue(this.averageValue)}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}`,
        },
      }],
    };
  });

  protected readonly tooltip = computed<any>(() => ({
    enabled: true,
    custom: ({ dataPointIndex }: any) => {
      const point = this.validPoints()[dataPointIndex];
      if (!point) return '';
      const rows = [
        { label: 'Valor', value: `${this.formatValue(point.value)}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}` },
        { label: this.xAxisTitle, value: point.label },
      ];
      if (this.averageValue != null) {
        rows.push({ label: this.averageLabel, value: `${this.formatValue(this.averageValue)}${this.valueSuffix ? ` ${this.valueSuffix}` : ''}` });
      }
      return buildApexTooltipHtml({
        title: point.label,
        subtitle: this.seriesLabel,
        status: 'Activo',
        accent: this.color,
        rows,
        legends: [{ label: this.seriesLabel, color: this.color }],
      });
    },
  }));

  protected formatValue(value: number): string {
    if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString('es-AR');
    if (Math.abs(value) >= 100) return value.toFixed(0);
    if (Math.abs(value) >= 10) return value.toFixed(1);
    return value.toFixed(2).replace(/\.00$/, '');
  }
}
