import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { Lote, LoteFilters, LoteRequest } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { LoteFormComponent } from '../../shared/lote-form/lote-form.component';
import { LoteMapPreviewComponent } from '../../shared/lote-map-preview/lote-map-preview.component';
import { ConfigurableSelectComponent } from '../../shared/configurable-select/configurable-select.component';

@Component({
  selector: 'app-lotes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoteFormComponent, LoteMapPreviewComponent, ConfigurableSelectComponent],
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
  protected readonly importModalOpen = signal(false);
  protected readonly importPayload = signal('');
  protected readonly filters = signal<LoteFilters>({
    temporada: '',
    cultivo: '',
  });

  ngOnInit() {
    this.agricolaService.getLotes(undefined).subscribe({
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

  load() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.agricolaService.getLotes(this.buildFilters()).subscribe({
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

  updateFilter<K extends keyof LoteFilters>(key: K, value: LoteFilters[K]) {
    this.filters.update((current) => ({ ...current, [key]: value }));
  }

  resetFilters() {
    this.filters.set({ temporada: '', cultivo: '' });
    this.load();
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

  openImportModal() {
    this.importPayload.set('');
    this.importModalOpen.set(true);
  }

  closeImportModal() {
    this.importModalOpen.set(false);
    this.importPayload.set('');
  }

  importGeoJson() {
    this.agricolaService.importGeoJson(this.importPayload()).subscribe(() => {
      this.closeImportModal();
      this.load();
    });
  }

  exportGeoJson() {
    this.agricolaService.exportGeoJson(this.buildFilters()).subscribe((geoJson) => {
      const blob = new Blob([geoJson], { type: 'application/geo+json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'lotes.geojson';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  protected formatArea(area?: number) {
    return area === undefined || area === null ? '-' : `${area.toFixed(2)} ha`;
  }

  protected formatCoordinate(value?: number) {
    return value === undefined || value === null ? '-' : value.toFixed(4);
  }

  protected formatDate(value?: string | null) {
    if (!value) {
      return 'Sin dato';
    }

    return new Date(value).toLocaleDateString('es-AR');
  }

  protected formatDateTime(value?: string | null) {
    if (!value) {
      return 'Sin dato';
    }

    return new Date(value).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected metricValue(lote: Lote, key: 'phMin' | 'phMax' | 'siembra' | 'cosecha' | 'updated') {
    switch (key) {
      case 'phMin':
        return lote.phMinimo !== undefined && lote.phMinimo !== null ? String(lote.phMinimo) : 'Sin dato';
      case 'phMax':
        return lote.phMaximo !== undefined && lote.phMaximo !== null ? String(lote.phMaximo) : 'Sin dato';
      case 'siembra':
        return this.formatDate(lote.fechaSiembra);
      case 'cosecha':
        return this.formatDate(lote.fechaCosechaEstimada);
      case 'updated':
        return this.formatDateTime(lote.updatedAt);
      default:
        return 'Sin dato';
    }
  }

  protected latestSeason(lote: Lote) {
    return lote.temporada;
  }

  private buildFilters(): LoteFilters {
    const filters = this.filters();
    return {
      temporada: filters.temporada || undefined,
      cultivo: filters.cultivo || undefined,
      areaMin: filters.areaMin ?? undefined,
      areaMax: filters.areaMax ?? undefined,
      phMin: filters.phMin ?? undefined,
      phMax: filters.phMax ?? undefined,
      tienePoligono: filters.tienePoligono,
    };
  }
}
