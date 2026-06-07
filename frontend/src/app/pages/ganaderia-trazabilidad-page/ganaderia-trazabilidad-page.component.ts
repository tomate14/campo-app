import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { API_BASE_URL } from '../../core/services/api.config';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import type {
  Animal,
  AnimalDetalle,
  AnimalRequest,
  HistorialMedicoAnimalRequest,
  MovimientoAnimalRequest,
} from '../../core/models/ganaderia.models';

@Component({
  selector: 'app-ganaderia-trazabilidad-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './ganaderia-trazabilidad-page.component.html',
  styleUrl: './ganaderia-trazabilidad-page.component.css',
})
export class GanaderiaTrazabilidadPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);

  protected readonly animales = signal<Animal[]>([]);
  protected readonly selected = signal<AnimalDetalle | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly filters = signal({ search: '', caravana: '', raza: '', ubicacion: '', estado: '' });
  protected readonly animalModalOpen = signal(false);
  protected readonly movimientoModalOpen = signal(false);
  protected readonly medicoModalOpen = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(25);
  protected readonly panelTab = signal<'RESUMEN' | 'MOVIMIENTOS' | 'MEDICO' | 'VACUNAS' | 'MAS'>('RESUMEN');
  protected readonly madreSearch = signal('');
  protected readonly padreSearch = signal('');
  protected readonly sexoOptions = [
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Masculino', label: 'Masculino' },
  ];
  protected readonly endpoints = {
    animales: `${API_BASE_URL}/ganaderia/trazabilidad/animales`,
    potreros: `${API_BASE_URL}/ganaderia/potreros`,
    operarios: `${API_BASE_URL}/operarios/gestion/operarios`,
  };
  protected readonly razaOptions = [
    'Aberdeen Angus',
    'Angus Negro',
    'Angus Colorado',
    'Hereford',
    'Braford',
    'Brangus',
    'Shorthorn',
    'Holando Argentino',
    'Jersey',
    'Limousin',
    'Charolais',
    'Bonsmara',
  ].map((label) => ({ value: label, label }));
  protected readonly madreAllowedValues = { sexo: ['Femenino', 'HEMBRA', 'F'] };
  protected readonly padreAllowedValues = { sexo: ['Masculino', 'MACHO', 'TORO', 'M'] };
  protected readonly activeAnimalParams = { estado: 'ACTIVO' };
  protected readonly veterinarioParams = { estado: 'ACTIVO', rol: 'VETERINARIO' };
  protected readonly activeOperarioParams = { estado: 'ACTIVO' };

  protected readonly animalForm = signal<AnimalRequest>({
    caravana: '',
    raza: '',
    sexo: '',
    fechaNacimiento: '',
    fechaCompra: '',
    pesoActualKg: undefined,
    rfidCodigo: '',
    estado: 'ACTIVO',
    ubicacionActual: '',
    madreId: '',
    padreId: '',
    observaciones: '',
  });

  protected readonly movimientoForm = signal<MovimientoAnimalRequest>({
    animalId: '',
    fecha: new Date().toISOString().slice(0, 16),
    tipoMovimiento: 'TRANSFERENCIA',
    ubicacionOrigen: '',
    ubicacionDestino: '',
    motivo: '',
    responsable: '',
    observaciones: '',
  });

  protected readonly medicoForm = signal<HistorialMedicoAnimalRequest>({
    animalId: '',
    fecha: new Date().toISOString().slice(0, 10),
    diagnostico: '',
    tratamiento: '',
    veterinario: '',
    observaciones: '',
  });

  protected readonly resumen = computed(() => {
    const items = this.animales();
    const movimientos = this.selected()?.movimientos.length ?? 0;
    return {
      total: items.length,
      activos: items.filter((animal) => animal.estado === 'ACTIVO').length,
      conRfid: items.filter((animal) => !!animal.rfidCodigo).length,
      ubicaciones: new Set(items.map((animal) => animal.ubicacionActual).filter(Boolean)).size,
      enMovimiento: movimientos,
      riesgoSanitario: items.filter((animal) => this.riesgoAnimal(animal) !== 'Bajo').length,
    };
  });

  protected readonly madresFiltradas = computed(() => this.filterParentOptions('madre', this.madreSearch()));
  protected readonly padresFiltrados = computed(() => this.filterParentOptions('padre', this.padreSearch()));
  protected readonly razas = computed(() =>
    Array.from(new Set(this.animales().map((animal) => animal.raza).filter(Boolean))).sort(),
  );
  protected readonly ubicaciones = computed(() =>
    Array.from(new Set(this.animales().map((animal) => animal.ubicacionActual).filter(Boolean) as string[])).sort(),
  );
  protected readonly filteredAnimales = computed(() => {
    const query = this.filters().search.trim().toLowerCase();
    return this.animales().filter((animal) => {
      if (!query) return true;
      return [animal.caravana, animal.raza, animal.sexo, animal.estado, animal.ubicacionActual, animal.rfidCodigo]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  });
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAnimales().length / this.pageSize())));
  protected readonly pageNumbers = computed(() => Array.from({ length: Math.min(this.totalPages(), 5) }, (_, index) => index + 1));
  protected readonly paginatedAnimales = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredAnimales().slice(start, start + this.pageSize());
  });
  protected readonly rangeLabel = computed(() => {
    const total = this.filteredAnimales().length;
    if (!total) return 'Mostrando 0 de 0 animales';
    const start = (this.page() - 1) * this.pageSize() + 1;
    const end = Math.min(this.page() * this.pageSize(), total);
    return `Mostrando ${start} a ${end} de ${total} animales`;
  });

  ngOnInit(): void {
    this.loadAnimales();
  }

  protected loadAnimales(selectId?: string) {
    this.loading.set(true);
    this.errorMessage.set('');
    const { search: _search, ...apiFilters } = this.filters();
    this.ganaderiaService.getAnimales(apiFilters).subscribe({
      next: (animales) => {
        this.animales.set(animales);
        this.loading.set(false);
        const targetId = selectId ?? this.selected()?.animal.id ?? animales[0]?.id;
        if (targetId) {
          this.loadAnimalDetail(targetId);
        } else {
          this.selected.set(null);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar la trazabilidad animal.');
      },
    });
  }

  protected loadAnimalDetail(id: string) {
    this.ganaderiaService.getAnimal(id).subscribe({
      next: (detail) => this.selected.set(detail),
      error: () => this.errorMessage.set('No se pudo cargar el detalle del animal.'),
    });
  }

  protected updateFilter(key: 'search' | 'caravana' | 'raza' | 'ubicacion' | 'estado', value: string) {
    this.filters.update((current) => ({ ...current, [key]: value }));
    this.page.set(1);
  }

  protected setPage(page: number) {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  protected previousPage() {
    this.setPage(this.page() - 1);
  }

  protected nextPage() {
    this.setPage(this.page() + 1);
  }

  protected updatePageSize(value: string) {
    this.pageSize.set(Number(value));
    this.page.set(1);
  }

  protected selectPanelTab(tab: 'RESUMEN' | 'MOVIMIENTOS' | 'MEDICO' | 'VACUNAS' | 'MAS') {
    this.panelTab.set(tab);
  }

  protected openCreateAnimal() {
    this.animalForm.set({
      caravana: '',
      raza: '',
      sexo: '',
      fechaNacimiento: '',
      fechaCompra: '',
      pesoActualKg: undefined,
      rfidCodigo: '',
      estado: 'ACTIVO',
      ubicacionActual: '',
      madreId: '',
      padreId: '',
      observaciones: '',
    });
    this.madreSearch.set('');
    this.padreSearch.set('');
    this.animalModalOpen.set(true);
  }

  protected submitAnimal() {
    this.saving.set(true);
    this.ganaderiaService.createAnimal(this.normalizeAnimalRequest(this.animalForm())).subscribe({
      next: (animal) => {
        this.saving.set(false);
        this.animalModalOpen.set(false);
        this.loadAnimales(animal.id);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo registrar el animal.');
      },
    });
  }

  protected openMovimientoModal() {
    const animalId = this.selected()?.animal.id;
    if (!animalId) return;
    this.movimientoForm.set({
      animalId,
      fecha: new Date().toISOString().slice(0, 16),
      tipoMovimiento: 'TRANSFERENCIA',
      ubicacionOrigen: this.selected()?.animal.ubicacionActual ?? '',
      ubicacionDestino: '',
      motivo: '',
      responsable: '',
      observaciones: '',
    });
    this.movimientoModalOpen.set(true);
  }

  protected openMovimientoModalFor(animal: Animal) {
    this.loadAnimalDetail(animal.id);
    this.movimientoForm.set({
      animalId: animal.id,
      fecha: new Date().toISOString().slice(0, 16),
      tipoMovimiento: 'TRANSFERENCIA',
      ubicacionOrigen: animal.ubicacionActual ?? '',
      ubicacionDestino: '',
      motivo: '',
      responsable: '',
      observaciones: '',
    });
    this.movimientoModalOpen.set(true);
  }

  protected submitMovimiento() {
    this.saving.set(true);
    this.ganaderiaService.createMovimiento(this.movimientoForm()).subscribe({
      next: () => {
        this.saving.set(false);
        this.movimientoModalOpen.set(false);
        if (this.selected()?.animal.id) {
          this.loadAnimales(this.selected()!.animal.id);
        }
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo registrar el movimiento.');
      },
    });
  }

  protected openMedicoModal() {
    const animalId = this.selected()?.animal.id;
    if (!animalId) return;
    this.medicoForm.set({
      animalId,
      fecha: new Date().toISOString().slice(0, 10),
      diagnostico: '',
      tratamiento: '',
      veterinario: '',
      observaciones: '',
    });
    this.medicoModalOpen.set(true);
  }

  protected openMedicoModalFor(animal: Animal) {
    this.loadAnimalDetail(animal.id);
    this.medicoForm.set({
      animalId: animal.id,
      fecha: new Date().toISOString().slice(0, 10),
      diagnostico: '',
      tratamiento: '',
      veterinario: '',
      observaciones: '',
    });
    this.medicoModalOpen.set(true);
  }

  protected submitMedico() {
    this.saving.set(true);
    this.ganaderiaService.createHistorialMedico(this.medicoForm()).subscribe({
      next: () => {
        this.saving.set(false);
        this.medicoModalOpen.set(false);
        if (this.selected()?.animal.id) {
          this.loadAnimalDetail(this.selected()!.animal.id);
        }
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo registrar el historial médico.');
      },
    });
  }

  protected exportSenasa() {
    this.ganaderiaService.exportSenasa(this.filters().estado || undefined).subscribe((content) => {
      const blob = new Blob([content ?? ''], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'trazabilidad-senasa.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  protected closeModals() {
    this.animalModalOpen.set(false);
    this.movimientoModalOpen.set(false);
    this.medicoModalOpen.set(false);
  }

  protected updateParentSearch(role: 'madre' | 'padre', value: string) {
    if (role === 'madre') {
      this.madreSearch.set(value);
      this.animalForm.update((form) => ({ ...form, madreId: undefined }));
      return;
    }

    this.padreSearch.set(value);
    this.animalForm.update((form) => ({ ...form, padreId: undefined }));
  }

  protected selectParent(role: 'madre' | 'padre', animal: Animal) {
    if (role === 'madre') {
      this.madreSearch.set(this.parentOptionLabel(animal));
      this.animalForm.update((form) => ({ ...form, madreId: animal.id }));
      return;
    }

    this.padreSearch.set(this.parentOptionLabel(animal));
    this.animalForm.update((form) => ({ ...form, padreId: animal.id }));
  }

  protected clearParent(role: 'madre' | 'padre') {
    if (role === 'madre') {
      this.madreSearch.set('');
      this.animalForm.update((form) => ({ ...form, madreId: undefined }));
      return;
    }

    this.padreSearch.set('');
    this.animalForm.update((form) => ({ ...form, padreId: undefined }));
  }

  private normalizeAnimalRequest(form: AnimalRequest): AnimalRequest {
    return {
      ...form,
      pesoActualKg: form.pesoActualKg === undefined || form.pesoActualKg === null || form.pesoActualKg === ('' as unknown as number)
        ? undefined
        : Number(form.pesoActualKg),
      madreId: form.madreId || undefined,
      padreId: form.padreId || undefined,
      sexo: form.sexo || undefined,
      fechaNacimiento: form.fechaNacimiento || undefined,
      fechaCompra: form.fechaCompra || undefined,
      rfidCodigo: form.rfidCodigo || undefined,
      qrCodigo: undefined,
      ubicacionActual: form.ubicacionActual || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private filterParentOptions(role: 'madre' | 'padre', search: string) {
    const query = search.trim().toLowerCase();
    const currentCaravana = this.animalForm().caravana?.trim().toLowerCase();

    return this.animales()
      .filter((animal) => animal.caravana.trim().toLowerCase() !== currentCaravana)
      .filter((animal) => role === 'madre' ? this.isFemale(animal) : this.isMale(animal))
      .filter((animal) => {
        if (!query) {
          return true;
        }
        const label = this.parentOptionLabel(animal).toLowerCase();
        return label.includes(query);
      })
      .slice(0, 10);
  }

  protected parentOptionLabel(animal: Animal) {
    return `${animal.caravana} · ${animal.raza}${animal.ubicacionActual ? ` · ${animal.ubicacionActual}` : ''}`;
  }

  protected riesgoAnimal(animal: Animal) {
    if (animal.estado !== 'ACTIVO') return 'Alto';
    if (!animal.rfidCodigo || !animal.pesoActualKg) return 'Medio';
    return 'Bajo';
  }

  protected animalAge(animal: Animal) {
    if (!animal.fechaNacimiento) return 'Sin dato';
    const born = new Date(animal.fechaNacimiento);
    const now = new Date();
    const years = now.getFullYear() - born.getFullYear();
    return years > 0 ? `${years} años` : 'Menor a 1 año';
  }

  protected sexoLabel(animal: Animal) {
    return animal.sexo || 'Sin dato';
  }

  protected lastMovement(animal: Animal) {
    const selected = this.selected();
    if (selected?.animal.id === animal.id && selected.movimientos.length) {
      return selected.movimientos[0].fecha;
    }
    return animal.updatedAt?.slice(0, 10) ?? 'Sin dato';
  }

  protected isFemale(animal: Animal) {
    return ['FEMENINO', 'HEMBRA', 'F', 'FEMALE'].includes(this.normalizeSexo(animal.sexo));
  }

  private isMale(animal: Animal) {
    return ['MASCULINO', 'MACHO', 'TORO', 'M', 'MALE'].includes(this.normalizeSexo(animal.sexo));
  }

  private normalizeSexo(value?: string) {
    return (value ?? '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }
}
