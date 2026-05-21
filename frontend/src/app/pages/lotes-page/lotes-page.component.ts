import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Lote, LoteRequest } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { LoteFormComponent } from '../../shared/lote-form/lote-form.component';

@Component({
  selector: 'app-lotes-page',
  standalone: true,
  imports: [CommonModule, LoteFormComponent],
  templateUrl: './lotes-page.component.html',
  styleUrl: './lotes-page.component.css',
})
export class LotesPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);
  private readonly router = inject(Router);

  protected readonly lotes = signal<Lote[]>([]);
  protected readonly showForm = signal(false);
  protected readonly editingLote = signal<Lote | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.agricolaService.getLotes().subscribe({
      next: (lotes) => {
        this.lotes.set(Array.isArray(lotes) ? lotes : []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando lotes', error);
        this.lotes.set([]);
        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar los lotes.');
      },
    });
  }

  startCreate() {
    this.editingLote.set(null);
    this.showForm.set(true);
  }

  startEdit(lote: Lote) {
    this.editingLote.set(lote);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingLote.set(null);
  }

  openDetail(id: string) {
    void this.router.navigate(['/agricola/lotes', id]);
  }

  persist(data: LoteRequest) {
    const currentLote = this.editingLote();
    const request$ = currentLote
      ? this.agricolaService.updateLote(currentLote.id, data)
      : this.agricolaService.createLote(data);

    request$.subscribe(() => {
      this.closeForm();
      this.load();
    });
  }

  remove(id: string) {
    this.agricolaService.deleteLote(id).subscribe(() => this.load());
  }
}

