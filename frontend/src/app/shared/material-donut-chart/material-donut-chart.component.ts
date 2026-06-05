import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { PremiumChartTooltipComponent, type PremiumTooltipMetric } from '../premium-chart-tooltip/premium-chart-tooltip.component';

export interface MaterialDonutItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-material-donut-chart',
  standalone: true,
  imports: [CommonModule, PremiumChartTooltipComponent],
  templateUrl: './material-donut-chart.component.html',
  styleUrl: './material-donut-chart.component.css',
})
export class MaterialDonutChartComponent {
  @Input() items: MaterialDonutItem[] = [];
  @Input() centerValue = '';
  @Input() centerLabel = '';
  protected readonly activeSegment = signal<MaterialDonutItem | null>(null);

  protected readonly segments = computed(() => {
    let cursor = 0;
    return this.items.map((item) => {
      const start = cursor;
      cursor += item.percentage;
      return { ...item, path: this.arcPath(start, cursor) };
    });
  });

  protected showTooltip(item: MaterialDonutItem): void { this.activeSegment.set(item); }
  protected hideTooltip(): void { this.activeSegment.set(null); }

  protected tooltipMetrics(item: MaterialDonutItem): PremiumTooltipMetric[] {
    return [
      { icon: 'trend', label: 'Participación', value: `${item.percentage}%` },
      { icon: 'crop', label: 'Cultivo', value: item.label },
      { icon: 'area', label: 'Lotes', value: `${item.value}` },
      { icon: 'series', label: 'Total panel', value: `${this.centerValue} ${this.centerLabel}` },
    ];
  }

  private arcPath(startPct: number, endPct: number): string {
    const cx = 80;
    const cy = 80;
    const radius = 58;
    const start = this.pointOnCircle(cx, cy, radius, startPct);
    const end = this.pointOnCircle(cx, cy, radius, endPct);
    const largeArc = endPct - startPct > 50 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  private pointOnCircle(cx: number, cy: number, radius: number, pct: number): { x: number; y: number } {
    const angle = (pct / 100) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }
}
