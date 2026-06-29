import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { API_BASE_URL } from '../../core/services/api.config'
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component'
import { AgricolaService } from '../../core/services/agricola.service'
import type { InsumoAgricola, PageResponse } from '../../core/models/agricola.models'
import { FinanzasService, type ClienteFinanciero, type ClienteRequest, type CobroRequest, type CobroVenta, type EstadoFactura, type FacturaRequest, type FacturaVenta, type FacturacionDashboard, type MetodoPago, type NotaCreditoRequest, type NotaCreditoVenta, type TipoClienteFiscal, type TipoComprobante } from '../../core/services/finanzas.service'

type Tab = 'FACTURAS' | 'CLIENTES' | 'COBROS' | 'NOTAS'
type Modal = 'CLIENTE' | 'FACTURA' | 'COBRO' | 'NOTA' | null

@Component({ selector: 'app-finanzas-facturacion-page', standalone: true, imports: [CommonModule, FormsModule, RemoteSearchSelectComponent], templateUrl: './finanzas-facturacion-page.component.html', styleUrl: './finanzas-facturacion-page.component.css' })
export class FinanzasFacturacionPageComponent implements OnInit {
  private readonly service = inject(FinanzasService)
  private readonly agricola = inject(AgricolaService)
  protected readonly API_BASE_URL = API_BASE_URL
  protected readonly endpoints = { operarios: `${API_BASE_URL}/operarios/gestion/operarios`, clientes: `${API_BASE_URL}/finanzas/facturacion/clientes` }
  protected readonly activeOperarioParams = { estado: 'ACTIVO' }
  protected readonly dashboard = signal<FacturacionDashboard | null>(null)
  protected readonly clientesPage = signal<PageResponse<ClienteFinanciero> | null>(null)
  protected readonly facturasPage = signal<PageResponse<FacturaVenta> | null>(null)
  protected readonly cobrosPage = signal<PageResponse<CobroVenta> | null>(null)
  protected readonly notasPage = signal<PageResponse<NotaCreditoVenta> | null>(null)
  protected readonly insumos = signal<InsumoAgricola[]>([])
  protected readonly tab = signal<Tab>('FACTURAS')
  protected readonly modal = signal<Modal>(null)
  protected readonly editingClienteId = signal<string | null>(null)
  protected readonly saving = signal(false)
  protected readonly error = signal('')
  protected readonly pageSizeOptions = [5, 8, 10, 20, 50]
  protected readonly facturasPageIndex = signal(0); protected readonly clientesPageIndex = signal(0); protected readonly cobrosPageIndex = signal(0); protected readonly notasPageIndex = signal(0)
  protected readonly facturasSize = signal(8); protected readonly clientesSize = signal(8); protected readonly cobrosSize = signal(8); protected readonly notasSize = signal(8)
  protected readonly search = signal('')
  protected readonly estadoFilter = signal<'' | EstadoFactura>('')
  protected readonly fechaDesde = signal(this.firstDayOfCurrentMonth())
  protected readonly fechaHasta = signal(this.today())
  protected readonly tipoClienteOptions: TipoClienteFiscal[] = ['RESPONSABLE_INSCRIPTO','MONOTRIBUTO','EXENTO','CONSUMIDOR_FINAL']
  protected readonly tipoComprobanteOptions: TipoComprobante[] = ['FACTURA_A','FACTURA_B','FACTURA_C','RECIBO']
  protected readonly estadoOptions: EstadoFactura[] = ['EMITIDA','PARCIAL','COBRADA','VENCIDA','ANULADA']
  protected readonly metodoPagoOptions: MetodoPago[] = ['EFECTIVO','TRANSFERENCIA','CHEQUE','TARJETA','RETENCION','OTRO']
  protected readonly clienteForm = signal<ClienteRequest>({ razonSocial: '', cuit: '', condicionFiscal: 'RESPONSABLE_INSCRIPTO', email: '', telefono: '', direccion: '', activo: true })
  protected readonly facturaForm = signal<FacturaRequest>({ clienteId: '', operarioId: '', tipoComprobante: 'FACTURA_A', puntoVenta: '0001', fechaEmision: new Date().toISOString().slice(0,10), fechaVencimiento: new Date(Date.now()+15*86400000).toISOString().slice(0,10), observaciones: '', items: [{ descripcion: '', cantidad: 1, unidad: 'UN', precioUnitario: 0, ivaPorcentaje: 21 }] })
  protected readonly cobroForm = signal<CobroRequest>({ facturaId: '', operarioId: '', fecha: new Date().toISOString().slice(0,10), metodoPago: 'TRANSFERENCIA', importe: 0, referencia: '', observaciones: '' })
  protected readonly notaForm = signal<NotaCreditoRequest>({ facturaId: '', operarioId: '', fecha: new Date().toISOString().slice(0,10), importe: 0, motivo: '' })

  ngOnInit() { this.loadAll(); this.agricola.getInsumosActivos().subscribe({ next: v => this.insumos.set(v), error: () => undefined }) }
  protected loadAll() { this.loadDashboard(); this.loadFacturas(); this.loadClientes(); this.loadCobros(); this.loadNotas() }
  protected loadDashboard() { this.service.dashboard({ fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta() }).subscribe({ next: v => this.dashboard.set(v), error: () => undefined }) }
  protected loadFacturas() { this.service.facturas({ search: this.search(), estado: this.estadoFilter() || undefined, fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta(), page: this.facturasPageIndex(), size: this.facturasSize() }).subscribe({ next: v => this.facturasPage.set(v), error: () => this.error.set('No se pudieron cargar las facturas') }) }
  protected loadClientes() { this.service.clientes({ search: this.search(), page: this.clientesPageIndex(), size: this.clientesSize() }).subscribe({ next: v => this.clientesPage.set(v), error: () => undefined }) }
  protected loadCobros() { this.service.cobros({ page: this.cobrosPageIndex(), size: this.cobrosSize() }).subscribe({ next: v => this.cobrosPage.set(v), error: () => undefined }) }
  protected loadNotas() { this.service.notasCredito({ page: this.notasPageIndex(), size: this.notasSize() }).subscribe({ next: v => this.notasPage.set(v), error: () => undefined }) }
  protected applyFilters() { this.facturasPageIndex.set(0); this.clientesPageIndex.set(0); this.loadDashboard(); this.loadFacturas(); this.loadClientes() }
  protected pageNumbers(page: PageResponse<unknown> | null) { const total = page?.totalPages || 1; const current = (page?.number || 0) + 1; const start = Math.max(1, current - 2); const end = Math.min(total, start + 4); return Array.from({ length: end - start + 1 }, (_, i) => start + i) }
  protected setPage(kind: Tab, page: number) { const idx = page - 1; if (kind === 'FACTURAS') { this.facturasPageIndex.set(idx); this.loadFacturas() } if (kind === 'CLIENTES') { this.clientesPageIndex.set(idx); this.loadClientes() } if (kind === 'COBROS') { this.cobrosPageIndex.set(idx); this.loadCobros() } if (kind === 'NOTAS') { this.notasPageIndex.set(idx); this.loadNotas() } }
  protected changePage(kind: Tab, delta: number) { const page = this.pageFor(kind); const current = (page?.number || 0) + 1; this.setPage(kind, Math.max(1, Math.min(page?.totalPages || 1, current + delta))) }
  protected setSize(kind: Tab, size: string | number) { const value = Number(size); if (kind === 'FACTURAS') { this.facturasSize.set(value); this.facturasPageIndex.set(0); this.loadFacturas() } if (kind === 'CLIENTES') { this.clientesSize.set(value); this.clientesPageIndex.set(0); this.loadClientes() } if (kind === 'COBROS') { this.cobrosSize.set(value); this.cobrosPageIndex.set(0); this.loadCobros() } if (kind === 'NOTAS') { this.notasSize.set(value); this.notasPageIndex.set(0); this.loadNotas() } }
  protected pageFor(kind: Tab) { return kind === 'FACTURAS' ? this.facturasPage() : kind === 'CLIENTES' ? this.clientesPage() : kind === 'COBROS' ? this.cobrosPage() : this.notasPage() }
  protected sizeFor(kind: Tab) { return kind === 'FACTURAS' ? this.facturasSize() : kind === 'CLIENTES' ? this.clientesSize() : kind === 'COBROS' ? this.cobrosSize() : this.notasSize() }
  protected openModal(modal: Modal) { if (modal === 'CLIENTE') this.resetClienteForm(); this.modal.set(modal) }
  protected openEditCliente(cliente: ClienteFinanciero) {
    this.editingClienteId.set(cliente.id)
    this.clienteForm.set({
      razonSocial: cliente.razonSocial,
      cuit: cliente.cuit,
      condicionFiscal: cliente.condicionFiscal,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      activo: cliente.activo,
    })
    this.modal.set('CLIENTE')
  }
  protected closeModal() { this.modal.set(null); this.saving.set(false); this.editingClienteId.set(null) }
  protected addItem() { this.facturaForm.update(f => ({ ...f, items: [...f.items, { descripcion: '', cantidad: 1, unidad: 'UN', precioUnitario: 0, ivaPorcentaje: 21 }] })) }
  protected removeItem(i: number) { this.facturaForm.update(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })) }
  protected updateItem(i: number, patch: Record<string, unknown>) { this.facturaForm.update(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })) }
  protected selectInsumo(i: number, id: string) { const insumo = this.insumos().find(x => x.id === id); this.updateItem(i, { insumoId: id, descripcion: insumo?.nombre || '', unidad: insumo?.unidadMedida || 'UN', precioUnitario: insumo?.precioUnitario || 0 }) }
  protected submitCliente() {
    this.saving.set(true)
    const id = this.editingClienteId()
    const request = id ? this.service.updateCliente(id, this.cleanCliente()) : this.service.createCliente(this.cleanCliente())
    request.subscribe({ next: () => this.afterSave(), error: () => this.fail('No se pudo guardar el cliente') })
  }
  protected submitFactura() { this.saving.set(true); this.service.createFactura(this.cleanFactura()).subscribe({ next: () => this.afterSave(), error: () => this.fail('No se pudo emitir la factura') }) }
  protected submitCobro() { this.saving.set(true); this.service.createCobro(this.cleanCobro()).subscribe({ next: () => this.afterSave(), error: () => this.fail('No se pudo registrar el cobro') }) }
  protected submitNota() { this.saving.set(true); this.service.createNotaCredito(this.cleanNota()).subscribe({ next: () => this.afterSave(), error: () => this.fail('No se pudo registrar la nota de credito') }) }
  private afterSave() { this.closeModal(); this.loadAll() }
  private fail(msg: string) { this.saving.set(false); this.error.set(msg) }
  private cleanCliente(): ClienteRequest { const f = this.clienteForm(); return { ...f, email: f.email || undefined, telefono: f.telefono || undefined, direccion: f.direccion || undefined } }
  private cleanFactura(): FacturaRequest { const f = this.facturaForm(); return { ...f, operarioId: f.operarioId || undefined, observaciones: f.observaciones || undefined, items: f.items.map(i => ({ ...i, cantidad: Number(i.cantidad), precioUnitario: Number(i.precioUnitario), ivaPorcentaje: Number(i.ivaPorcentaje ?? 21) })) } }
  private cleanCobro(): CobroRequest { const f = this.cobroForm(); return { ...f, operarioId: f.operarioId || undefined, importe: Number(f.importe), referencia: f.referencia || undefined, observaciones: f.observaciones || undefined } }
  private cleanNota(): NotaCreditoRequest { const f = this.notaForm(); return { ...f, operarioId: f.operarioId || undefined, importe: Number(f.importe) } }
  private resetClienteForm() { this.editingClienteId.set(null); this.clienteForm.set({ razonSocial: '', cuit: '', condicionFiscal: 'RESPONSABLE_INSCRIPTO', email: '', telefono: '', direccion: '', activo: true }) }
  protected money(v?: number) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0)) }
  protected date(v?: string) { return v ? v.slice(0, 10) : 'Sin fecha' }
  private today() { return new Date().toISOString().slice(0, 10) }
  private firstDayOfCurrentMonth() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10) }
}

