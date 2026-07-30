import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import { OperariosService } from '../../core/services/operarios.service';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import type {
  AplicacionVacuna,
  Animal,
  AnimalDetalle,
  AnimalRequest,
  CatalogoRazaBovina,
  HistorialMedicoAnimalRequest,
  MovimientoAnimalRequest,
  Pesaje,
  Potrero,
} from '../../core/models/ganaderia.models';
import type { Operario } from '../../core/models/operarios.models';

type HistorialClinicoEvento = {
  tipo: 'CONTROL_MEDICO' | 'VACUNACION' | 'PESAJE';
  titulo: string;
  fecha: string;
  detalle: string;
  extra?: string;
  badge: string;
  dotClass: string;
};

@Component({
  selector: 'app-ganaderia-trazabilidad-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './ganaderia-trazabilidad-page.component.html',
  styleUrl: './ganaderia-trazabilidad-page.component.css',
})
export class GanaderiaTrazabilidadPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);
  private readonly operariosService = inject(OperariosService);

  protected readonly animales = signal<Animal[]>([]);
  protected readonly selected = signal<AnimalDetalle | null>(null);
  protected readonly selectedAplicaciones = signal<AplicacionVacuna[]>([]);
  protected readonly selectedPesajes = signal<Pesaje[]>([]);
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
  // Catalogos que alimentan los selects con buscador, cargados una sola vez en ngOnInit.
  protected readonly razasBovinas = signal<CatalogoRazaBovina[]>([]);
  protected readonly potreros = signal<Potrero[]>([]);
  protected readonly operarios = signal<Operario[]>([]);
  // Los combos de madre/padre se alimentan de la lista de animales ya cargada
  // (una sola llamada a /animales) y se separan por sexo en el front con los
  // helpers isFemale/isMale, en vez de que cada combo vuelva a pegarle al
  // endpoint (evita las N llamadas a /animales al abrir el form).
  protected readonly madreOptions = computed(() => this.animales().filter((animal) => this.isFemale(animal)));
  protected readonly padreOptions = computed(() => this.animales().filter((animal) => this.isMale(animal)));
  // Replica client-side de los extraParams que antes filtraban en el backend:
  // operariosActivos = {estado:'ACTIVO'}, veterinarios = {estado:'ACTIVO', rol:'VETERINARIO'}.
  protected readonly operariosActivos = computed(() => this.operarios().filter((operario) => operario.estado === 'ACTIVO'));
  protected readonly veterinarios = computed(() =>
    this.operarios().filter((operario) => operario.estado === 'ACTIVO' && this.isVeterinario(operario)),
  );

  protected readonly animalForm = signal<AnimalRequest>({
    caravana: '',
    razaId: '',
    raza: '',
    sexo: '',
    fechaNacimiento: '',
    fechaCompra: '',
    pesoActualKg: undefined,
    rfidCodigo: '',
    estado: 'ACTIVO',
    potreroId: '',
    madreId: '',
    padreId: '',
    observaciones: '',
  });

  protected readonly movimientoForm = signal<MovimientoAnimalRequest>({
    animalId: '',
    fecha: new Date().toISOString().slice(0, 16),
    tipoMovimiento: 'TRANSFERENCIA',
    potreroOrigenId: '',
    potreroDestinoId: '',
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
      ubicaciones: new Set(items.map((animal) => this.animalPotreroLabel(animal)).filter(Boolean)).size,
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
    Array.from(new Set(this.animales().map((animal) => this.animalPotreroLabel(animal)).filter(Boolean) as string[])).sort(),
  );
  protected readonly filteredAnimales = computed(() => {
    const query = this.filters().search.trim().toLowerCase();
    return this.animales().filter((animal) => {
      if (!query) return true;
      return [animal.caravana, animal.raza, animal.sexo, animal.estado, this.animalPotreroLabel(animal), animal.rfidCodigo]
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
  protected readonly historialClinico = computed<HistorialClinicoEvento[]>(() => {
    const controles = (this.selected()?.historialMedico ?? []).map((item) => ({
      tipo: 'CONTROL_MEDICO' as const,
      titulo: item.diagnostico,
      fecha: item.fecha,
      detalle: item.tratamiento || 'Sin tratamiento',
      extra: item.veterinario || item.veterinarioNombre ? `Veterinario: ${item.veterinarioNombre || item.veterinario}` : undefined,
      badge: 'Control médico',
      dotClass: 'event-dot--blue',
    }));
    const vacunas = this.selectedAplicaciones().map((item) => ({
      tipo: 'VACUNACION' as const,
      titulo: item.vacunaNombre,
      fecha: item.fechaAplicacion,
      detalle: `Próxima dosis: ${item.proximaDosisFecha || 'Sin fecha'}`,
      extra: item.operario || item.operarioNombre ? `Responsable: ${item.operarioNombre || item.operario}` : undefined,
      badge: 'Vacunación',
      dotClass: 'event-dot--green',
    }));
    const pesajes = this.selectedPesajes().map((item) => ({
      tipo: 'PESAJE' as const,
      titulo: `Pesaje ${item.pesoKg} kg`,
      fecha: item.fecha,
      detalle: item.metodo || 'Sin método',
      extra: item.condicionCorporal ? `Condición corporal: ${item.condicionCorporal}` : undefined,
      badge: 'Pesaje',
      dotClass: 'event-dot--warning',
    }));

    return [...controles, ...vacunas, ...pesajes]
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  });

  ngOnInit(): void {
    this.loadAnimales();
    this.loadCatalogos();
  }

  private loadCatalogos() {
    // Catalogos de selects: una sola carga cada uno (no una llamada por combo).
    this.ganaderiaService.getRazasBovinas().subscribe((razas) => this.razasBovinas.set(razas));
    this.ganaderiaService.getPotreros().subscribe((potreros) => this.potreros.set(potreros));
    this.operariosService.getOperarios().subscribe((operarios) => this.operarios.set(operarios));
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
    forkJoin({
      detail: this.ganaderiaService.getAnimal(id),
      aplicaciones: this.ganaderiaService.getAplicaciones({ animalId: id }),
      pesajes: this.ganaderiaService.getPesajes({ animalId: id }),
    }).subscribe({
      next: ({ detail, aplicaciones, pesajes }) => {
        this.selected.set(detail);
        this.selectedAplicaciones.set(aplicaciones);
        this.selectedPesajes.set(pesajes);
      },
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
      razaId: '',
      raza: '',
      sexo: '',
      fechaNacimiento: '',
      fechaCompra: '',
      pesoActualKg: undefined,
      rfidCodigo: '',
      estado: 'ACTIVO',
      potreroId: '',
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
      potreroOrigenId: this.selected()?.animal.potreroId ?? '',
      potreroDestinoId: '',
      ubicacionOrigen: this.selected()?.animal.potreroNombre ?? '',
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
      potreroOrigenId: animal.potreroId ?? '',
      potreroDestinoId: '',
      ubicacionOrigen: animal.potreroNombre ?? '',
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

  protected selectRaza(item: object) {
    const raza = item as { id?: string; nombre?: string };
    this.animalForm.update((form) => ({
      ...form,
      razaId: raza.id ?? form.razaId,
      raza: raza.nombre ?? form.raza,
    }));
  }

  protected updateRazaValue(value: string) {
    this.animalForm.update((form) => ({
      ...form,
      razaId: value,
      raza: value ? form.raza : '',
    }));
  }

  private normalizeAnimalRequest(form: AnimalRequest): AnimalRequest {
    return {
      ...form,
      razaId: form.razaId || undefined,
      raza: form.raza || undefined,
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
      potreroId: form.potreroId || undefined,
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
    const potrero = this.animalPotreroLabel(animal);
    return `${animal.caravana} · ${animal.raza}${potrero ? ` · ${potrero}` : ''}`;
  }

  private animalPotreroLabel(animal: Animal) {
    return animal.potreroNombre;
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

  // El modelo Operario expone rolOperativo (no un campo rol dedicado), asi que el
  // filtro de veterinarios se resuelve sobre ese campo en el front.
  private isVeterinario(operario: Operario) {
    return (operario.rolOperativo ?? '').toUpperCase().includes('VETERINARIO');
  }
}
