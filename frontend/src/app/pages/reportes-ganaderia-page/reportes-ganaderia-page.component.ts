import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon.component';
import { buildApexTooltipHtml } from '../../shared/apex-tooltip/apex-tooltip.util';
import type {
  GanaderoDashboard,
  GanaderoDietaActiva,
  GanaderoSerieCategoria,
} from '../../core/models/ganaderia.models';
import { GANADERO_ICONS } from './dashboard-ganadero-icons';

interface RankingItem {
  label: string;
  value: string;
  pct: number;
  caption: string;
  color: string;
}

@Component({
  selector: 'app-reportes-ganaderia-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, SvgIconComponent],
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

  // ---- Config de charts (animations:false: ApexCharts crashea al navegar en SPA) ----

  // Evolucion de peso: area (peso promedio) + linea (ganancia diaria) con doble eje.
  readonly pesoChart = {
    type: 'line',
    height: 300,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: false },
    dropShadow: { enabled: true, top: 6, left: 0, blur: 10, opacity: 0.22, color: '#9FE870' },
    foreColor: '#8EA0BB',
    background: 'transparent',
  } as any;

  readonly barChart = {
    type: 'bar',
    height: 300,
    toolbar: { show: false },
    animations: { enabled: false },
    states: {
      normal: { filter: { type: 'none' } },
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    foreColor: '#8EA0BB',
    background: 'transparent',
  } as any;

  readonly genealogiaChart = {
    type: 'radialBar',
    height: 300,
    toolbar: { show: false },
    animations: { enabled: false },
    background: 'transparent',
  } as any;

  readonly grid = { borderColor: 'rgba(110,168,255,.10)', strokeDashArray: 4, padding: { left: 8, right: 8 } } as const;

  // Fill del area de peso (verde, opacidad .28 -> 0) con glow.
  readonly pesoFill = {
    type: ['gradient', 'solid'],
    gradient: { shadeIntensity: 1, opacityFrom: 0.28, opacityTo: 0, stops: [0, 95] },
  } as any;

  // Fill de barras de partos: verde #b8f78e -> #6fcf3f (estilos.md).
  readonly barFill = {
    type: 'gradient',
    gradient: {
      type: 'vertical',
      shadeIntensity: 0,
      gradientToColors: ['#6FCF3F'],
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100],
    },
  } as any;

  readonly pesoStroke: any = { curve: 'smooth', width: [3, 3] };
  readonly pesoMarkers = { size: 0, hover: { size: 6 } } as const;
  readonly dataLabelsOff = { enabled: false } as const;
  readonly legend = { position: 'top', horizontalAlign: 'left', labels: { colors: '#A6B0CF' }, markers: { size: 6 }, itemMargin: { horizontal: 12 } } as any;
  readonly barPlotOptions = { bar: { horizontal: false, borderRadius: 6, columnWidth: '46%' } } as const;

  readonly genealogiaColors: string[] = ['#9FE870'];
  readonly genealogiaPlotOptions = {
    radialBar: {
      hollow: { size: '62%', background: 'transparent' },
      track: { background: 'rgba(255,255,255,.07)', strokeWidth: '100%' },
      dataLabels: {
        name: { offsetY: 22, color: '#a9bad5', fontSize: '13px', fontWeight: 600 },
        value: { offsetY: -14, color: '#ffffff', fontSize: '40px', fontWeight: 900, formatter: (val: number) => `${Math.round(val)}%` },
      },
    },
  } as any;

  readonly genealogiaFill = {
    type: 'gradient',
    gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#6FCF3F'], stops: [0, 100] },
  } as any;

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

  // Tono de acento por codigo de KPI (fallback al tono que trae el backend).
  kpiTone(kpi: { codigo?: string; tono?: string }): string {
    const byCode: Record<string, string> = {
      ANIMALES_ACTIVOS: 'green', PESO_PROMEDIO: 'blue', GANANCIA_DIARIA: 'green',
      PRENADAS_ACTIVAS: 'violet', PARTOS_PROXIMOS: 'violet', VACUNAS_PROXIMAS: 'warning',
      ALERTAS_SANITARIAS: 'danger', OCUPACION_POTREROS: 'blue', DIETAS_ACTIVAS: 'green',
      SIN_UBICACION: 'warning',
    };
    const map: Record<string, string> = { orange: 'warning', yellow: 'warning', cyan: 'blue', red: 'danger', purple: 'violet' };
    const raw = (kpi.tono ?? byCode[kpi.codigo ?? ''] ?? 'green').toLowerCase();
    return `tone-${map[raw] ?? raw}`;
  }

  // ---- Evolucion de peso (chart) ----

  pesoSeries(data: GanaderoDashboard): Array<{ name: string; type: string; data: number[] }> {
    return [
      { name: 'Peso promedio', type: 'area', data: data.evolucionPeso.map((p) => Number(p.pesoPromedio ?? 0)) },
      { name: 'Ganancia diaria', type: 'line', data: data.evolucionPeso.map((p) => Number(p.gananciaDiaria ?? 0)) },
    ];
  }

  pesoCategories(data: GanaderoDashboard): string[] {
    return data.evolucionPeso.map((p) => p.etiqueta);
  }

  pesoYaxis(): any {
    return [
      {
        seriesName: 'Peso promedio',
        labels: { style: { colors: '#8EA0BB', fontSize: '11px' }, formatter: (v: number) => `${Math.round(Number(v ?? 0))}` },
        title: { text: 'kg', style: { color: '#8EA0BB', fontSize: '11px', fontWeight: 600 } },
      },
      {
        seriesName: 'Ganancia diaria',
        opposite: true,
        labels: { style: { colors: '#8EA0BB', fontSize: '11px' }, formatter: (v: number) => `${Number(v ?? 0).toFixed(2)}` },
        title: { text: 'kg/día', style: { color: '#8EA0BB', fontSize: '11px', fontWeight: 600 } },
      },
    ];
  }

  pesoTooltip(): any {
    return {
      enabled: true,
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex, w }: any) => {
        const label = w.globals.labels?.[dataPointIndex] ?? w.globals.categoryLabels?.[dataPointIndex] ?? 'Sin mes';
        const peso = Number(series?.[0]?.[dataPointIndex] ?? 0);
        const gdp = Number(series?.[1]?.[dataPointIndex] ?? 0);
        return this.tooltipHtml({
          title: label,
          subtitle: 'Evolución de peso del rodeo',
          status: `${this.number(peso, 1)} kg`,
          accent: '#9FE870',
          rows: [
            ['Peso promedio', `${this.number(peso, 1)} kg`],
            ['Ganancia diaria', `${this.number(gdp, 2)} kg/día`],
            ['Mes', label],
          ],
          legends: [['Peso promedio', '#9FE870'], ['Ganancia diaria', '#6EA8FF']],
        });
      },
    };
  }

  // ---- Partos estimados por mes (chart) ----

  partosSeries(data: GanaderoDashboard): Array<{ name: string; data: number[] }> {
    return [{ name: 'Partos estimados', data: data.partosEstimadosPorMes.map((p) => Number(p.valor ?? 0)) }];
  }

  partosCategories(data: GanaderoDashboard): string[] {
    return data.partosEstimadosPorMes.map((p) => p.etiqueta);
  }

  partosTooltip(): any {
    return {
      enabled: true,
      custom: ({ series, dataPointIndex, w }: any) => {
        const label = w.globals.labels?.[dataPointIndex] ?? w.globals.categoryLabels?.[dataPointIndex] ?? 'Sin mes';
        const value = Number(series?.[0]?.[dataPointIndex] ?? 0);
        return this.tooltipHtml({
          title: label,
          subtitle: 'Partos estimados por mes',
          status: `${this.number(value)} partos`,
          accent: '#9FE870',
          rows: [['Partos estimados', this.number(value)], ['Mes', label]],
          legends: [['Partos estimados', '#9FE870']],
        });
      },
    };
  }

  // ---- Genealogia (radialBar) ----

  genealogiaSeries(data: GanaderoDashboard): number[] {
    return [Math.max(0, Math.min(100, Number(data.genealogiaTrazabilidad.porcentajeCompleta ?? 0)))];
  }

  genealogiaGapItems(data: GanaderoDashboard): Array<{ label: string; value: number; color: string }> {
    const g = data.genealogiaTrazabilidad;
    return [
      { label: 'Sin madre registrada', value: g.sinMadre, color: '#FFB84D' },
      { label: 'Sin padre registrado', value: g.sinPadre, color: '#FFB84D' },
      { label: 'Sin raza', value: g.sinRaza, color: '#6EA8FF' },
      { label: 'Sin fecha de nacimiento', value: g.sinFechaNacimiento, color: '#6EA8FF' },
      { label: 'Sin trazabilidad completa', value: g.sinTrazabilidad, color: '#FF6B6B' },
    ];
  }

  // ---- Rankings (barras CSS) ----

  private rankPct(values: number[], value: number): number {
    const max = Math.max(...values, 0);
    if (max <= 0) return 0;
    return Math.max(4, Math.min(100, (Number(value ?? 0) / max) * 100));
  }

  distribucionRanking(data: GanaderoDashboard): RankingItem[] {
    const values = data.distribucionRodeo.map((i) => i.cantidad);
    return data.distribucionRodeo.map((i) => ({
      label: i.categoria,
      value: this.number(i.cantidad),
      pct: this.rankPct(values, i.cantidad),
      caption: `${this.number(i.porcentaje, 0)}% del rodeo`,
      color: i.color || '#9FE870',
    }));
  }

  estadoReproductivoRanking(data: GanaderoDashboard): RankingItem[] {
    const r = data.estadoReproductivo;
    const rows = [
      { label: 'Preñadas', value: r.prenadas, color: '#9FE870' },
      { label: 'Vacías', value: r.vacias, color: '#FFB84D' },
      { label: 'En control', value: r.enControl, color: '#6EA8FF' },
      { label: 'Próx. parto', value: r.proximasAParir, color: '#B48CFF' },
      { label: 'Toros activos', value: r.torosActivos, color: '#39D0D8' },
    ];
    const total = rows.reduce((sum, i) => sum + Number(i.value ?? 0), 0);
    const values = rows.map((i) => i.value);
    return rows.map((i) => ({
      label: i.label,
      value: this.number(i.value),
      pct: this.rankPct(values, i.value),
      caption: `${total > 0 ? Math.round((i.value / total) * 100) : 0}% del total`,
      color: i.color,
    }));
  }

  diagnosticoRanking(data: GanaderoDashboard): RankingItem[] {
    const values = data.diagnosticosPorSeveridad.map((i) => i.cantidad);
    return data.diagnosticosPorSeveridad.map((i) => ({
      label: this.titleCase(i.severidad ?? 'Sin dato'),
      value: this.number(i.cantidad),
      pct: this.rankPct(values, i.cantidad),
      caption: `${this.number(i.porcentaje, 0)}% de casos`,
      color: i.color || '#FFB84D',
    }));
  }

  // ---- Ocupacion de potreros ----

  occColor(porcentaje: number | undefined): string {
    const pct = Number(porcentaje ?? 0);
    if (pct >= 100) return '#FF5D5D';
    if (pct >= 85) return '#FF9F43';
    if (pct >= 60) return '#FFB84D';
    return '#9FE870';
  }

  occWidth(porcentaje: number | undefined): number {
    return Math.max(4, Math.min(100, Number(porcentaje ?? 0)));
  }

  // ---- Calendario sanitario ----

  sanitaryChip(value: number | undefined, type: 'vencidas' | 'proximas' | 'programadas'): string {
    if (!Number(value ?? 0)) return 'chip-neutral';
    return type === 'vencidas' ? 'chip-danger' : type === 'proximas' ? 'chip-warning' : 'chip-green';
  }

  // ---- Proximos partos ----

  riesgoChip(nivel: string | undefined): string {
    const key = (nivel ?? '').toUpperCase();
    if (key.includes('ALT') || key.includes('CRIT')) return 'chip-danger';
    if (key.includes('MED')) return 'chip-warning';
    return 'chip-green';
  }

  diasChip(dias: number | undefined): string {
    const d = Number(dias ?? 0);
    if (d <= 3) return 'vence-danger';
    if (d <= 10) return 'vence-warning';
    return 'vence-ok';
  }

  // ---- Consumo de alimento (tabla) ----

  consumoColumns(series: GanaderoSerieCategoria[]): string[] {
    return series[0]?.puntos.map((point) => point.etiqueta) ?? [];
  }

  // ---- Dietas activas ----

  dietSub(dieta: GanaderoDietaActiva): string {
    const kg = dieta.materiaSecaKg ?? 0;
    return `${dieta.tipoAnimal} · ${this.number(kg, 1)} kg MS`;
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
    if (key.includes('reprod')) return 'violet';
    if (key.includes('sanid')) return 'danger';
    if (key.includes('potrer')) return 'blue';
    if (key.includes('aliment')) return 'green';
    if (key.includes('traza')) return 'blue';
    if (key.includes('pesaj')) return 'warning';
    return 'green';
  }

  alertPriorityClass(prioridad: string | undefined): string {
    const key = (prioridad ?? '').toLowerCase();
    if (key.includes('alta') || key.includes('critic')) return 'danger';
    if (key.includes('media')) return 'warning';
    return 'green';
  }

  // ---- Formato ----

  number(value: number | undefined, digits = 0): string {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(Number(value ?? 0));
  }

  formatDate(value: string | undefined): string {
    return value ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'Sin fecha';
  }

  formatDateTime(value: string | undefined): string {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
  }

  initial(name: string | undefined): string {
    return (name ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  trackByCode(_: number, item: { codigo?: string; titulo?: string }): string {
    return item.codigo ?? item.titulo ?? String(_);
  }

  // Tooltip premium compartido (shared/apex-tooltip).
  private tooltipHtml(config: { title: string; subtitle: string; status: string; accent: string; rows: string[][]; legends: string[][] }): string {
    return buildApexTooltipHtml({
      title: config.title,
      subtitle: config.subtitle,
      status: config.status,
      accent: config.accent,
      rows: config.rows.map(([label, value]) => ({ label, value })),
      legends: config.legends.map(([label, color]) => ({ label, color })),
    });
  }

  private titleCase(value: string): string {
    return value.toLowerCase().replace(/(^|\s|_)\S/g, (match) => match.toUpperCase()).replaceAll('_', ' ');
  }
}
