import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CalidadGrano, EventoSiembra, EventoSiembraRequest, Lote, RegistroCosecha, RegistroCosechaRequest, TipoEvento } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { ConfigurableSelectComponent } from '../../shared/configurable-select/configurable-select.component';

type CicloTab = 'SIEMBRA' | 'COSECHA';

@Component({
  selector: 'app-siembra-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfigurableSelectComponent],
  templateUrl: './siembra-page.component.html',
  styleUrl: './siembra-page.component.css',
})
export class SiembraPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);

  protected lotes: Lote[] = [];
  protected eventos: EventoSiembra[] = [];
  protected cosechas: RegistroCosecha[] = [];
  protected selectedLoteId = '';
  protected activeTab: CicloTab = 'SIEMBRA';
  protected showForm = false;
  protected page = 1;
  protected readonly pageSize = 3;
  protected promedio?: { loteId: string; rendimientoPromedioKgHa: number };
  protected readonly tipos: TipoEvento[] = ['SIEMBRA', 'MONITOREO_FENOLOGICO', 'ALERTA', 'TRATAMIENTO'];
  protected readonly calidades: CalidadGrano[] = ['PREMIUM', 'ESTANDAR', 'DESCUENTO'];
  protected form: EventoSiembraRequest = { loteId: '', tipoEvento: 'SIEMBRA', fecha: new Date().toISOString().slice(0, 10) };
  protected cosechaForm: RegistroCosechaRequest = { loteId: '', fecha: new Date().toISOString().slice(0, 10), rendimientoKgHa: 0, toneladasTotal: 0 };

  ngOnInit() {
    this.agricolaService.getLotes().subscribe((lotes) => this.lotes = lotes);
  }

  setTab(tab: CicloTab) {
    this.activeTab = tab;
    this.page = 1;
    this.loadSelected();
  }

  loadSelected() {
    if (this.activeTab === 'COSECHA') {
      this.loadCosechas();
      return;
    }

    this.loadEventos();
  }

  loadEventos() {
    this.page = 1;
    if (!this.selectedLoteId) {
      this.eventos = [];
      return;
    }

    this.agricolaService.getEventosByLote(this.selectedLoteId).subscribe((eventos) => this.eventos = eventos);
  }

  loadCosechas() {
    this.page = 1;
    if (!this.selectedLoteId) {
      this.cosechas = [];
      this.promedio = undefined;
      return;
    }

    this.agricolaService.getCosechasByLote(this.selectedLoteId).subscribe((cosechas) => this.cosechas = cosechas);
    this.agricolaService.getRendimientoPromedio(this.selectedLoteId).subscribe((promedio) => this.promedio = promedio);
  }

  openForm() {
    this.showForm = true;
  }

  saveEvento() {
    this.agricolaService.createEvento(this.form).subscribe(() => {
      this.showForm = false;
      this.form = { loteId: '', tipoEvento: 'SIEMBRA', fecha: new Date().toISOString().slice(0, 10) };
      this.loadEventos();
    });
  }

  saveCosecha() {
    this.agricolaService.createCosecha(this.cosechaForm).subscribe(() => {
      this.showForm = false;
      this.cosechaForm = { loteId: '', fecha: new Date().toISOString().slice(0, 10), rendimientoKgHa: 0, toneladasTotal: 0 };
      this.loadCosechas();
    });
  }

  protected totalItems() {
    return this.activeTab === 'COSECHA' ? this.cosechas.length : this.eventos.length;
  }

  protected totalPages() {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize));
  }

  protected pageNumbers() {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  }

  protected setPage(page: number) {
    this.page = Math.min(Math.max(page, 1), this.totalPages());
  }

  protected previousPage() {
    this.setPage(this.page - 1);
  }

  protected nextPage() {
    this.setPage(this.page + 1);
  }

  protected paginatedEventos() {
    const start = (this.page - 1) * this.pageSize;
    return this.eventos.slice(start, start + this.pageSize);
  }

  protected paginatedCosechas() {
    const start = (this.page - 1) * this.pageSize;
    return this.cosechas.slice(start, start + this.pageSize);
  }

  protected rangeLabel() {
    const total = this.totalItems();
    if (!total) return '0 registros';
    const from = (this.page - 1) * this.pageSize + 1;
    const to = Math.min(this.page * this.pageSize, total);
    return `${from}-${to} de ${total}`;
  }
}

