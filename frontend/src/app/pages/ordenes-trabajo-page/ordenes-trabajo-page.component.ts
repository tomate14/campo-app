import { CommonModule } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AgricolaService } from '../../core/services/agricola.service'
import { OperariosService } from '../../core/services/operarios.service'
import { OrdenesTrabajoService } from '../../core/services/ordenes-trabajo.service'
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component'
import type { Lote } from '../../core/models/agricola.models'
import type { Operario } from '../../core/models/operarios.models'
import type {
  OrdenTrabajo,
  OrdenTrabajoActividadRequest,
  OrdenTrabajoCierreRequest,
  OrdenTrabajoEstado,
  OrdenTrabajoPrioridad,
  OrdenTrabajoRequest,
  OrdenTrabajoResumen,
} from '../../core/models/ordenes-trabajo.models'

type OrdenModal = 'ORDEN' | 'ACTIVIDAD' | 'ACEPTAR' | 'RECHAZAR' | null

@Component({
  selector: 'app-ordenes-trabajo-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './ordenes-trabajo-page.component.html',
  styleUrl: './ordenes-trabajo-page.component.css',
})
export class OrdenesTrabajoPageComponent implements OnInit {
  private readonly ordenesService = inject(OrdenesTrabajoService)
  private readonly operariosService = inject(OperariosService)
  private readonly agricolaService = inject(AgricolaService)

  protected readonly resumen = signal<OrdenTrabajoResumen | null>(null)
  protected readonly operarios = signal<Operario[]>([])
  protected readonly lotes = signal<Lote[]>([])
  protected readonly selectedId = signal('')
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly errorMessage = signal('')
  protected readonly modal = signal<OrdenModal>(null)
  protected readonly editingId = signal<string | null>(null)
  protected readonly currentPage = signal(1)
  protected readonly pageSize = 6
  protected readonly filters = signal<{ search: string; estado: OrdenTrabajoEstado | ''; operarioId: string; loteId: string; prioridad: OrdenTrabajoPrioridad | '' }>({
    search: '',
    estado: '',
    operarioId: '',
    loteId: '',
    prioridad: '',
  })

  protected readonly ordenForm = signal<OrdenTrabajoRequest>(this.emptyOrden())
  protected readonly actividadForm = signal<OrdenTrabajoActividadRequest>(this.emptyActividad())
  protected readonly cierreForm = signal<OrdenTrabajoCierreRequest>(this.emptyCierre())

  // Operarios activos para los combos (reemplaza el filtro extraParams estado:ACTIVO)
  protected readonly operariosActivos = computed(() => this.operarios().filter((operario) => operario.estado === 'ACTIVO'))

  protected readonly ordenes = computed(() => this.resumen()?.ordenes ?? [])
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.ordenes().length / this.pageSize)))
  protected readonly ordenesPage = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize
    return this.ordenes().slice(start, start + this.pageSize)
  })
  protected readonly selectedOrden = computed(() => this.ordenes().find((orden) => orden.id === this.selectedId()) ?? null)

  ngOnInit(): void {
    this.loadReferences()
    this.load()
  }

  protected load() {
    this.loading.set(true)
    this.errorMessage.set('')
    this.ordenesService.getResumen(this.filters()).subscribe({
      next: (resumen) => {
        this.resumen.set(resumen)
        if (!this.selectedId() && resumen.ordenes.length) {
          this.selectedId.set(resumen.ordenes[0].id)
        }
        this.loading.set(false)
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las órdenes de trabajo.')
        this.loading.set(false)
      },
    })
  }

  protected applyFilters() {
    this.currentPage.set(1)
    this.load()
  }

  protected clearFilters() {
    this.filters.set({ search: '', estado: '', operarioId: '', loteId: '', prioridad: '' })
    this.applyFilters()
  }

  protected selectOrden(orden: OrdenTrabajo) {
    this.selectedId.set(orden.id)
  }

  protected openOrdenModal(orden?: OrdenTrabajo) {
    if (orden) {
      this.editingId.set(orden.id)
      this.ordenForm.set({
        titulo: orden.titulo,
        descripcion: orden.descripcion,
        loteId: orden.loteId,
        zona: orden.zona,
        operarioId: orden.operarioId,
        prioridad: orden.prioridad,
        estado: orden.estado,
        fechaProgramada: this.toDatetimeLocal(orden.fechaProgramada),
        fechaInicio: this.toDatetimeLocal(orden.fechaInicio),
        fechaFinEstimada: this.toDatetimeLocal(orden.fechaFinEstimada),
        fechaFinReal: this.toDatetimeLocal(orden.fechaFinReal),
        duracionEstimadaMin: orden.duracionEstimadaMin,
        duracionRealMin: orden.duracionRealMin,
        resultado: orden.resultado,
        observaciones: orden.observaciones,
      })
    } else {
      this.editingId.set(null)
      this.ordenForm.set(this.emptyOrden())
    }
    this.modal.set('ORDEN')
  }

  protected openModal(type: Exclude<OrdenModal, null>) {
    const orden = this.selectedOrden()
    if (!orden && type !== 'ORDEN') return
    this.actividadForm.set(this.emptyActividad())
    this.cierreForm.set(this.emptyCierre())
    this.modal.set(type)
  }

  protected closeModal() {
    this.modal.set(null)
    this.saving.set(false)
  }

  protected submitOrden() {
    this.saving.set(true)
    const request = this.normalizeOrden(this.ordenForm())
    const editingId = this.editingId()
    const operation = editingId ? this.ordenesService.update(editingId, request) : this.ordenesService.create(request)
    operation.subscribe({
      next: (orden) => {
        this.selectedId.set(orden.id)
        this.afterSave()
      },
      error: () => this.failSave('No se pudo guardar la orden.'),
    })
  }

  protected submitActividad() {
    const orden = this.selectedOrden()
    if (!orden) return
    this.saving.set(true)
    this.ordenesService.createActividad(orden.id, this.normalizeActividad(this.actividadForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar la actividad.'),
    })
  }

  protected submitAceptar() {
    const orden = this.selectedOrden()
    if (!orden) return
    this.saving.set(true)
    this.ordenesService.aceptar(orden.id, this.normalizeCierre(this.cierreForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo aceptar la orden.'),
    })
  }

  protected submitRechazar() {
    const orden = this.selectedOrden()
    if (!orden) return
    this.saving.set(true)
    this.ordenesService.rechazar(orden.id, this.normalizeCierre(this.cierreForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo rechazar la orden.'),
    })
  }

  protected changeEstado(estado: OrdenTrabajoEstado) {
    const orden = this.selectedOrden()
    if (!orden) return
    this.ordenesService.changeEstado(orden.id, { estado, responsable: 'Administrador' }).subscribe({
      next: () => this.load(),
      error: () => this.errorMessage.set('No se pudo cambiar el estado.'),
    })
  }

  protected deleteOrden(orden: OrdenTrabajo) {
    this.ordenesService.delete(orden.id).subscribe({
      next: () => {
        this.selectedId.set('')
        this.load()
      },
      error: () => this.errorMessage.set('No se pudo eliminar la orden.'),
    })
  }

  protected setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
    }
  }

  protected statusClass(value?: string) {
    const status = (value ?? '').toUpperCase()
    if (status === 'COMPLETADA') return 'success'
    if (status === 'EN_PROGRESO') return 'info'
    if (status === 'RECHAZADA' || status === 'CANCELADA') return 'danger'
    return 'warning'
  }

  protected priorityClass(value?: string) {
    const priority = (value ?? '').toUpperCase()
    if (priority === 'URGENTE' || priority === 'ALTA') return 'danger'
    if (priority === 'MEDIA') return 'warning'
    return 'success'
  }

  protected formatMinutes(value?: number) {
    if (!value) return 'Sin dato'
    const hours = Math.floor(value / 60)
    const minutes = value % 60
    return hours ? `${hours} h ${minutes} min` : `${minutes} min`
  }

  private loadReferences() {
    this.operariosService.getOperarios({ estado: 'ACTIVO' }).subscribe({ next: (operarios) => this.operarios.set(operarios), error: () => undefined })
    this.agricolaService.getLotes().subscribe({ next: (lotes) => this.lotes.set(lotes), error: () => undefined })
  }

  private afterSave() {
    this.closeModal()
    this.load()
  }

  private failSave(message: string) {
    this.errorMessage.set(message)
    this.saving.set(false)
  }

  private normalizeOrden(form: OrdenTrabajoRequest): OrdenTrabajoRequest {
    return {
      ...form,
      loteId: form.loteId || undefined,
      duracionEstimadaMin: this.toNumber(form.duracionEstimadaMin),
      duracionRealMin: this.toNumber(form.duracionRealMin),
      fechaProgramada: this.toIso(form.fechaProgramada),
      fechaInicio: this.toIso(form.fechaInicio),
      fechaFinEstimada: this.toIso(form.fechaFinEstimada),
      fechaFinReal: this.toIso(form.fechaFinReal),
    }
  }

  private normalizeActividad(form: OrdenTrabajoActividadRequest): OrdenTrabajoActividadRequest {
    return {
      ...form,
      duracionMin: this.toNumber(form.duracionMin),
      inicio: this.toIso(form.inicio),
      fin: this.toIso(form.fin),
    }
  }

  private normalizeCierre(form: OrdenTrabajoCierreRequest): OrdenTrabajoCierreRequest {
    return {
      ...form,
      duracionRealMin: this.toNumber(form.duracionRealMin),
    }
  }

  private toNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  private toIso(value?: string) {
    return value ? new Date(value).toISOString().slice(0, 19) : undefined
  }

  private toDatetimeLocal(value?: string) {
    return value ? value.slice(0, 16) : undefined
  }

  private emptyOrden(): OrdenTrabajoRequest {
    return {
      titulo: '',
      operarioId: '',
      prioridad: 'MEDIA',
      estado: 'PENDIENTE',
    }
  }

  private emptyActividad(): OrdenTrabajoActividadRequest {
    return {
      tipo: 'AVANCE',
      descripcion: '',
      estado: 'REGISTRADA',
    }
  }

  private emptyCierre(): OrdenTrabajoCierreRequest {
    return {
      responsable: 'Administrador',
    }
  }
}
