import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgricolaService } from '../../core/services/agricola.service';
import { FinanzasComprasService, type ProveedorFinanciero } from '../../core/services/finanzas-compras.service';
import { OperariosService } from '../../core/services/operarios.service';
import type { Operario } from '../../core/models/operarios.models';
import { RemoteSearchSelectComponent } from '../../shared/remote-search-select/remote-search-select.component';
import type {
  InsumoAgricola,
  InsumoAgricolaRequest,
  InsumosDashboard,
  Lote,
  MovimientoInsumo,
  MovimientoInsumoRequest,
  PageResponse,
  StockInsumo,
  StockInsumoRequest,
  TipoInsumoAgricola,
  TipoMovimientoInsumo,
  UnidadMedidaInsumo,
} from '../../core/models/agricola.models';

type ModalType = 'INSUMO' | 'STOCK' | 'MOVIMIENTO' | null;

@Component({
  selector: 'app-agricola-insumos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RemoteSearchSelectComponent],
  templateUrl: './agricola-insumos-page.component.html',
  styleUrl: './agricola-insumos-page.component.css',
})
export class AgricolaInsumosPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);
  private readonly comprasService = inject(FinanzasComprasService);
  private readonly operariosService = inject(OperariosService);

  protected readonly dashboard = signal<InsumosDashboard | null>(null);
  protected readonly insumosPage = signal<PageResponse<InsumoAgricola> | null>(null);
  protected readonly stockPage = signal<PageResponse<StockInsumo> | null>(null);
  protected readonly movimientosPage = signal<PageResponse<MovimientoInsumo> | null>(null);
  protected readonly reordenPage = signal<PageResponse<InsumoAgricola> | null>(null);
  protected readonly vencimientosPage = signal<PageResponse<StockInsumo> | null>(null);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly insumosActivos = signal<InsumoAgricola[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly modal = signal<ModalType>(null);
  protected readonly editingInsumoId = signal<string | null>(null);
  protected readonly activeDetailTab = signal<'STOCK' | 'MOVIMIENTOS'>('STOCK');
  protected readonly activeAlertTab = signal<'REORDEN' | 'VENCIMIENTOS'>('REORDEN');
  protected readonly errorMessage = signal('');
  // Catalogos cargados una sola vez para los selects con buscador (feature 62)
  protected readonly proveedores = signal<ProveedorFinanciero[]>([]);
  protected readonly operarios = signal<Operario[]>([]);
  protected readonly operariosActivos = computed(() => this.operarios().filter((o) => o.estado === 'ACTIVO'));
  protected readonly filters = signal<{ search: string; tipo: '' | TipoInsumoAgricola; activo: '' | 'true' | 'false' }>({ search: '', tipo: '', activo: '' });
  protected readonly insumoPageIndex = signal(0);
  protected readonly stockPageIndex = signal(0);
  protected readonly movimientosPageIndex = signal(0);
  protected readonly reordenPageIndex = signal(0);
  protected readonly vencimientosPageIndex = signal(0);
  protected readonly insumoPageSize = signal(8);
  protected readonly stockPageSize = signal(8);
  protected readonly movimientosPageSize = signal(8);
  protected readonly reordenPageSize = signal(8);
  protected readonly vencimientosPageSize = signal(8);
  protected readonly pageSizeOptions = [5, 8, 10, 20, 50];

  protected readonly tipoOptions: TipoInsumoAgricola[] = ['SEMILLA', 'FERTILIZANTE', 'FITOSANITARIO', 'HERBICIDA', 'FUNGICIDA', 'INSECTICIDA', 'COADYUVANTE', 'COMBUSTIBLE', 'OTRO'];
  protected readonly unidadOptions: UnidadMedidaInsumo[] = ['KG', 'L', 'UN', 'BOLSA', 'DOSIS', 'TN'];
  protected readonly movimientoOptions: TipoMovimientoInsumo[] = ['INGRESO', 'USO', 'SALIDA', 'AJUSTE'];
  protected readonly insumosSelectOptions = computed(() => this.insumosActivos() as object[]);

  protected readonly insumoForm = signal<InsumoAgricolaRequest>({
    codigo: '',
    nombre: '',
    tipo: 'SEMILLA',
    marca: '',
    presentacion: '',
    unidadMedida: 'KG',
    principioActivo: '',
    proveedorId: '',
    proveedor: '',
    origen: '',
    descripcion: '',
    precioUnitario: undefined,
    stockMinimo: 0,
    stockMaximo: undefined,
    activo: true,
  });

  protected readonly stockForm = signal<StockInsumoRequest>({
    insumoId: '',
    loteStock: '',
    cantidadDisponible: 0,
    fechaVencimiento: '',
    ubicacionDeposito: '',
    deposito: '',
    responsableId: '',
    observaciones: '',
  });

  protected readonly movimientoForm = signal<MovimientoInsumoRequest>({
    insumoId: '',
    stockId: '',
    loteId: '',
    fecha: new Date().toISOString().slice(0, 16),
    tipoMovimiento: 'USO',
    cantidad: 0,
    costoUnitario: undefined,
    responsableId: '',
    tareaReferencia: '',
    proveedor: '',
    origen: '',
    destino: '',
    observaciones: '',
  });

  protected readonly stockDisponibleSeleccionado = signal<StockInsumo[]>([]);

  protected readonly kpis = computed(() => {
    const dashboard = this.dashboard();
    return [
      { label: 'Insumos activos', value: dashboard?.insumosActivos ?? 0, sub: 'Catalogo operativo', tone: 'green' },
      { label: 'Reorden pendiente', value: dashboard?.reordenPendiente ?? 0, sub: 'Bajo minimo', tone: 'orange' },
      { label: 'Vencimientos', value: dashboard?.lotesPorVencer ?? 0, sub: 'Proximos 30 dias', tone: 'red' },
      { label: 'Stock valorizado', value: this.money(dashboard?.stockValorizado ?? 0), sub: 'Costo inventariado', tone: 'blue' },
    ];
  });

  ngOnInit(): void {
    this.loadAll();
  }

  protected loadAll() {
    this.loadDashboard();
    this.loadInsumos();
    this.loadAlertasReorden();
    this.loadVencimientosProximos();
    this.loadStock();
    this.loadMovimientos();
    this.agricolaService.getLotes().subscribe({ next: (lotes) => this.lotes.set(lotes), error: () => undefined });
    this.agricolaService.getInsumosActivos().subscribe({ next: (insumos) => this.insumosActivos.set(insumos), error: () => undefined });
    // Cargar catalogos una sola vez para los selects con buscador (feature 62)
    this.comprasService.proveedores({ size: 1000 }).subscribe({ next: (page) => this.proveedores.set(page.content), error: () => undefined });
    this.operariosService.getOperarios().subscribe({ next: (operarios) => this.operarios.set(operarios), error: () => undefined });
  }

  protected loadDashboard() {
    this.agricolaService.getInsumosDashboard().subscribe({ next: (dashboard) => this.dashboard.set(dashboard), error: () => undefined });
  }

  protected loadInsumos() {
    this.loading.set(true);
    const filters = this.filters();
    this.agricolaService.getInsumos({
      search: filters.search,
      tipo: filters.tipo || undefined,
      activo: filters.activo === '' ? undefined : filters.activo === 'true',
      page: this.insumoPageIndex(),
      size: this.insumoPageSize(),
    }).subscribe({
      next: (page) => {
        this.insumosPage.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el inventario de insumos.');
        this.loading.set(false);
      },
    });
  }

  protected loadStock() {
    this.agricolaService.getStockInsumos({ page: this.stockPageIndex(), size: this.stockPageSize() }).subscribe({ next: (page) => this.stockPage.set(page), error: () => undefined });
  }

  protected loadMovimientos() {
    this.agricolaService.getMovimientosInsumos({ page: this.movimientosPageIndex(), size: this.movimientosPageSize() }).subscribe({ next: (page) => this.movimientosPage.set(page), error: () => undefined });
  }

  protected loadAlertasReorden() {
    this.agricolaService.getAlertasReordenInsumos({ page: this.reordenPageIndex(), size: this.reordenPageSize() }).subscribe({ next: (page) => this.reordenPage.set(page), error: () => undefined });
  }

  protected loadVencimientosProximos() {
    this.agricolaService.getVencimientosProximosInsumos({ page: this.vencimientosPageIndex(), size: this.vencimientosPageSize() }).subscribe({ next: (page) => this.vencimientosPage.set(page), error: () => undefined });
  }

  protected applyFilters() {
    this.insumoPageIndex.set(0);
    this.loadInsumos();
  }

  protected openInsumoModal() {
    this.editingInsumoId.set(null);
    this.insumoForm.set({
      codigo: '',
      nombre: '',
      tipo: 'SEMILLA',
      marca: '',
      presentacion: '',
      unidadMedida: 'KG',
      principioActivo: '',
      proveedorId: '',
      proveedor: '',
      origen: '',
      descripcion: '',
      precioUnitario: undefined,
      stockMinimo: 0,
      stockMaximo: undefined,
      activo: true,
    });
    this.modal.set('INSUMO');
  }

  protected openEditInsumoModal(insumo: InsumoAgricola) {
    this.editingInsumoId.set(insumo.id);
    this.insumoForm.set({
      codigo: insumo.codigo,
      nombre: insumo.nombre,
      tipo: insumo.tipo,
      marca: insumo.marca || '',
      presentacion: insumo.presentacion || '',
      unidadMedida: insumo.unidadMedida,
      principioActivo: insumo.principioActivo || '',
      proveedorId: insumo.proveedorId || '',
      proveedor: insumo.proveedor || '',
      origen: insumo.origen || '',
      descripcion: insumo.descripcion || '',
      precioUnitario: insumo.precioUnitario,
      stockMinimo: insumo.stockMinimo,
      stockMaximo: insumo.stockMaximo,
      activo: insumo.activo,
    });
    this.modal.set('INSUMO');
  }

  protected openStockModal(insumo?: InsumoAgricola) {
    this.stockForm.set({
      insumoId: insumo?.id ?? '',
      loteStock: '',
      cantidadDisponible: 0,
      fechaVencimiento: '',
      ubicacionDeposito: '',
      deposito: '',
      responsableId: '',
      observaciones: '',
    });
    this.modal.set('STOCK');
  }

  protected openMovimientoModal(insumo?: InsumoAgricola) {
    const insumoId = insumo?.id ?? '';
    this.movimientoForm.set({
      insumoId,
      stockId: '',
      loteId: '',
      fecha: new Date().toISOString().slice(0, 16),
      tipoMovimiento: 'USO',
      cantidad: 0,
      costoUnitario: insumo?.precioUnitario,
      responsableId: '',
      tareaReferencia: '',
      proveedor: '',
      origen: '',
      destino: '',
      observaciones: '',
    });
    this.stockDisponibleSeleccionado.set([]);
    if (insumoId) {
      this.loadStockForMovimiento(insumoId);
    }
    this.modal.set('MOVIMIENTO');
  }

  protected closeModal() {
    this.modal.set(null);
  }

  protected updateMovimientoInsumo(insumoId: string) {
    this.movimientoForm.update((form) => ({ ...form, insumoId, stockId: '' }));
    this.loadStockForMovimiento(insumoId);
  }

  protected loadStockForMovimiento(insumoId: string) {
    if (!insumoId) {
      this.stockDisponibleSeleccionado.set([]);
      return;
    }
    this.agricolaService.getStockPorInsumo(insumoId).subscribe({
      next: (stock) => this.stockDisponibleSeleccionado.set(stock.filter((item) => Number(item.cantidadDisponible) > 0)),
      error: () => this.stockDisponibleSeleccionado.set([]),
    });
  }

  protected submitInsumo() {
    this.saving.set(true);
    const id = this.editingInsumoId();
    const request = this.normalizeInsumo(this.insumoForm());
    const operation = id ? this.agricolaService.updateInsumo(id, request) : this.agricolaService.createInsumo(request);
    operation.subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el insumo.'),
    });
  }

  protected deleteInsumo(insumo: InsumoAgricola) {
    const confirmed = window.confirm(`Eliminar el insumo "${insumo.nombre}"? Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }
    this.saving.set(true);
    this.agricolaService.deleteInsumo(insumo.id).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo eliminar el insumo.'),
    });
  }

  protected submitStock() {
    this.saving.set(true);
    this.agricolaService.createStockInsumo(this.normalizeStock(this.stockForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el stock.'),
    });
  }

  protected submitMovimiento() {
    this.saving.set(true);
    this.agricolaService.createMovimientoInsumo(this.normalizeMovimiento(this.movimientoForm())).subscribe({
      next: () => this.afterSave(),
      error: () => this.failSave('No se pudo registrar el movimiento.'),
    });
  }

  protected changeInsumoPage(delta: number) {
    const page = this.insumosPage();
    const next = Math.max(0, Math.min((page?.totalPages ?? 1) - 1, this.insumoPageIndex() + delta));
    this.insumoPageIndex.set(next);
    this.loadInsumos();
  }

  protected changeStockPage(delta: number) {
    const page = this.stockPage();
    const next = Math.max(0, Math.min((page?.totalPages ?? 1) - 1, this.stockPageIndex() + delta));
    this.stockPageIndex.set(next);
    this.loadStock();
  }

  protected changeMovimientosPage(delta: number) {
    const page = this.movimientosPage();
    const next = Math.max(0, Math.min((page?.totalPages ?? 1) - 1, this.movimientosPageIndex() + delta));
    this.movimientosPageIndex.set(next);
    this.loadMovimientos();
  }

  protected changeReordenPage(delta: number) {
    const page = this.reordenPage();
    const next = Math.max(0, Math.min((page?.totalPages ?? 1) - 1, this.reordenPageIndex() + delta));
    this.reordenPageIndex.set(next);
    this.loadAlertasReorden();
  }

  protected changeVencimientosPage(delta: number) {
    const page = this.vencimientosPage();
    const next = Math.max(0, Math.min((page?.totalPages ?? 1) - 1, this.vencimientosPageIndex() + delta));
    this.vencimientosPageIndex.set(next);
    this.loadVencimientosProximos();
  }

  protected pageNumbers(page: PageResponse<unknown> | null) {
    const total = page?.totalPages || 1;
    const current = (page?.number || 0) + 1;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  protected setInsumoPage(pageNumber: number) {
    this.insumoPageIndex.set(pageNumber - 1);
    this.loadInsumos();
  }

  protected setStockPage(pageNumber: number) {
    this.stockPageIndex.set(pageNumber - 1);
    this.loadStock();
  }

  protected setMovimientosPage(pageNumber: number) {
    this.movimientosPageIndex.set(pageNumber - 1);
    this.loadMovimientos();
  }

  protected setReordenPage(pageNumber: number) {
    this.reordenPageIndex.set(pageNumber - 1);
    this.loadAlertasReorden();
  }

  protected setVencimientosPage(pageNumber: number) {
    this.vencimientosPageIndex.set(pageNumber - 1);
    this.loadVencimientosProximos();
  }

  protected setInsumoPageSize(size: number | string) {
    this.insumoPageSize.set(Number(size));
    this.insumoPageIndex.set(0);
    this.loadInsumos();
  }

  protected setStockPageSize(size: number | string) {
    this.stockPageSize.set(Number(size));
    this.stockPageIndex.set(0);
    this.loadStock();
  }

  protected setMovimientosPageSize(size: number | string) {
    this.movimientosPageSize.set(Number(size));
    this.movimientosPageIndex.set(0);
    this.loadMovimientos();
  }

  protected setReordenPageSize(size: number | string) {
    this.reordenPageSize.set(Number(size));
    this.reordenPageIndex.set(0);
    this.loadAlertasReorden();
  }

  protected setVencimientosPageSize(size: number | string) {
    this.vencimientosPageSize.set(Number(size));
    this.vencimientosPageIndex.set(0);
    this.loadVencimientosProximos();
  }

  protected money(value?: number) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value ?? 0));
  }

  protected number(value?: number) {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
  }

  protected date(value?: string) {
    return value ? value.slice(0, 10) : 'Sin fecha';
  }

  private afterSave() {
    this.saving.set(false);
    this.editingInsumoId.set(null);
    this.closeModal();
    this.loadAll();
  }

  private failSave(message: string) {
    this.saving.set(false);
    this.errorMessage.set(message);
  }

  private normalizeInsumo(form: InsumoAgricolaRequest): InsumoAgricolaRequest {
    return {
      ...form,
      marca: form.marca || undefined,
      presentacion: form.presentacion || undefined,
      principioActivo: form.principioActivo || undefined,
      proveedorId: form.proveedorId || undefined,
      proveedor: form.proveedor || undefined,
      origen: form.origen || undefined,
      descripcion: form.descripcion || undefined,
      precioUnitario: form.precioUnitario === undefined || form.precioUnitario === null ? undefined : Number(form.precioUnitario),
      stockMinimo: form.stockMinimo === undefined || form.stockMinimo === null ? 0 : Number(form.stockMinimo),
      stockMaximo: form.stockMaximo === undefined || form.stockMaximo === null ? undefined : Number(form.stockMaximo),
    };
  }

  private normalizeStock(form: StockInsumoRequest): StockInsumoRequest {
    return {
      ...form,
      cantidadDisponible: Number(form.cantidadDisponible ?? 0),
      fechaVencimiento: form.fechaVencimiento || undefined,
      loteStock: form.loteStock || undefined,
      ubicacionDeposito: form.ubicacionDeposito || undefined,
      deposito: form.deposito || undefined,
      responsableId: form.responsableId || undefined,
      observaciones: form.observaciones || undefined,
    };
  }

  private normalizeMovimiento(form: MovimientoInsumoRequest): MovimientoInsumoRequest {
    return {
      ...form,
      stockId: form.stockId || undefined,
      loteId: form.loteId || undefined,
      fecha: form.fecha || undefined,
      cantidad: Number(form.cantidad ?? 0),
      costoUnitario: form.costoUnitario === undefined || form.costoUnitario === null ? undefined : Number(form.costoUnitario),
      responsableId: form.responsableId || undefined,
      tareaReferencia: form.tareaReferencia || undefined,
      proveedor: form.proveedor || undefined,
      origen: form.origen || undefined,
      destino: form.destino || undefined,
      observaciones: form.observaciones || undefined,
    };
  }
}
