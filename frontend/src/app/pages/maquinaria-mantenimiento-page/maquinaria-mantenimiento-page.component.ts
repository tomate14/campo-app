import { CommonModule } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MaquinariaService } from '../../core/services/maquinaria.service'
import { OperariosService } from '../../core/services/operarios.service'
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component'
import type { Operario } from '../../core/models/operarios.models'
import type {
  IntervencionMantenimientoRequest,
  Maquinaria,
  MantenimientoProgramado,
  MantenimientoProgramadoRequest,
  MantenimientoResumen,
  PlanMantenimientoRequest,
  RepuestoUtilizadoRequest,
} from '../../core/models/maquinaria.models'

type MaintenanceModal = 'PLAN' | 'PROGRAMACION' | 'INTERVENCION' | null
type MaintenanceTab = 'PROGRAMADAS' | 'INTERVENCIONES' | 'PLANES' | 'ALERTAS'

@Component({
  selector: 'app-maquinaria-mantenimiento-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './maquinaria-mantenimiento-page.component.html',
  styleUrl: './maquinaria-mantenimiento-page.component.css',
})
export class MaquinariaMantenimientoPageComponent implements OnInit {
  private readonly maquinariaService = inject(MaquinariaService)
  private readonly operariosService = inject(OperariosService)

  protected readonly resumen = signal<MantenimientoResumen | null>(null)
  protected readonly maquinas = signal<Maquinaria[]>([])
  protected readonly operarios = signal<Operario[]>([])
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly errorMessage = signal('')
  protected readonly modal = signal<MaintenanceModal>(null)
  protected readonly activeTab = signal<MaintenanceTab>('PROGRAMADAS')
  protected readonly currentPage = signal(1)
  protected readonly pageSize = 3
  protected readonly filters = signal({ maquinariaId: '', estado: '' })

  // Solo operarios activos para los combos de responsable/operario
  protected readonly operariosActivos = computed(() => this.operarios().filter((operario) => operario.estado === 'ACTIVO'))

  protected readonly planForm = signal<PlanMantenimientoRequest>({
    maquinariaId: '',
    tipoMaquinaria: '',
    modelo: '',
    nombre: '',
    descripcion: '',
    intervaloHoras: undefined,
    intervaloDias: undefined,
    prioridad: 'MEDIA',
    activo: true,
  })

  protected readonly programacionForm = signal<MantenimientoProgramadoRequest>({
    maquinariaId: '',
    planId: '',
    fechaProgramada: new Date().toISOString().slice(0, 10),
    horometroObjetivo: undefined,
    estado: 'PENDIENTE',
    responsable: '',
    observaciones: '',
  })

  protected readonly intervencionForm = signal<IntervencionMantenimientoRequest>({
    maquinariaId: '',
    planId: '',
    programacionId: '',
    fecha: new Date().toISOString().slice(0, 10),
    tipo: 'PREVENTIVO',
    tareasRealizadas: '',
    operario: '',
    horasMaquina: undefined,
    manoObraCosto: undefined,
    repuestosCosto: undefined,
    costoTotal: undefined,
    estadoResultante: 'DISPONIBLE',
    observaciones: '',
    repuestos: [],
  })

  protected readonly repuestoDraft = signal<RepuestoUtilizadoRequest>({
    codigo: '',
    descripcion: '',
    cantidad: 1,
    costoUnitario: undefined,
    costoTotal: undefined,
    proveedor: '',
  })

  protected readonly totalItems = computed(() => {
    const data = this.resumen()
    if (!data) return 0
    if (this.activeTab() === 'INTERVENCIONES') return data.intervenciones.length
    if (this.activeTab() === 'PLANES') return data.planes.length
    if (this.activeTab() === 'ALERTAS') return data.dashboard.alertas.length
    return data.programaciones.length
  })

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)))
  protected readonly pageStart = computed(() => (this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1))
  protected readonly pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.totalItems()))
  protected readonly activeTabLabel = computed(() => {
    const labels: Record<MaintenanceTab, string> = {
      PROGRAMADAS: 'programaciones',
      INTERVENCIONES: 'intervenciones',
      PLANES: 'planes',
      ALERTAS: 'alertas',
    }
    return labels[this.activeTab()]
  })

  protected readonly programacionesPage = computed(() => this.paginate(this.resumen()?.programaciones ?? []))
  protected readonly intervencionesPage = computed(() => this.paginate(this.resumen()?.intervenciones ?? []))
  protected readonly planesPage = computed(() => this.paginate(this.resumen()?.planes ?? []))
  protected readonly alertasPage = computed(() => this.paginate(this.resumen()?.dashboard.alertas ?? []))

  ngOnInit(): void {
    this.loadAll()
    this.loadOperarios()
  }

  // La lista de operarios se carga una sola vez y alimenta todos los combos
  private loadOperarios() {
    this.operariosService.getOperarios().subscribe({
      next: (operarios) => this.operarios.set(operarios),
      error: () => this.operarios.set([]),
    })
  }

  protected loadAll() {
    this.loading.set(true)
    this.errorMessage.set('')
    this.maquinariaService.getMaquinas().subscribe({
      next: (maquinas) => {
        this.maquinas.set(maquinas)
        this.maquinariaService.getMantenimientoResumen(this.filters()).subscribe({
          next: (resumen) => {
            this.resumen.set(resumen)
            this.loading.set(false)
          },
          error: () => this.failLoad(),
        })
      },
      error: () => this.failLoad(),
    })
  }

  protected setTab(tab: MaintenanceTab) {
    this.activeTab.set(tab)
    this.currentPage.set(1)
  }

  protected applyFilters() {
    this.currentPage.set(1)
    this.loadAll()
  }

  protected clearFilters() {
    this.filters.set({ maquinariaId: '', estado: '' })
    this.applyFilters()
  }

  protected openModal(type: Exclude<MaintenanceModal, null>, programacion?: MantenimientoProgramado) {
    if (type === 'INTERVENCION' && programacion) {
      this.intervencionForm.update((form) => ({
        ...form,
        maquinariaId: programacion.maquinariaId,
        planId: programacion.planId ?? '',
        programacionId: programacion.id,
        horasMaquina: programacion.horometroObjetivo,
      }))
    }
    this.modal.set(type)
  }

  protected closeModal() {
    this.modal.set(null)
  }

  protected submitPlan() {
    this.saving.set(true)
    this.maquinariaService.createPlanMantenimiento(this.normalizePlan(this.planForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo guardar el plan.'),
    })
  }

  protected submitProgramacion() {
    this.saving.set(true)
    this.maquinariaService.createProgramacionMantenimiento(this.normalizeProgramacion(this.programacionForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo programar el mantenimiento.'),
    })
  }

  protected submitIntervencion() {
    this.saving.set(true)
    this.maquinariaService.createIntervencionMantenimiento(this.normalizeIntervencion(this.intervencionForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar la intervención.'),
    })
  }

  protected addRepuesto() {
    const draft = this.repuestoDraft()
    if (!draft.descripcion.trim()) return
    this.intervencionForm.update((form) => ({
      ...form,
      repuestos: [...(form.repuestos ?? []), this.normalizeRepuesto(draft)],
    }))
    this.repuestoDraft.set({ codigo: '', descripcion: '', cantidad: 1, costoUnitario: undefined, costoTotal: undefined, proveedor: '' })
  }

  protected removeRepuesto(index: number) {
    this.intervencionForm.update((form) => ({
      ...form,
      repuestos: (form.repuestos ?? []).filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  protected completeProgramacion(programacion: MantenimientoProgramado) {
    this.maquinariaService.updateProgramacionMantenimientoEstado(programacion.id, 'COMPLETADO').subscribe({
      next: () => this.loadAll(),
      error: () => this.errorMessage.set('No se pudo completar la programación.'),
    })
  }

  protected setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
    }
  }

  protected statusClass(status?: string) {
    const normalized = (status ?? '').toUpperCase()
    if (normalized === 'VENCIDO' || normalized === 'PENDIENTE_VENCIDO') return 'danger'
    if (normalized === 'PENDIENTE') return 'warning'
    return 'success'
  }

  protected formatCurrency(value?: number) {
    return Number(value ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  }

  private afterSave() {
    this.saving.set(false)
    this.closeModal()
    this.loadAll()
  }

  private failLoad() {
    this.errorMessage.set('No se pudo cargar mantenimiento de maquinaria.')
    this.loading.set(false)
  }

  private failSave(message: string) {
    this.errorMessage.set(message)
    this.saving.set(false)
  }

  private paginate<T>(items: T[]): T[] {
    const start = (this.currentPage() - 1) * this.pageSize
    return items.slice(start, start + this.pageSize)
  }

  private normalizePlan(form: PlanMantenimientoRequest): PlanMantenimientoRequest {
    return {
      ...form,
      maquinariaId: form.maquinariaId || undefined,
      intervaloHoras: this.toNumber(form.intervaloHoras),
      intervaloDias: this.toNumber(form.intervaloDias),
    }
  }

  private normalizeProgramacion(form: MantenimientoProgramadoRequest): MantenimientoProgramadoRequest {
    return {
      ...form,
      planId: form.planId || undefined,
      horometroObjetivo: this.toNumber(form.horometroObjetivo),
    }
  }

  private normalizeIntervencion(form: IntervencionMantenimientoRequest): IntervencionMantenimientoRequest {
    return {
      ...form,
      planId: form.planId || undefined,
      programacionId: form.programacionId || undefined,
      horasMaquina: this.toNumber(form.horasMaquina),
      manoObraCosto: this.toNumber(form.manoObraCosto),
      repuestosCosto: this.toNumber(form.repuestosCosto),
      costoTotal: this.toNumber(form.costoTotal),
    }
  }

  private normalizeRepuesto(repuesto: RepuestoUtilizadoRequest): RepuestoUtilizadoRequest {
    const cantidad = this.toNumber(repuesto.cantidad) ?? 0
    const costoUnitario = this.toNumber(repuesto.costoUnitario)
    return {
      ...repuesto,
      cantidad,
      costoUnitario,
      costoTotal: this.toNumber(repuesto.costoTotal) ?? (costoUnitario ? cantidad * costoUnitario : undefined),
    }
  }

  private toNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
}
