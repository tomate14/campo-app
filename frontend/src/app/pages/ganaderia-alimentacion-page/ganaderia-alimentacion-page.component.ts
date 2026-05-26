import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GanaderiaService } from '../../core/services/ganaderia.service';
import type {
  AlimentacionResumen,
  Animal,
  DietaRequest,
  PesajeRequest,
  RegistroAlimentacionRequest,
} from '../../core/models/ganaderia.models';

type AlimentacionTab = 'DIETAS' | 'SUMINISTROS' | 'PESAJES' | 'ALERTAS';

@Component({
  selector: 'app-ganaderia-alimentacion-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ganaderia-alimentacion-page.component.html',
  styleUrl: './ganaderia-alimentacion-page.component.css',
})
export class GanaderiaAlimentacionPageComponent implements OnInit {
  private readonly ganaderiaService = inject(GanaderiaService);

  protected readonly resumen = signal<AlimentacionResumen | null>(null);
  protected readonly animales = signal<Animal[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly activeTab = signal<AlimentacionTab>('DIETAS');
  protected readonly modal = signal<'DIETA' | 'SUMINISTRO' | 'PESAJE' | null>(null);

  protected readonly dietaForm = signal<DietaRequest>({
    nombre: '',
    tipoAnimal: 'BOVINO ENGORDE',
    objetivo: '',
    materiaSecaKg: undefined,
    costoDiario: undefined,
    activa: true,
    observaciones: '',
    ingredientes: [{ ingrediente: '', proporcionPct: 100, costoKg: undefined, materiaSecaPct: undefined }],
  });

  protected readonly suministroForm = signal<RegistroAlimentacionRequest>({
    animalId: '',
    dietaId: '',
    fecha: new Date().toISOString().slice(0, 10),
    alimento: '',
    cantidadKg: 0,
    costoTotal: undefined,
    potrero: '',
    responsable: '',
    observaciones: '',
  });

  protected readonly pesajeForm = signal<PesajeRequest>({
    animalId: '',
    fecha: new Date().toISOString().slice(0, 10),
    pesoKg: 0,
    condicionCorporal: undefined,
    metodo: 'BALANZA',
    responsable: '',
    observaciones: '',
  });

  protected readonly totalItems = computed(() => {
    const data = this.resumen();
    if (!data) return 0;
    if (this.activeTab() === 'SUMINISTROS') return data.registros.length;
    if (this.activeTab() === 'PESAJES') return data.pesajes.length;
    if (this.activeTab() === 'ALERTAS') return data.dashboard.alertas.length;
    return data.dietas.length;
  });

  ngOnInit(): void {
    this.loadAll();
  }

  protected loadAll() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.ganaderiaService.getAnimales({ estado: 'ACTIVO' }).subscribe({
      next: (animales) => {
        this.animales.set(animales);
        this.ganaderiaService.getAlimentacionResumen().subscribe({
          next: (resumen) => {
            this.resumen.set(resumen);
            this.loading.set(false);
          },
          error: () => this.failLoad(),
        });
      },
      error: () => this.failLoad(),
    });
  }

  protected setTab(tab: AlimentacionTab) {
    this.activeTab.set(tab);
  }

  protected openModal(type: 'DIETA' | 'SUMINISTRO' | 'PESAJE') {
    this.modal.set(type);
  }

  protected closeModal() {
    this.modal.set(null);
  }

  protected submitDieta() {
    this.saving.set(true);
    this.ganaderiaService.createDieta(this.normalizeDieta(this.dietaForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo guardar la dieta.'),
    });
  }

  protected submitSuministro() {
    this.saving.set(true);
    this.ganaderiaService.createRegistroAlimentacion(this.normalizeSuministro(this.suministroForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el suministro.'),
    });
  }

  protected submitPesaje() {
    this.saving.set(true);
    this.ganaderiaService.createPesaje(this.normalizePesaje(this.pesajeForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el pesaje.'),
    });
  }

  protected updateIngrediente(index: number, key: 'ingrediente' | 'proporcionPct' | 'costoKg' | 'materiaSecaPct', value: string | number) {
    this.dietaForm.update((form) => ({
      ...form,
      ingredientes: (form.ingredientes ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
  }

  protected addIngrediente() {
    this.dietaForm.update((form) => ({
      ...form,
      ingredientes: [...(form.ingredientes ?? []), { ingrediente: '', proporcionPct: 0 }],
    }));
  }

  protected trackByIndex(index: number) {
    return index;
  }

  private normalizeDieta(form: DietaRequest): DietaRequest {
    return {
      ...form,
      materiaSecaKg: this.numberOrUndefined(form.materiaSecaKg),
      costoDiario: this.numberOrUndefined(form.costoDiario),
      ingredientes: (form.ingredientes ?? []).filter((item) => item.ingrediente?.trim()).map((item) => ({
        ...item,
        proporcionPct: Number(item.proporcionPct),
        costoKg: this.numberOrUndefined(item.costoKg),
        materiaSecaPct: this.numberOrUndefined(item.materiaSecaPct),
      })),
    };
  }

  private normalizeSuministro(form: RegistroAlimentacionRequest): RegistroAlimentacionRequest {
    return {
      ...form,
      animalId: form.animalId || undefined,
      dietaId: form.dietaId || undefined,
      cantidadKg: Number(form.cantidadKg),
      costoTotal: this.numberOrUndefined(form.costoTotal),
      potrero: form.potrero || undefined,
      responsable: form.responsable || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private normalizePesaje(form: PesajeRequest): PesajeRequest {
    return {
      ...form,
      pesoKg: Number(form.pesoKg),
      condicionCorporal: this.numberOrUndefined(form.condicionCorporal),
      metodo: form.metodo || undefined,
      responsable: form.responsable || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private numberOrUndefined(value: unknown) {
    return value === undefined || value === null || value === '' ? undefined : Number(value);
  }

  private afterSave() {
    this.saving.set(false);
    this.closeModal();
    this.loadAll();
  }

  private failLoad() {
    this.loading.set(false);
    this.errorMessage.set('No se pudo cargar alimentación ganadera.');
  }

  private failSave(message: string) {
    this.saving.set(false);
    this.errorMessage.set(message);
  }
}
