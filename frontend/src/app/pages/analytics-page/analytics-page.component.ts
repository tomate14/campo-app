import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { AgriculturaAnalytics, AnalyticsFiltros, Lote } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { UplotChartComponent } from '../../shared/uplot-chart/uplot-chart.component';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UplotChartComponent],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.css',
})
export class AnalyticsPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);

  protected readonly lotes = signal<Lote[]>([]);
  protected readonly analytics = signal<AgriculturaAnalytics | null>(null);
  protected readonly loading = signal(false);
  protected readonly filters = signal<AnalyticsFiltros>({ granularidad: 'MENSUAL' });

  protected readonly maxSeriesValue = computed(() => {
    const values = this.analytics()?.series.map((item) => item.rendimientoPromedioKgHa) ?? [];
    return values.length ? Math.max(...values, 1) : 1;
  });

  protected readonly cultivoChart = computed(() => ({
    labels: this.analytics()?.cultivos.map((item) => item.cultivo) ?? [],
    values: this.analytics()?.cultivos.map((item) => item.rendimientoPromedioKgHa) ?? [],
    average: this.averageOf(this.analytics()?.cultivos.map((item) => item.rendimientoPromedioKgHa) ?? []),
  }));

  protected readonly temporadaChart = computed(() => ({
    labels: this.analytics()?.temporadas.map((item) => item.temporada) ?? [],
    values: this.analytics()?.temporadas.map((item) => item.rendimientoPromedioKgHa) ?? [],
    average: this.averageOf(this.analytics()?.temporadas.map((item) => item.rendimientoPromedioKgHa) ?? []),
  }));

  protected readonly loteRankingChart = computed(() => {
    const lotes = this.analytics()?.lotes.slice(0, 10) ?? [];
    return {
      labels: lotes.map((item) => item.loteNombre),
      values: lotes.map((item) => item.rendimientoPromedioKgHa),
      average: this.averageOf(lotes.map((item) => item.rendimientoPromedioKgHa)),
    };
  });

  protected readonly outliersChart = computed(() => ({
    labels: this.analytics()?.outliers.map((item) => item.loteNombre) ?? [],
    values: this.analytics()?.outliers.map((item) => item.desviacionSobreMediaKgHa) ?? [],
    average: 0,
  }));

  ngOnInit() {
    this.agricolaService.getLotes().subscribe((lotes) => this.lotes.set(lotes));
    this.load();
  }

  protected load() {
    this.loading.set(true);
    this.agricolaService.getAnalytics(this.filters()).subscribe((analytics) => {
      this.analytics.set(analytics);
      this.loading.set(false);
    });
  }

  protected updateFilter<K extends keyof AnalyticsFiltros>(key: K, value: AnalyticsFiltros[K]) {
    this.filters.update((current) => ({ ...current, [key]: value || undefined }));
  }

  protected exportPdf() {
    this.agricolaService.exportAnalyticsPdf(this.filters()).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'analytics-agricola.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  protected seriesHeight(value: number) {
    return `${Math.max(12, (value / this.maxSeriesValue()) * 180)}px`;
  }

  private averageOf(values: number[]) {
    if (!values.length) {
      return undefined;
    }
    return values.reduce((sum, current) => sum + current, 0) / values.length;
  }
}
