import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { AlertaClima, DatoClima, Pronostico, RecomendacionClima } from '../../core/models/clima.models';
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
  protected actual: DatoClima | null = null;
  protected pronostico: Pronostico[] = [];
  protected alertas: AlertaClima[] = [];
  protected recomendaciones?: RecomendacionClima;

  ngOnInit() {
    this.agricolaService.getLotes().subscribe((lotes) => this.lotes = lotes);
  }

  load() {
    if (!this.selectedLoteId) {
      this.actual = null;
      this.pronostico = [];
      this.alertas = [];
      this.recomendaciones = undefined;
      return;
    }

    this.climaService.getActual(this.selectedLoteId).subscribe((data) => this.actual = data);
    this.climaService.getPronostico(this.selectedLoteId).subscribe((data) => this.pronostico = data);
    this.climaService.getAlertas(this.selectedLoteId).subscribe((data) => this.alertas = data);
    this.climaService.getRecomendaciones(this.selectedLoteId).subscribe((data) => this.recomendaciones = data);
  }

  sync() {
    if (!this.selectedLoteId) {
      return;
    }

    this.climaService.sincronizar(this.selectedLoteId).subscribe(() => this.load());
  }
}

