import { CommonModule } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { OperariosService } from '../../core/services/operarios.service'
import type {
  Operario,
  OperarioDocumentoRequest,
  OperarioHistorialRolRequest,
  OperarioRequest,
  OperarioResumen,
} from '../../core/models/operarios.models'

type OperarioModal = 'OPERARIO' | 'DOCUMENTO' | 'ROL' | null

@Component({
  selector: 'app-operarios-gestion-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operarios-gestion-page.component.html',
  styleUrl: './operarios-gestion-page.component.css',
})
export class OperariosGestionPageComponent implements OnInit {
  private readonly operariosService = inject(OperariosService)

  protected readonly resumen = signal<OperarioResumen | null>(null)
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly errorMessage = signal('')
  protected readonly selectedId = signal<string>('')
  protected readonly modal = signal<OperarioModal>(null)
  protected readonly currentPage = signal(1)
  protected readonly pageSize = 8
  protected readonly filters = signal({ search: '', estado: '', rol: '' })
  protected readonly editingId = signal<string | null>(null)

  protected readonly operarioForm = signal<OperarioRequest>(this.emptyOperario())
  protected readonly documentoForm = signal<OperarioDocumentoRequest>(this.emptyDocumento())
  protected readonly rolForm = signal<OperarioHistorialRolRequest>(this.emptyRol())

  protected readonly selectedOperario = computed(() => this.resumen()?.operarios.find((operario) => operario.id === this.selectedId()) ?? null)
  protected readonly totalItems = computed(() => this.resumen()?.operarios.length ?? 0)
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)))
  protected readonly operariosPage = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize
    return (this.resumen()?.operarios ?? []).slice(start, start + this.pageSize)
  })
  protected readonly selectedDocumentos = computed(() => (this.resumen()?.documentos ?? []).filter((item) => item.operarioId === this.selectedId()))
  protected readonly selectedHistorialRoles = computed(() => (this.resumen()?.historialRoles ?? []).filter((item) => item.operarioId === this.selectedId()))

  ngOnInit(): void {
    this.load()
  }

  protected load() {
    this.loading.set(true)
    this.errorMessage.set('')
    this.operariosService.getResumen(this.filters()).subscribe({
      next: (resumen) => {
        this.resumen.set(resumen)
        if (!this.selectedId() && resumen.operarios.length) {
          this.selectedId.set(resumen.operarios[0].id)
        }
        this.loading.set(false)
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la gestión de operarios.')
        this.loading.set(false)
      },
    })
  }

  protected applyFilters() {
    this.currentPage.set(1)
    this.load()
  }

  protected clearFilters() {
    this.filters.set({ search: '', estado: '', rol: '' })
    this.applyFilters()
  }

  protected selectOperario(operario: Operario) {
    this.selectedId.set(operario.id)
  }

  protected openOperarioModal(operario?: Operario) {
    if (operario) {
      this.editingId.set(operario.id)
      this.operarioForm.set({
        userId: operario.userId,
        nombre: operario.nombre,
        apellido: operario.apellido,
        documentoTipo: operario.documentoTipo,
        documentoNumero: operario.documentoNumero,
        telefono: operario.telefono,
        direccion: operario.direccion,
        fechaNacimiento: operario.fechaNacimiento,
        rolOperativo: operario.rolOperativo,
        permisosOperativos: operario.permisosOperativos,
        estado: operario.estado,
        fechaIngreso: operario.fechaIngreso,
        salarioBase: operario.salarioBase,
        contactoEmergencia: operario.contactoEmergencia,
        telefonoEmergencia: operario.telefonoEmergencia,
        observaciones: operario.observaciones,
      })
    } else {
      this.editingId.set(null)
      this.operarioForm.set(this.emptyOperario())
    }
    this.modal.set('OPERARIO')
  }

  protected openModal(type: Exclude<OperarioModal, null>) {
    const selected = this.selectedOperario()
    if (selected) {
      this.documentoForm.update((form) => ({ ...form, operarioId: selected.id }))
      this.rolForm.update((form) => ({ ...form, operarioId: selected.id }))
    }
    this.modal.set(type)
  }

  protected closeModal() {
    this.modal.set(null)
    this.saving.set(false)
  }

  protected submitOperario() {
    this.saving.set(true)
    const request = this.normalizeOperario(this.operarioForm())
    const editingId = this.editingId()
    const operation = editingId
      ? this.operariosService.updateOperario(editingId, request)
      : this.operariosService.createOperario(request)
    operation.subscribe({
      next: (operario) => {
        this.selectedId.set(operario.id)
        this.afterSave()
      },
      error: () => this.failSave('No se pudo guardar el operario.'),
    })
  }

  protected submitDocumento() {
    this.saving.set(true)
    this.operariosService.createDocumento(this.documentoForm()).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo guardar el documento.'),
    })
  }

  protected submitRol() {
    this.saving.set(true)
    this.operariosService.changeRol(this.rolForm()).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo cambiar el rol.'),
    })
  }

  protected deleteOperario(operario: Operario) {
    this.operariosService.deleteOperario(operario.id).subscribe({
      next: () => {
        this.selectedId.set('')
        this.load()
      },
      error: () => this.errorMessage.set('No se pudo eliminar el operario.'),
    })
  }

  protected setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
    }
  }

  protected statusClass(status?: string) {
    const normalized = (status ?? '').toUpperCase()
    if (normalized === 'INACTIVO' || normalized === 'SUSPENDIDO') return 'danger'
    if (normalized === 'LICENCIA') return 'warning'
    return 'success'
  }

  protected formatCurrency(value?: number) {
    return Number(value ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  }

  private afterSave() {
    this.closeModal()
    this.load()
  }

  private failSave(message: string) {
    this.errorMessage.set(message)
    this.saving.set(false)
  }

  private normalizeOperario(form: OperarioRequest): OperarioRequest {
    return {
      ...form,
      salarioBase: this.toNumber(form.salarioBase),
      userId: form.userId || undefined,
    }
  }

  private toNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  private emptyOperario(): OperarioRequest {
    return {
      nombre: '',
      apellido: '',
      documentoTipo: 'DNI',
      documentoNumero: '',
      rolOperativo: 'OPERARIO',
      estado: 'ACTIVO',
      fechaIngreso: new Date().toISOString().slice(0, 10),
    }
  }

  private emptyDocumento(): OperarioDocumentoRequest {
    return {
      operarioId: '',
      tipoDocumento: 'DNI',
      estado: 'VIGENTE',
    }
  }

  private emptyRol(): OperarioHistorialRolRequest {
    return {
      operarioId: '',
      rolNuevo: 'OPERARIO',
      fecha: new Date().toISOString().slice(0, 10),
    }
  }
}
