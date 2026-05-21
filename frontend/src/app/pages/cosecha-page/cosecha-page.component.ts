import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CalidadGrano, Lote, RegistroCosecha, RegistroCosechaRequest } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';

@Component({
  selector: 'app-cosecha-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cosecha-page.component.html',
  styleUrl: './cosecha-page.component.css',
})
export class CosechaPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);

  protected lotes: Lote[] = [];
  protected cosechas: RegistroCosecha[] = [];
  protected selectedLoteId = '';
  protected showForm = false;
  protected promedio?: { loteId: string; rendimientoPromedioKgHa: number };
  protected readonly calidades: CalidadGrano[] = ['PREMIUM', 'ESTANDAR', 'DESCUENTO'];
  protected form: RegistroCosechaRequest = { loteId: '', fecha: new Date().toISOString().slice(0, 10), rendimientoKgHa: 0, toneladasTotal: 0 };

  ngOnInit() {
    this.agricolaService.getLotes().subscribe((lotes) => this.lotes = lotes);
  }

  loadCosechas() {
    if (!this.selectedLoteId) {
      this.cosechas = [];
      this.promedio = undefined;
      return;
    }

    this.agricolaService.getCosechasByLote(this.selectedLoteId).subscribe((cosechas) => this.cosechas = cosechas);
    this.agricolaService.getRendimientoPromedio(this.selectedLoteId).subscribe((promedio) => this.promedio = promedio);
  }

  saveCosecha() {
    this.agricolaService.createCosecha(this.form).subscribe(() => {
      this.showForm = false;
      this.form = { loteId: '', fecha: new Date().toISOString().slice(0, 10), rendimientoKgHa: 0, toneladasTotal: 0 };
      this.loadCosechas();
    });
  }
}

