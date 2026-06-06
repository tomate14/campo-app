import { CommonModule } from '@angular/common'
import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AgricolaService } from '../../core/services/agricola.service'
import { OperariosService } from '../../core/services/operarios.service'
import { OrdenesTrabajoService } from '../../core/services/ordenes-trabajo.service'
import type { Lote } from '../../core/models/agricola.models'
import type { Operario } from '../../core/models/operarios.models'
import type {
  OrdenTrabajo,
  OrdenTrabajoActividadRequest,
  OrdenTrabajoEstado,
  OrdenTrabajoResumen,
} from '../../core/models/ordenes-trabajo.models'

type CalendarModal = 'DETALLE' | 'ACTIVIDAD' | null

interface CalendarDay {
  date: Date
  key: string
  name: string
  label: string
}

interface CalendarEvent {
  orden: OrdenTrabajo
  dayKey: string
  top: number
  height: number
  startLabel: string
  endLabel: string
}

@Component({
  selector: 'app-operaciones-calendario-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operaciones-calendario-page.component.html',
  styleUrl: './operaciones-calendario-page.component.css',
})
export class OperacionesCalendarioPageComponent implements OnInit, OnDestroy {
  private readonly ordenesService = inject(OrdenesTrabajoService)
  private readonly operariosService = inject(OperariosService)
  private readonly agricolaService = inject(AgricolaService)
  private currentTimeTimer?: number

  protected readonly resumen = signal<OrdenTrabajoResumen | null>(null)
  protected readonly operarios = signal<Operario[]>([])
  protected readonly lotes = signal<Lote[]>([])
  protected readonly selectedId = signal('')
  protected readonly modal = signal<CalendarModal>(null)
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly errorMessage = signal('')
  protected readonly now = signal(new Date())
  protected readonly weekStart = signal(this.startOfWeek(new Date()))
  protected readonly activeOperarioIds = signal<string[]>([])
  protected readonly filters = signal<{ operarioId: string; loteId: string; estado: OrdenTrabajoEstado | '' }>({
    operarioId: '',
    loteId: '',
    estado: '',
  })
  protected readonly actividadForm = signal<OrdenTrabajoActividadRequest>({
    tipo: 'AVANCE',
    descripcion: '',
    estado: 'REGISTRADA',
  })

  protected readonly firstOperarios = computed(() => this.operarios().slice(0, 5))
  protected readonly days = computed(() => Array.from({ length: 7 }, (_, index) => this.buildDay(index)))
  protected readonly timeSlots = computed(() => {
    const slots: string[] = []
    for (let hour = 6; hour <= 20; hour += 1) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 20) slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  })
  protected readonly selectedOrden = computed(() => this.ordenes().find((orden) => orden.id === this.selectedId()) ?? null)
  protected readonly ordenes = computed(() => this.resumen()?.ordenes ?? [])
  protected readonly visibleEvents = computed(() => this.ordenes()
    .filter((orden) => this.matchesClientFilters(orden))
    .map((orden) => this.toCalendarEvent(orden))
    .filter((event): event is CalendarEvent => Boolean(event)))
  protected readonly operationsByDay = computed(() => {
    const grouped = new Map<string, CalendarEvent[]>()
    for (const day of this.days()) grouped.set(day.key, [])
    for (const event of this.visibleEvents()) grouped.get(event.dayKey)?.push(event)
    for (const events of grouped.values()) events.sort((a, b) => a.top - b.top)
    return grouped
  })
  protected readonly dashboard = computed(() => {
    const events = this.visibleEvents()
    return {
      total: events.length,
      retrasadas: events.filter((event) => this.isOverdue(event.orden)).length,
      enCurso: events.filter((event) => event.orden.estado === 'EN_PROGRESO').length,
      completadas: events.filter((event) => event.orden.estado === 'COMPLETADA').length,
    }
  })
  protected readonly todayKey = computed(() => this.dateKey(this.now()))
  protected readonly currentTimeTop = computed(() => {
    const now = this.now()
    const minutes = now.getHours() * 60 + now.getMinutes()
    const startLimit = 6 * 60
    const endLimit = 20 * 60
    if (minutes < startLimit || minutes > endLimit) return null
    return ((minutes - startLimit) / 30) * 48
  })

  ngOnInit(): void {
    this.loadReferences()
    this.load()
    this.currentTimeTimer = window.setInterval(() => this.now.set(new Date()), 60_000)
  }

  ngOnDestroy(): void {
    if (this.currentTimeTimer) {
      window.clearInterval(this.currentTimeTimer)
    }
  }

  @HostListener('document:keydown.escape')
  protected closeWithEscape() {
    this.closeModal()
  }

  protected load() {
    this.loading.set(true)
    this.errorMessage.set('')
    this.ordenesService.getResumen({ ...this.filters(), ...this.weekRangeParams() }).subscribe({
      next: (resumen) => {
        this.resumen.set(resumen)
        this.loading.set(false)
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el calendario de operaciones.')
        this.loading.set(false)
      },
    })
  }

  protected applyFilters() {
    this.load()
  }

  protected clearFilters() {
    this.filters.set({ operarioId: '', loteId: '', estado: '' })
    this.load()
  }

  protected changeWeek(offset: number) {
    const next = new Date(this.weekStart())
    next.setDate(next.getDate() + offset * 7)
    this.weekStart.set(next)
    this.load()
  }

  protected goToday() {
    this.weekStart.set(this.startOfWeek(new Date()))
    this.load()
  }

  protected toggleOperario(id: string) {
    const current = this.activeOperarioIds()
    this.activeOperarioIds.set(current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  protected dayEvents(dayKey: string) {
    return this.operationsByDay().get(dayKey) ?? []
  }

  protected openDetail(orden: OrdenTrabajo) {
    this.selectedId.set(orden.id)
    this.modal.set('DETALLE')
  }

  protected openActividad() {
    if (!this.selectedOrden()) return
    this.actividadForm.set({ tipo: 'AVANCE', descripcion: '', estado: 'REGISTRADA' })
    this.modal.set('ACTIVIDAD')
  }

  protected closeModal() {
    this.modal.set(null)
    this.saving.set(false)
  }

  protected changeEstado(estado: OrdenTrabajoEstado) {
    const orden = this.selectedOrden()
    if (!orden) return
    this.saving.set(true)
    this.ordenesService.changeEstado(orden.id, { estado, responsable: 'Administrador' }).subscribe({
      next: (updated) => this.replaceOrden(updated),
      error: () => {
        this.errorMessage.set('No se pudo actualizar el estado de la operacion.')
        this.saving.set(false)
      },
    })
  }

  protected submitActividad() {
    const orden = this.selectedOrden()
    if (!orden) return
    this.saving.set(true)
    this.ordenesService.createActividad(orden.id, this.normalizeActividad(this.actividadForm())).subscribe({
      next: (updated) => this.replaceOrden(updated),
      error: () => {
        this.errorMessage.set('No se pudo registrar la actividad.')
        this.saving.set(false)
      },
    })
  }

  protected statusLabel(status?: string) {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_PROGRESO: 'En progreso',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      RECHAZADA: 'Rechazada',
    }
    return labels[(status ?? '').toUpperCase()] ?? 'Sin estado'
  }

  protected statusClass(status?: string) {
    const value = (status ?? '').toUpperCase()
    if (value === 'COMPLETADA') return 'success'
    if (value === 'EN_PROGRESO') return 'info'
    if (value === 'CANCELADA' || value === 'RECHAZADA') return 'danger'
    return 'warning'
  }

  protected priorityLabel(priority?: string) {
    return (priority ?? 'MEDIA').toLowerCase().replace(/^\w/, (char) => char.toUpperCase())
  }

  protected formatDate(value?: string) {
    return value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin dato'
  }

  protected formatWeekRange() {
    const start = this.weekStart()
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const formatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' })
    return `${formatter.format(start)} - ${formatter.format(end)}`
  }

  protected trackByDay(_: number, day: CalendarDay) {
    return day.key
  }

  protected trackByEvent(_: number, event: CalendarEvent) {
    return event.orden.id
  }

  private loadReferences() {
    this.operariosService.getOperarios({ estado: 'ACTIVO' }).subscribe({
      next: (operarios) => {
        this.operarios.set(operarios)
        this.activeOperarioIds.set(operarios.slice(0, 5).map((operario) => operario.id))
      },
      error: () => undefined,
    })
    this.agricolaService.getLotes().subscribe({ next: (lotes) => this.lotes.set(lotes), error: () => undefined })
  }

  private matchesClientFilters(orden: OrdenTrabajo) {
    if (!orden.fechaProgramada) return false
    const start = new Date(orden.fechaProgramada)
    const weekStart = this.weekStart()
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    if (start < weekStart || start >= weekEnd) return false

    const firstIds = this.firstOperarios().map((operario) => operario.id)
    const activeIds = this.activeOperarioIds()
    if (firstIds.includes(orden.operarioId) && !activeIds.includes(orden.operarioId)) return false
    return true
  }

  private weekRangeParams() {
    const start = new Date(this.weekStart())
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return {
      fechaInicio: this.toLocalDateTimeParam(start),
      fechaFin: this.toLocalDateTimeParam(end),
    }
  }

  private toCalendarEvent(orden: OrdenTrabajo): CalendarEvent | null {
    if (!orden.fechaProgramada) return null
    const start = new Date(orden.fechaProgramada)
    const end = orden.fechaFinEstimada
      ? new Date(orden.fechaFinEstimada)
      : new Date(start.getTime() + (orden.duracionEstimadaMin ?? 60) * 60_000)
    const dayKey = this.dateKey(start)
    const minutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const startLimit = 6 * 60
    const endLimit = 20 * 60
    const top = Math.max(0, ((minutes - startLimit) / 30) * 48)
    const height = Math.max(42, ((Math.min(endMinutes, endLimit) - Math.max(minutes, startLimit)) / 30) * 48)

    return {
      orden,
      dayKey,
      top,
      height,
      startLabel: this.timeLabel(start),
      endLabel: this.timeLabel(end),
    }
  }

  private buildDay(index: number): CalendarDay {
    const date = new Date(this.weekStart())
    date.setDate(date.getDate() + index)
    const name = new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date)
    return {
      date,
      key: this.dateKey(date),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      label: new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' }).format(date),
    }
  }

  private replaceOrden(updated: OrdenTrabajo) {
    const current = this.resumen()
    if (!current) return
    this.resumen.set({
      ...current,
      ordenes: current.ordenes.map((orden) => orden.id === updated.id ? updated : orden),
    })
    this.selectedId.set(updated.id)
    this.saving.set(false)
    this.modal.set('DETALLE')
  }

  private normalizeActividad(form: OrdenTrabajoActividadRequest): OrdenTrabajoActividadRequest {
    return {
      ...form,
      inicio: form.inicio ? new Date(form.inicio).toISOString().slice(0, 19) : undefined,
      fin: form.fin ? new Date(form.fin).toISOString().slice(0, 19) : undefined,
      duracionMin: form.duracionMin ? Number(form.duracionMin) : undefined,
    }
  }

  private isOverdue(orden: OrdenTrabajo) {
    return Boolean(orden.fechaProgramada && new Date(orden.fechaProgramada) < new Date() && !['COMPLETADA', 'CANCELADA', 'RECHAZADA'].includes(orden.estado))
  }

  private startOfWeek(date: Date) {
    const copy = new Date(date)
    copy.setHours(0, 0, 0, 0)
    const day = copy.getDay() || 7
    copy.setDate(copy.getDate() - day + 1)
    return copy
  }

  private dateKey(date: Date) {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  private timeLabel(date: Date) {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  private toLocalDateTimeParam(date: Date) {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  }
}
