import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GanaderiaService } from '../../core/services/ganaderia.service';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './ganaderia-trazabilidad-page.component.html',
  styleUrl: './ganaderia-trazabilidad-page.component.css',
})
export class GanaderiaTrazabilidadPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);

  protected readonly animales = signal<Animal[]>([]);
  protected readonly selected = signal<AnimalDetalle | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly filters = signal({ caravana: '', raza: '', ubicacion: '', estado: '' });
  protected readonly animalModalOpen = signal(false);
  protected readonly movimientoModalOpen = signal(false);
  protected readonly medicoModalOpen = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly madreSearch = signal('');
  protected readonly padreSearch = signal('');

  protected readonly animalForm = signal<AnimalRequest>({
    caravana: '',
    raza: '',
    sexo: '',
    fechaNacimiento: '',
    fechaCompra: '',
    pesoActualKg: undefined,
    rfidCodigo: '',
    qrCodigo: '',
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
    return {
      total: items.length,
      activos: items.filter((animal) => animal.estado === 'ACTIVO').length,
      conRfid: items.filter((animal) => !!animal.rfidCodigo).length,
      ubicaciones: new Set(items.map((animal) => animal.ubicacionActual).filter(Boolean)).size,
    };
  });

  protected readonly madresFiltradas = computed(() => this.filterParentOptions(this.madreSearch()));
  protected readonly padresFiltrados = computed(() => this.filterParentOptions(this.padreSearch()));

  ngOnInit(): void {
    this.loadAnimales();
  }

  protected loadAnimales(selectId?: string) {
    this.loading.set(true);
    this.errorMessage.set('');
    this.ganaderiaService.getAnimales(this.filters()).subscribe({
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

  protected updateFilter(key: 'caravana' | 'raza' | 'ubicacion' | 'estado', value: string) {
    this.filters.update((current) => ({ ...current, [key]: value }));
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
      qrCodigo: '',
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
      qrCodigo: form.qrCodigo || undefined,
      ubicacionActual: form.ubicacionActual || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private filterParentOptions(search: string) {
    const query = search.trim().toLowerCase();
    const currentCaravana = this.animalForm().caravana?.trim().toLowerCase();

    return this.animales()
      .filter((animal) => animal.caravana.trim().toLowerCase() !== currentCaravana)
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
}
