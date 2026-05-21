import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { EventoSiembra, EventoSiembraRequest, Lote, TipoEvento } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';

@Component({
  selector: 'app-siembra-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './siembra-page.component.html',
  styleUrl: './siembra-page.component.css',
})
export class SiembraPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);

  protected lotes: Lote[] = [];
  protected eventos: EventoSiembra[] = [];
  protected selectedLoteId = '';
  protected showForm = false;
  protected readonly tipos: TipoEvento[] = ['SIEMBRA', 'MONITOREO_FENOLOGICO', 'ALERTA', 'TRATAMIENTO'];
  protected form: EventoSiembraRequest = { loteId: '', tipoEvento: 'SIEMBRA', fecha: new Date().toISOString().slice(0, 10) };

  ngOnInit() {
    this.agricolaService.getLotes().subscribe((lotes) => this.lotes = lotes);
  }

  loadEventos() {
    if (!this.selectedLoteId) {
      this.eventos = [];
      return;
    }

    this.agricolaService.getEventosByLote(this.selectedLoteId).subscribe((eventos) => this.eventos = eventos);
  }

  saveEvento() {
    this.agricolaService.createEvento(this.form).subscribe(() => {
      this.showForm = false;
      this.form = { loteId: '', tipoEvento: 'SIEMBRA', fecha: new Date().toISOString().slice(0, 10) };
      this.loadEventos();
    });
  }
}

