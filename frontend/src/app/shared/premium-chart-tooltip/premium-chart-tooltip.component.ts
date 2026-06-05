import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type PremiumTooltipIcon = 'crop' | 'yield' | 'stage' | 'area' | 'water' | 'trend' | 'calendar' | 'series' | 'default';

export interface PremiumTooltipMetric {
  icon: PremiumTooltipIcon;
  label: string;
  value: string;
  accent?: boolean;
}

@Component({
  selector: 'app-premium-chart-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-chart-tooltip.component.html',
  styleUrl: './premium-chart-tooltip.component.css',
})
export class PremiumChartTooltipComponent {
  @Input() accentColor = '#9FE870';
  @Input() icon: PremiumTooltipIcon = 'crop';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() status = 'Activo';
  @Input() metrics: PremiumTooltipMetric[] = [];
  @Input() primaryLegend = 'Campaña actual';
  @Input() secondaryLegend = 'Promedio histórico';

  protected iconPath(icon: PremiumTooltipIcon): string {
    const icons: Record<PremiumTooltipIcon, string> = {
      crop: 'M12 20V8 M12 8c-4 0-7 2-8 6 4 0 7-2 8-6Z M12 8c4 0 7 2 8 6-4 0-7-2-8-6Z',
      yield: 'M5 19V9 M10 19V5 M15 19v-8 M20 19V7',
      stage: 'M12 20V9 M12 9c-3 0-5 1.5-6 4 3 0 5-1.5 6-4Z M12 9c3 0 5 1.5 6 4-3 0-5-1.5-6-4Z',
      area: 'M4 17c3-5 13-5 16 0 M7 17c1-3 9-3 10 0 M12 6v9 M8 10h8',
      water: 'M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z M9 15a3 3 0 0 0 5 2',
      trend: 'M4 18h16 M7 15l4-4 3 3 5-8 M18 6h1v1',
      calendar: 'M7 3v4 M17 3v4 M4 8h16 M5 5h14v16H5z',
      series: 'M4 7h16 M4 12h16 M4 17h16',
      default: 'M12 3v18 M3 12h18',
    };
    return icons[icon] ?? icons.default;
  }
}
