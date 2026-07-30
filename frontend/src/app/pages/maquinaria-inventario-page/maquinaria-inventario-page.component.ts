import { CommonModule } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AgricolaService } from '../../core/services/agricola.service'
import { MaquinariaService } from '../../core/services/maquinaria.service'
import { OperariosService } from '../../core/services/operarios.service'
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component'
import type { Lote } from '../../core/models/agricola.models'
import type { Operario } from '../../core/models/operarios.models'
import type {
  DocumentoMaquinariaRequest,
  EstadoMaquinariaRequest,
  Maquinaria,
  MaquinariaRequest,
  MaquinariaResumen,
  UsoMaquinariaRequest,
} from '../../core/models/maquinaria.models'

type MaquinariaModal = 'MAQUINA' | 'USO' | 'DOCUMENTO' | 'ESTADO' | null

@Component({
  selector: 'app-maquinaria-inventario-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './maquinaria-inventario-page.component.html',
  styleUrl: './maquinaria-inventario-page.component.css',
})
export class MaquinariaInventarioPageComponent implements OnInit {
  private readonly maquinariaService = inject(MaquinariaService)
  private readonly operariosService = inject(OperariosService)
  private readonly agricolaService = inject(AgricolaService)

  protected readonly resumen = signal<MaquinariaResumen | null>(null)
  protected readonly selectedId = signal('')
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly errorMessage = signal('')
  protected readonly modal = signal<MaquinariaModal>(null)
  protected readonly currentPage = signal(1)
  protected readonly pageSize = 5

  // Catalogos cargados una sola vez para alimentar los combos con buscador
  protected readonly maquinas = signal<Maquinaria[]>([])
  protected readonly operarios = signal<Operario[]>([])
  protected readonly lotes = signal<Lote[]>([])

  // Solo operarios activos para los combos de responsable/operario
  protected readonly operariosActivos = computed(() => this.operarios().filter((operario) => operario.estado === 'ACTIVO'))

  protected readonly filters = signal({ tipo: '', estado: '', ubicacion: '' })

  protected readonly maquinaForm = signal<MaquinariaRequest>({
    codigo: '',
    tipo: 'TRACTOR',
    marca: '',
    modelo: '',
    numeroSerie: '',
    anio: undefined,
    estado: 'DISPONIBLE',
    ubicacionActual: '',
    potenciaHp: undefined,
    capacidad: '',
    accesorios: '',
    horometro: 0,
    kilometraje: 0,
    costoAdquisicion: undefined,
    fechaAlta: new Date().toISOString().slice(0, 10),
    observaciones: '',
  })

  protected readonly usoForm = signal<UsoMaquinariaRequest>({
    maquinariaId: '',
    fecha: new Date().toISOString().slice(0, 10),
    actividad: '',
    loteNombre: '',
    operario: '',
    horasTrabajadas: undefined,
    kilometrosRecorridos: undefined,
    combustibleLitros: undefined,
    observaciones: '',
  })

  protected readonly documentoForm = signal<DocumentoMaquinariaRequest>({
    maquinariaId: '',
    tipoDocumento: 'SEGURO',
    numero: '',
    emision: '',
    vencimiento: '',
    url: '',
    observaciones: '',
  })

  protected readonly estadoForm = signal<EstadoMaquinariaRequest>({
    estado: 'DISPONIBLE',
    responsable: '',
    motivo: '',
  })

  protected readonly maquinasPage = computed(() => {
    const maquinas = this.resumen()?.maquinas ?? []
    const start = (this.currentPage() - 1) * this.pageSize
    return maquinas.slice(start, start + this.pageSize)
  })

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil((this.resumen()?.maquinas.length ?? 0) / this.pageSize)))

  protected readonly selectedMachine = computed(() => {
    const maquinas = this.resumen()?.maquinas ?? []
    return maquinas.find((machine) => machine.id === this.selectedId()) ?? maquinas[0] ?? null
  })

  protected readonly selectedUsos = computed(() => {
    const machine = this.selectedMachine()
    return (this.resumen()?.usosRecientes ?? []).filter((uso) => !machine || uso.maquinariaId === machine.id).slice(0, 5)
  })

  protected readonly selectedDocumentos = computed(() => {
    const machine = this.selectedMachine()
    return (this.resumen()?.documentos ?? []).filter((doc) => !machine || doc.maquinariaId === machine.id).slice(0, 5)
  })

  ngOnInit(): void {
    this.loadResumen()
    this.loadCatalogos()
  }

  // Carga unica de maquinas, operarios y lotes para los combos con buscador
  private loadCatalogos() {
    this.maquinariaService.getMaquinas().subscribe({
      next: (maquinas) => this.maquinas.set(maquinas),
      error: () => this.maquinas.set([]),
    })
    this.operariosService.getOperarios().subscribe({
      next: (operarios) => this.operarios.set(operarios),
      error: () => this.operarios.set([]),
    })
    this.agricolaService.getLotes().subscribe({
      next: (lotes) => this.lotes.set(lotes),
      error: () => this.lotes.set([]),
    })
  }

  protected loadResumen() {
    this.loading.set(true)
    this.errorMessage.set('')
    this.maquinariaService.getResumen(this.filters()).subscribe({
      next: (resumen) => {
        this.resumen.set(resumen)
        if (!this.selectedId() && resumen.maquinas.length) {
          this.selectedId.set(resumen.maquinas[0].id)
        }
        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages())
        }
        this.loading.set(false)
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el inventario de maquinaria.')
        this.loading.set(false)
      },
    })
  }

  protected applyFilters() {
    this.currentPage.set(1)
    this.selectedId.set('')
    this.loadResumen()
  }

  protected clearFilters() {
    this.filters.set({ tipo: '', estado: '', ubicacion: '' })
    this.applyFilters()
  }

  protected selectMachine(machine: Maquinaria) {
    this.selectedId.set(machine.id)
  }

  protected openModal(type: Exclude<MaquinariaModal, null>, machine?: Maquinaria) {
    if (machine) {
      this.selectMachine(machine)
    }
    const selected = this.selectedMachine()
    if (type === 'MAQUINA') {
      this.maquinaForm.set(machine ? this.toMachineRequest(machine) : this.emptyMachineForm())
    }
    if (type === 'USO') {
      this.usoForm.update((form) => ({ ...form, maquinariaId: selected?.id ?? '' }))
    }
    if (type === 'DOCUMENTO') {
      this.documentoForm.update((form) => ({ ...form, maquinariaId: selected?.id ?? '' }))
    }
    if (type === 'ESTADO') {
      this.estadoForm.update((form) => ({ ...form, estado: selected?.estado ?? 'DISPONIBLE' }))
    }
    this.modal.set(type)
  }

  protected closeModal() {
    this.modal.set(null)
  }

  protected submitMaquina() {
    this.saving.set(true)
    const selected = this.selectedMachine()
    const form = this.normalizeMachine(this.maquinaForm())
    const request$ = selected && this.modal() === 'MAQUINA' && form.codigo === selected.codigo
      ? this.maquinariaService.updateMaquina(selected.id, form)
      : this.maquinariaService.createMaquina(form)
    request$.subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo guardar la maquinaria.'),
    })
  }

  protected submitUso() {
    this.saving.set(true)
    this.maquinariaService.createUso(this.normalizeUso(this.usoForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el uso.'),
    })
  }

  protected submitDocumento() {
    this.saving.set(true)
    this.maquinariaService.createDocumento(this.normalizeDocumento(this.documentoForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo guardar el documento.'),
    })
  }

  protected submitEstado() {
    const selected = this.selectedMachine()
    if (!selected) {
      return
    }
    this.saving.set(true)
    this.maquinariaService.updateEstado(selected.id, this.estadoForm()).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo actualizar el estado.'),
    })
  }

  protected deleteMachine(machine: Maquinaria) {
    this.saving.set(true)
    this.maquinariaService.deleteMaquina(machine.id).subscribe({
      next: () => {
        if (this.selectedId() === machine.id) {
          this.selectedId.set('')
        }
        this.afterSave()
      },
      error: () => this.failSave('No se pudo eliminar la maquinaria.'),
    })
  }

  protected setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
    }
  }

  protected statusClass(status?: string) {
    const normalized = (status ?? '').toUpperCase()
    if (normalized.includes('REPARACION') || normalized.includes('MANTENIMIENTO')) return 'danger'
    if (normalized.includes('ASIGNADA') || normalized.includes('OPERANDO')) return 'warning'
    return 'success'
  }

  protected formatNumber(value?: number) {
    return Number(value ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 1 })
  }

  private afterSave() {
    this.saving.set(false)
    this.closeModal()
    this.loadResumen()
  }

  private failSave(message: string) {
    this.errorMessage.set(message)
    this.saving.set(false)
  }

  private emptyMachineForm(): MaquinariaRequest {
    return {
      codigo: '',
      tipo: 'TRACTOR',
      marca: '',
      modelo: '',
      numeroSerie: '',
      estado: 'DISPONIBLE',
      ubicacionActual: '',
      horometro: 0,
      kilometraje: 0,
      fechaAlta: new Date().toISOString().slice(0, 10),
    }
  }

  private toMachineRequest(machine: Maquinaria): MaquinariaRequest {
    return {
      codigo: machine.codigo,
      tipo: machine.tipo,
      marca: machine.marca,
      modelo: machine.modelo,
      numeroSerie: machine.numeroSerie ?? '',
      anio: machine.anio,
      estado: machine.estado,
      ubicacionActual: machine.ubicacionActual ?? '',
      potenciaHp: machine.potenciaHp,
      capacidad: machine.capacidad ?? '',
      accesorios: machine.accesorios ?? '',
      horometro: machine.horometro,
      kilometraje: machine.kilometraje,
      costoAdquisicion: machine.costoAdquisicion,
      fechaAlta: machine.fechaAlta,
      observaciones: machine.observaciones ?? '',
    }
  }

  private normalizeMachine(form: MaquinariaRequest): MaquinariaRequest {
    return {
      ...form,
      anio: this.toNumber(form.anio),
      potenciaHp: this.toNumber(form.potenciaHp),
      horometro: this.toNumber(form.horometro),
      kilometraje: this.toNumber(form.kilometraje),
      costoAdquisicion: this.toNumber(form.costoAdquisicion),
    }
  }

  private normalizeUso(form: UsoMaquinariaRequest): UsoMaquinariaRequest {
    return {
      ...form,
      horasTrabajadas: this.toNumber(form.horasTrabajadas),
      kilometrosRecorridos: this.toNumber(form.kilometrosRecorridos),
      combustibleLitros: this.toNumber(form.combustibleLitros),
    }
  }

  private normalizeDocumento(form: DocumentoMaquinariaRequest): DocumentoMaquinariaRequest {
    return {
      ...form,
      emision: form.emision || undefined,
      vencimiento: form.vencimiento || undefined,
    }
  }

  private toNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
}
