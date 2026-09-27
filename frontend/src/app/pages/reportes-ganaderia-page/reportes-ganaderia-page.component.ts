import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { KpiCardComponent, KpiTone } from '../../shared/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon.component';
import type {
  GanaderoDashboard,
  GanaderoDietaActiva,
  GanaderoSerieCategoria,
} from '../../core/models/ganaderia.models';
import { GANADERO_ICONS } from './dashboard-ganadero-icons';

interface BarItem {
  label: string;
  value: number;
  percent: number;
  width: string;
  color: string;
}

@Component({
  selector: 'app-reportes-ganaderia-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, KpiCardComponent, SvgIconComponent],
  templateUrl: './reportes-ganaderia-page.component.html',
  styleUrl: './reportes-ganaderia-page.component.css',
})
export class ReportesGanaderiaPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);

  readonly icons = GANADERO_ICONS;

  readonly dashboard = signal<GanaderoDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly kpis = computed(() => this.dashboard()?.kpis ?? []);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ganaderiaService.getGanaderoDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el dashboard ganadero.');
        this.loading.set(false);
      },
    });
  }

  // ---- KPIs ----

  kpiIcon(codigo: string): string {
    return (GANADERO_ICONS as Record<string, string>)[codigo] ?? GANADERO_ICONS.rodeo;
  }

  kpiTone(tono: string | undefined): KpiTone {
    const map: Record<string, KpiTone> = {
      green: 'green',
      blue: 'blue',
      purple: 'purple',
      red: 'red',
      cyan: 'cyan',
      yellow: 'yellow',
      orange: 'yellow',
    };
    return map[(tono ?? '').toLowerCase()] ?? 'green';
  }

  // ---- Barras horizontales (distribucion, animales por potrero, diagnosticos) ----

  private maxOf<T>(items: T[], accessor: (item: T) => number): number {
    return Math.max(...items.map((item) => Number(accessor(item) ?? 0)), 1);
  }

  barWidth(value: number, max: number): string {
    const pct = max > 0 ? Math.round((Number(value ?? 0) / max) * 100) : 0;
    return `${Math.max(value > 0 ? 6 : 0, pct)}%`;
  }

  distribucionBars(data: GanaderoDashboard): BarItem[] {
    const max = this.maxOf(data.distribucionRodeo, (item) => item.cantidad);
    return data.distribucionRodeo.map((item) => ({
      label: item.categoria,
      value: item.cantidad,
      percent: item.porcentaje,
      width: this.barWidth(item.cantidad, max),
      color: item.color || '#9FE870',
    }));
  }

  animalesPorPotreroBars(data: GanaderoDashboard): BarItem[] {
    const max = this.maxOf(data.animalesPorPotrero, (item) => item.valor);
    return data.animalesPorPotrero.map((item) => ({
      label: item.etiqueta,
      value: item.valor,
      percent: item.porcentaje,
      width: this.barWidth(item.valor, max),
      color: item.color || '#6EA8FF',
    }));
  }

  diagnosticoBars(data: GanaderoDashboard): BarItem[] {
    const max = this.maxOf(data.diagnosticosPorSeveridad, (item) => item.cantidad);
    return data.diagnosticosPorSeveridad.map((item) => ({
      label: this.titleCase(item.severidad ?? 'Sin dato'),
      value: item.cantidad,
      percent: item.porcentaje,
      width: this.barWidth(item.cantidad, max),
      color: item.color || '#FFB84D',
    }));
  }

  // ---- Ocupacion de potreros ----

  progressWidth(value: number | undefined): string {
    return `${Math.max(0, Math.min(100, Number(value ?? 0)))}%`;
  }

  progressTone(value: number | undefined): string {
    const pct = Number(value ?? 0);
    if (pct >= 100) return 'danger';
    if (pct >= 85) return 'orange';
    if (pct >= 60) return 'warning';
    return 'green';
  }

  // ---- Calendario sanitario (badges) ----

  sanitaryTone(value: number | undefined, type: 'vencidas' | 'proximas' | 'programadas'): string {
    if (!Number(value ?? 0)) return 'muted';
    return type === 'vencidas' ? 'danger' : type === 'proximas' ? 'warning' : 'green';
  }

  // ---- Estado reproductivo ----

  reproductiveItems(data: GanaderoDashboard): BarItem[] {
    const labels = ['Preñadas', 'Vacías', 'En control', 'Próx. parto', 'Toros'];
    const values = [
      data.estadoReproductivo.prenadas,
      data.estadoReproductivo.vacias,
      data.estadoReproductivo.enControl,
      data.estadoReproductivo.proximasAParir,
      data.estadoReproductivo.torosActivos,
    ];
    const colors = ['#9FE870', '#FFB84D', '#6EA8FF', '#9A7DFF', '#39D0D8'];
    const total = values.reduce((sum, value) => sum + Number(value ?? 0), 0);
    const max = Math.max(...values, 1);
    return values.map((value, index) => ({
      label: labels[index],
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
      width: this.barWidth(value, max),
      color: colors[index],
    }));
  }

  // ---- Partos estimados por mes (barras verticales) ----

  partosBars(data: GanaderoDashboard): Array<{ label: string; value: number; height: string }> {
    const max = Math.max(...data.partosEstimadosPorMes.map((point) => Number(point.valor ?? 0)), 1);
    return data.partosEstimadosPorMes.map((point) => ({
      label: point.etiqueta,
      value: point.valor,
      height: `${Math.max(point.valor > 0 ? 8 : 0, Math.round((point.valor / max) * 100))}%`,
    }));
  }

  // ---- Genealogia y trazabilidad ----

  genealogyRing(value: number | undefined): string {
    const pct = Math.max(0, Math.min(100, Number(value ?? 0)));
    return `conic-gradient(#9FE870 0% ${pct}%, rgba(255,255,255,.08) ${pct}% 100%)`;
  }

  genealogyGapItems(data: GanaderoDashboard): Array<{ label: string; value: number; color: string }> {
    return [
      { label: 'Sin madre registrada', value: data.genealogiaTrazabilidad.sinMadre, color: '#FFB84D' },
      { label: 'Sin padre registrado', value: data.genealogiaTrazabilidad.sinPadre, color: '#FFB84D' },
      { label: 'Sin raza', value: data.genealogiaTrazabilidad.sinRaza, color: '#6EA8FF' },
      { label: 'Sin fecha de nacimiento', value: data.genealogiaTrazabilidad.sinFechaNacimiento, color: '#6EA8FF' },
      { label: 'Sin trazabilidad completa', value: data.genealogiaTrazabilidad.sinTrazabilidad, color: '#FF6B6B' },
    ];
  }

  // ---- Consumo de alimento por potrero (tabla) ----

  consumoColumns(series: GanaderoSerieCategoria[]): string[] {
    return series[0]?.puntos.map((point) => point.etiqueta) ?? [];
  }

  // ---- Dietas activas ----

  dietSub(dieta: GanaderoDietaActiva): string {
    const kg = dieta.materiaSecaKg ?? 0;
    return `${dieta.tipoAnimal} · ${this.formatNumber(kg, 1)} kg MS`;
  }

  // ---- Alertas operativas ----

  alertModuleIcon(tipo: string | undefined): string {
    const key = (tipo ?? '').toLowerCase();
    if (key.includes('reprod')) return GANADERO_ICONS.moduloReproduccion;
    if (key.includes('sanid')) return GANADERO_ICONS.moduloSanidad;
    if (key.includes('potrer')) return GANADERO_ICONS.moduloPotreros;
    if (key.includes('aliment')) return GANADERO_ICONS.moduloAlimentacion;
    if (key.includes('traza')) return GANADERO_ICONS.moduloTrazabilidad;
    return GANADERO_ICONS.alertas;
  }

  alertModuleTone(tipo: string | undefined): string {
    const key = (tipo ?? '').toLowerCase();
    if (key.includes('reprod')) return 'purple';
    if (key.includes('sanid')) return 'red';
    if (key.includes('potrer')) return 'blue';
    if (key.includes('aliment')) return 'green';
    if (key.includes('traza')) return 'cyan';
    if (key.includes('pesaj')) return 'yellow';
    return 'green';
  }

  alertPriorityTone(prioridad: string | undefined): string {
    const key = (prioridad ?? '').toLowerCase();
    if (key.includes('alta') || key.includes('critic')) return 'danger';
    if (key.includes('media')) return 'warning';
    return 'green';
  }

  // ---- Formato ----

  formatNumber(value: number | undefined, digits = 0): string {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(Number(value ?? 0));
  }

  formatDateTime(value: string | undefined): string {
    if (!value) {
      return 'Sin fecha';
    }
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  trackByCode(_: number, item: { codigo?: string; titulo?: string }): string {
    return item.codigo ?? item.titulo ?? String(_);
  }

  private titleCase(value: string): string {
    return value.toLowerCase().replace(/(^|\s|_)\S/g, (match) => match.toUpperCase()).replaceAll('_', ' ');
  }
}
