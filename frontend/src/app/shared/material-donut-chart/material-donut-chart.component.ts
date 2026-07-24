import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { buildApexTooltipHtml } from '../apex-tooltip/apex-tooltip.util';

export interface MaterialDonutItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-material-donut-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './material-donut-chart.component.html',
  styleUrl: './material-donut-chart.component.css',
})
export class MaterialDonutChartComponent {
  @Input() items: MaterialDonutItem[] = [];
  @Input() centerValue = '';
  @Input() centerLabel = '';

  protected readonly hasData = computed(() => this.items.length > 0);
  protected readonly series = computed(() => this.items.map((item) => item.value));
  protected readonly labels = computed(() => this.items.map((item) => item.label));
  protected readonly colors = computed(() => this.items.map((item) => item.color));

  protected readonly chart: any = {
    type: 'donut',
    height: 205,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: '#A6B0CF',
    animations: { enabled: false },
    dropShadow: { enabled: true, top: 0, left: 0, blur: 8, color: '#9FE870', opacity: 0.25 },
  };

  // Leyenda lateral al estilo "Distribucion del Rodeo": marcador de color por
  // serie con el porcentaje al lado del color correspondiente.
  protected readonly legend = computed<any>(() => ({
    show: true,
    position: 'right',
    horizontalAlign: 'center',
    fontSize: '12px',
    fontWeight: 600,
    labels: { colors: '#c8d6e9' },
    markers: { size: 7, offsetX: -3 },
    itemMargin: { horizontal: 6, vertical: 5 },
    formatter: (label: string, opts: any) => {
      const item = this.items[opts?.seriesIndex ?? -1];
      const pct = item ? item.percentage : 0;
      return `${label}   ${pct}%`;
    },
  }));

  protected readonly fill = computed<any>(() => ({
    type: 'gradient',
    gradient: { shade: 'dark', type: 'diagonal1', shadeIntensity: 0.5, gradientToColors: this.colors(), opacityFrom: 0.95, opacityTo: 0.72, stops: [0, 100] },
  }));

  protected readonly stroke: any = { show: true, width: 2, colors: ['#0B1730'] };

  protected readonly dataLabels = { enabled: false };

  protected readonly plotOptions = computed<any>(() => ({
    pie: {
      donut: {
        size: '66%',
        labels: {
          show: true,
          // El valor central grande (total) y su etiqueta debajo, al estilo
          // "Distribucion del Rodeo". name/value deben estar habilitados para
          // que el total se renderice cuando no hay hover.
          name: { show: true, color: '#8892AD', fontSize: '12px', fontWeight: 600, offsetY: 20 },
          value: { show: true, color: '#FFFFFF', fontSize: '26px', fontWeight: 800, offsetY: -16 },
          total: {
            show: true,
            showAlways: true,
            label: this.centerLabel || 'Total',
            color: '#8892AD',
            fontSize: '12px',
            fontWeight: 600,
            formatter: () => this.centerValue,
          },
        },
      },
    },
  }));

  protected readonly tooltip = computed<any>(() => ({
    enabled: true,
    custom: ({ seriesIndex }: any) => {
      const item = this.items[seriesIndex];
      if (!item) return '';
      return buildApexTooltipHtml({
        title: item.label,
        subtitle: 'Distribución',
        status: `${item.percentage}%`,
        accent: item.color,
        rows: [
          { label: 'Cantidad', value: `${item.value}` },
          { label: 'Participación', value: `${item.percentage}%` },
          { label: 'Total', value: `${this.centerValue} ${this.centerLabel}`.trim() },
        ],
        legends: [{ label: item.label, color: item.color }],
      });
    },
  }));
}
