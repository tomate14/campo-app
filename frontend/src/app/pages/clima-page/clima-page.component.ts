import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ClimaMonitoreo, DatoClima, Pronostico } from '../../core/models/clima.models';
import type { Lote } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { ClimaService } from '../../core/services/clima.service';

@Component({
  selector: 'app-clima-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clima-page.component.html',
  styleUrl: './clima-page.component.css',
})
export class ClimaPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);
  private readonly climaService = inject(ClimaService);

  protected lotes: Lote[] = [];
  protected selectedLoteId = '';
  protected historicoDias = 7;
  protected monitoring: ClimaMonitoreo | null = null;
  protected loading = false;

  ngOnInit() {
    this.agricolaService.getLotes().subscribe((lotes) => this.lotes = lotes);
  }

  load() {
    if (!this.selectedLoteId) {
      this.monitoring = null;
      return;
    }

    this.loading = true;
    this.climaService.getMonitoreo(this.selectedLoteId, this.historicoDias).subscribe({
      next: (data) => {
        this.monitoring = data;
        this.loading = false;
      },
      error: () => {
        this.monitoring = null;
        this.loading = false;
      },
    });
  }

  sync() {
    if (!this.selectedLoteId) {
      return;
    }

    this.climaService.sincronizar(this.selectedLoteId).subscribe(() => this.load());
  }

  get historicoTemperaturas(): number[] {
    return (this.monitoring?.historico ?? [])
      .map((item) => item.temperatura ?? item.tempMax ?? item.tempMin)
      .filter((value): value is number => value !== undefined && value !== null);
  }

  get historicoPolyline(): string {
    const values = this.historicoTemperaturas;
    if (values.length < 2) {
      return '';
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(max - min, 1);
    const width = 100;
    const height = 40;

    return values.map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
      const y = height - (((value - min) / range) * height);
      return `${x},${y}`;
    }).join(' ');
  }

  get todayForecast(): Pronostico | null {
    return this.monitoring?.pronostico?.[0] ?? null;
  }

  get heroDescription(): string {
    return this.monitoring?.actual?.descripcion ?? this.todayForecast?.descripcion ?? 'Sin datos';
  }

  get heroIcon(): string {
    return this.mapWeatherIcon(this.monitoring?.actual?.iconoCodigo ?? this.todayForecast?.iconoCodigo);
  }

  get heroDateLabel(): string {
    const dateValue = this.todayForecast?.fecha ?? this.monitoring?.actual?.timestampUtc;
    if (!dateValue) {
      return '';
    }

    const date = new Date(dateValue);
    const weekday = date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '').toUpperCase();
    const dayMonth = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    return `${weekday}. ${dayMonth}`;
  }

  get uvLabel(): string {
    const uv = this.todayForecast?.uvIndexMax;
    if (uv === undefined || uv === null) {
      return '-';
    }
    if (uv < 3) {
      return `${uv.toFixed(1)} (Bajo)`;
    }
    if (uv < 6) {
      return `${uv.toFixed(1)} (Moderado)`;
    }
    if (uv < 8) {
      return `${uv.toFixed(1)} (Alto)`;
    }
    if (uv < 11) {
      return `${uv.toFixed(1)} (Muy alto)`;
    }
    return `${uv.toFixed(1)} (Extremo)`;
  }

  get windLabel(): string {
    const speed = this.todayForecast?.velocidadViento ?? this.monitoring?.actual?.velocidadViento;
    const direction = this.todayForecast?.direccionVientoDominante ?? this.monitoring?.actual?.direccionViento;
    if (speed === undefined || speed === null) {
      return '-';
    }

    const cardinal = direction === undefined || direction === null ? '' : `${this.toCardinal(direction)} `;
    const kmh = speed * 3.6;
    return `${cardinal}${kmh.toFixed(0)} km/h`;
  }

  get precipLabel(): string {
    const value = this.todayForecast?.probabilidadLluvia;
    return value === undefined || value === null ? '-' : `${Math.round(value)}%`;
  }

  formatFecha(value: string) {
    return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  formatHistoricoFecha(item: DatoClima) {
    return new Date(`${item.timestampUtc}Z`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  private toCardinal(degrees: number) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.round(degrees / 45) % 8];
  }

  private mapWeatherIcon(iconCode?: string) {
    switch (iconCode) {
      case 'clear-day':
        return '\u2600\uFE0F';
      case 'clear-night':
        return '\uD83C\uDF19';
      case 'partly-cloudy-day':
        return '\uD83C\uDF24\uFE0F';
      case 'partly-cloudy-night':
        return '\u2601\uFE0F';
      case 'cloudy':
        return '\u2601\uFE0F';
      case 'fog':
        return '\uD83C\uDF2B\uFE0F';
      case 'drizzle':
        return '\uD83C\uDF26\uFE0F';
      case 'rain':
        return '\uD83C\uDF27\uFE0F';
      case 'storm':
        return '\u26C8\uFE0F';
      case 'snow':
        return '\uD83C\uDF28\uFE0F';
      default:
        return '\u26C5';
    }
  }
}
