import { CommonModule } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { API_BASE_URL } from '../../core/services/api.config'
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component'
import { MultiSearchSelectComponent } from '../../shared/multi-search-select/multi-search-select.component'
import { AgricolaService } from '../../core/services/agricola.service'
import { OperariosService } from '../../core/services/operarios.service'
import type { Operario } from '../../core/models/operarios.models'
import type { InsumoAgricola, PageResponse } from '../../core/models/agricola.models'
import type { MetodoPago, TipoClienteFiscal } from '../../core/services/finanzas.service'
import { FinanzasComprasService, type CompraProveedor, type CompraRequest, type ComprasDashboard, type EstadoCompra, type PagoProveedor, type PagoProveedorRequest, type ProveedorFinanciero, type ProveedorRequest, type TipoComprobanteCompra } from '../../core/services/finanzas-compras.service'

type Tab = 'COMPRAS' | 'PROVEEDORES' | 'PAGOS'
type Modal = 'PROVEEDOR' | 'COMPRA' | 'PAGO' | 'DETALLE_COMPRA' | null

@Component({
  selector: 'app-finanzas-compras-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent, MultiSearchSelectComponent],
  templateUrl: './finanzas-compras-page.component.html',
  styleUrl: './finanzas-compras-page.component.css',
})
export class FinanzasComprasPageComponent implements OnInit {
  private readonly service = inject(FinanzasComprasService)
  private readonly agricola = inject(AgricolaService)
  private readonly operariosService = inject(OperariosService)
  protected readonly API_BASE_URL = API_BASE_URL
  protected readonly endpoints = {
    compras: `${API_BASE_URL}/finanzas/compras-proveedores/compras`,
  }
  // Catalogos cargados una sola vez para los selects con buscador (feature 62)
  protected readonly proveedores = signal<ProveedorFinanciero[]>([])
  protected readonly operarios = signal<Operario[]>([])
  protected readonly operariosActivos = computed(() => this.operarios().filter(o => o.estado === 'ACTIVO'))
  protected readonly dashboard = signal<ComprasDashboard | null>(null)
  protected readonly proveedoresPage = signal<PageResponse<ProveedorFinanciero> | null>(null)
  protected readonly comprasPage = signal<PageResponse<CompraProveedor> | null>(null)
  protected readonly pagosPage = signal<PageResponse<PagoProveedor> | null>(null)
  protected readonly insumos = signal<InsumoAgricola[]>([])
  // Feature 84: catálogo de lotes para el multiselect de atribución de la compra.
  protected readonly loteOptions = signal<{ id: string; nombre: string; metaText: string; color: string }[]>([])
  protected readonly tab = signal<Tab>('COMPRAS')
  protected readonly modal = signal<Modal>(null)
  protected readonly editingProveedorId = signal<string | null>(null)
  protected readonly selectedCompra = signal<CompraProveedor | null>(null)
  protected readonly saving = signal(false)
  protected readonly error = signal('')
  protected readonly search = signal('')
  protected readonly estadoFilter = signal<'' | EstadoCompra>('')
  protected readonly fechaDesde = signal(this.firstDayOfCurrentMonth())
  protected readonly fechaHasta = signal(this.today())
  protected readonly pageSizeOptions = [5, 8, 10, 20, 50]
  protected readonly comprasPageIndex = signal(0)
  protected readonly proveedoresPageIndex = signal(0)
  protected readonly pagosPageIndex = signal(0)
  protected readonly comprasSize = signal(8)
  protected readonly proveedoresSize = signal(8)
  protected readonly pagosSize = signal(8)
  protected readonly tipoFiscalOptions: TipoClienteFiscal[] = ['RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO', 'CONSUMIDOR_FINAL']
  protected readonly tipoComprobanteOptions: TipoComprobanteCompra[] = ['FACTURA_A', 'FACTURA_B', 'FACTURA_C', 'REMITO', 'TICKET', 'ORDEN_COMPRA']
  protected readonly estadoOptions: EstadoCompra[] = ['REGISTRADA', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA']
  protected readonly metodoPagoOptions: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA', 'RETENCION', 'OTRO']
  protected readonly proveedorForm = signal<ProveedorRequest>({ razonSocial: '', cuit: '', condicionFiscal: 'RESPONSABLE_INSCRIPTO', email: '', telefono: '', direccion: '', categoria: '', activo: true })
  protected readonly compraForm = signal<CompraRequest>({ proveedorId: '', operarioId: '', tipoComprobante: 'FACTURA_A', numeroComprobante: '', fechaEmision: this.today(), fechaVencimiento: this.addDays(15), observaciones: '', loteIds: [], items: [{ descripcion: '', cantidad: 1, unidad: 'UN', precioUnitario: 0, ivaPorcentaje: 21 }] })
  protected readonly pagoForm = signal<PagoProveedorRequest>({ compraId: '', operarioId: '', fecha: this.today(), metodoPago: 'TRANSFERENCIA', importe: 0, referencia: '', observaciones: '' })

  ngOnInit() {
    this.loadAll()
    this.agricola.getInsumosActivos().subscribe({ next: v => this.insumos.set(v), error: () => undefined })
    // Feature 84: cargar lotes para el multiselect de atribución de la compra.
    this.agricola.getLotes().subscribe({ next: v => this.loteOptions.set(v.map((l, i) => ({ id: l.id, nombre: l.nombre, metaText: `${this.number(l.area)} ha · ${l.cultivoNombre ?? l.cultivo ?? 'Sin cultivo'}`, color: ['#9fe870', '#ffb84d', '#6ea8ff', '#b68cff', '#a3e635', '#39d0d8'][i % 6] }))), error: () => undefined })
    // Cargar catalogos una sola vez para los selects con buscador (feature 62)
    this.service.proveedores({ size: 1000 }).subscribe({ next: v => this.proveedores.set(v.content), error: () => undefined })
    this.operariosService.getOperarios().subscribe({ next: v => this.operarios.set(v), error: () => undefined })
  }

  protected loadAll() { this.loadDashboard(); this.loadCompras(); this.loadProveedores(); this.loadPagos() }
  protected loadDashboard() { this.service.dashboard({ fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta() }).subscribe({ next: v => this.dashboard.set(v), error: () => undefined }) }
  protected loadCompras() { this.service.compras({ search: this.search(), estado: this.estadoFilter() || undefined, fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta(), page: this.comprasPageIndex(), size: this.comprasSize() }).subscribe({ next: v => this.comprasPage.set(v), error: () => this.error.set('No se pudieron cargar las compras') }) }
  protected loadProveedores() { this.service.proveedores({ search: this.search(), page: this.proveedoresPageIndex(), size: this.proveedoresSize() }).subscribe({ next: v => this.proveedoresPage.set(v), error: () => undefined }) }
  protected loadPagos() { this.service.pagos({ page: this.pagosPageIndex(), size: this.pagosSize() }).subscribe({ next: v => this.pagosPage.set(v), error: () => undefined }) }
  protected applyFilters() { this.comprasPageIndex.set(0); this.proveedoresPageIndex.set(0); this.loadDashboard(); this.loadCompras(); this.loadProveedores() }
  protected pageNumbers(page: PageResponse<unknown> | null) { const total = page?.totalPages || 1; const current = (page?.number || 0) + 1; const start = Math.max(1, current - 2); const end = Math.min(total, start + 4); return Array.from({ length: end - start + 1 }, (_, i) => start + i) }
  protected setPage(kind: Tab, page: number) { const idx = page - 1; if (kind === 'COMPRAS') { this.comprasPageIndex.set(idx); this.loadCompras() } if (kind === 'PROVEEDORES') { this.proveedoresPageIndex.set(idx); this.loadProveedores() } if (kind === 'PAGOS') { this.pagosPageIndex.set(idx); this.loadPagos() } }
  protected changePage(kind: Tab, delta: number) { const page = this.pageFor(kind); const current = (page?.number || 0) + 1; this.setPage(kind, Math.max(1, Math.min(page?.totalPages || 1, current + delta))) }
  protected setSize(kind: Tab, size: string | number) { const value = Number(size); if (kind === 'COMPRAS') { this.comprasSize.set(value); this.comprasPageIndex.set(0); this.loadCompras() } if (kind === 'PROVEEDORES') { this.proveedoresSize.set(value); this.proveedoresPageIndex.set(0); this.loadProveedores() } if (kind === 'PAGOS') { this.pagosSize.set(value); this.pagosPageIndex.set(0); this.loadPagos() } }
  protected pageFor(kind: Tab) { return kind === 'COMPRAS' ? this.comprasPage() : kind === 'PROVEEDORES' ? this.proveedoresPage() : this.pagosPage() }
  protected sizeFor(kind: Tab) { return kind === 'COMPRAS' ? this.comprasSize() : kind === 'PROVEEDORES' ? this.proveedoresSize() : this.pagosSize() }
  protected openModal(modal: Modal) { if (modal === 'PROVEEDOR') this.resetProveedorForm(); this.modal.set(modal) }
  protected openEditProveedor(proveedor: ProveedorFinanciero) {
    this.editingProveedorId.set(proveedor.id)
    this.proveedorForm.set({ razonSocial: proveedor.razonSocial, cuit: proveedor.cuit, condicionFiscal: proveedor.condicionFiscal, email: proveedor.email || '', telefono: proveedor.telefono || '', direccion: proveedor.direccion || '', categoria: proveedor.categoria || '', activo: proveedor.activo })
    this.modal.set('PROVEEDOR')
  }
  protected openCompraDetail(compra: CompraProveedor) { this.selectedCompra.set(compra); this.modal.set('DETALLE_COMPRA') }
  protected closeModal() { this.modal.set(null); this.saving.set(false); this.editingProveedorId.set(null); this.selectedCompra.set(null) }
  protected addItem() { this.compraForm.update(f => ({ ...f, items: [...f.items, { descripcion: '', cantidad: 1, unidad: 'UN', precioUnitario: 0, ivaPorcentaje: 21 }] })) }
  protected removeItem(i: number) { this.compraForm.update(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })) }
  protected updateItem(i: number, patch: Record<string, unknown>) { this.compraForm.update(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })) }
  protected selectInsumo(i: number, id: string) { const insumo = this.insumos().find(x => x.id === id); this.updateItem(i, { insumoId: id, descripcion: insumo?.nombre || '', unidad: insumo?.unidadMedida || 'UN', precioUnitario: insumo?.precioUnitario || 0 }) }
  protected submitProveedor() {
    this.saving.set(true)
    const id = this.editingProveedorId()
    const request = id ? this.service.updateProveedor(id, this.cleanProveedor()) : this.service.createProveedor(this.cleanProveedor())
    request.subscribe({ next: () => this.afterSave(), error: () => this.fail('No se pudo guardar el proveedor') })
  }
  protected submitCompra() { this.saving.set(true); this.service.createCompra(this.cleanCompra()).subscribe({ next: () => this.afterSave(), error: () => this.fail('No se pudo registrar la compra') }) }
  protected submitPago() { this.saving.set(true); this.service.createPago(this.cleanPago()).subscribe({ next: () => this.afterSave(), error: () => this.fail('No se pudo registrar el pago') }) }
  private afterSave() { this.closeModal(); this.loadAll() }
  private fail(msg: string) { this.saving.set(false); this.error.set(msg) }
  private cleanProveedor(): ProveedorRequest { const f = this.proveedorForm(); return { ...f, email: f.email || undefined, telefono: f.telefono || undefined, direccion: f.direccion || undefined, categoria: f.categoria || undefined } }
  protected onCompraLotesChange(ids: string[]) { this.compraForm.update(f => ({ ...f, loteIds: ids })) }
  private cleanCompra(): CompraRequest { const f = this.compraForm(); return { ...f, operarioId: f.operarioId || undefined, observaciones: f.observaciones || undefined, loteIds: f.loteIds?.length ? f.loteIds : undefined, items: f.items.map(i => ({ ...i, cantidad: Number(i.cantidad), precioUnitario: Number(i.precioUnitario), ivaPorcentaje: Number(i.ivaPorcentaje ?? 21) })) } }
  private cleanPago(): PagoProveedorRequest { const f = this.pagoForm(); return { ...f, operarioId: f.operarioId || undefined, importe: Number(f.importe), referencia: f.referencia || undefined, observaciones: f.observaciones || undefined } }
  private resetProveedorForm() { this.editingProveedorId.set(null); this.proveedorForm.set({ razonSocial: '', cuit: '', condicionFiscal: 'RESPONSABLE_INSCRIPTO', email: '', telefono: '', direccion: '', categoria: '', activo: true }) }
  protected money(v?: number) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0)) }
  protected number(v?: number) { return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(Number(v || 0)) }
  protected date(v?: string) { return v ? v.slice(0, 10) : 'Sin fecha' }
  private today() { return new Date().toISOString().slice(0, 10) }
  private firstDayOfCurrentMonth() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10) }
  private addDays(days: number) { return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10) }
}
