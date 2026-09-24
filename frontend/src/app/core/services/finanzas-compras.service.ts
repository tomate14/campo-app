import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { API_BASE_URL } from './api.config'
import type { ApiResponse, PageResponse } from '../models/agricola.models'
import type { MetodoPago, TipoClienteFiscal } from './finanzas.service'

function unwrap<T>(response: ApiResponse<T> | T): T {
  return response && typeof response === 'object' && 'data' in (response as Record<string, unknown>) ? (response as ApiResponse<T>).data : response as T
}

function clean(params?: Record<string, unknown>) {
  if (!params) return undefined
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')) as Record<string, string | number | boolean>
}

export type EstadoCompra = 'REGISTRADA' | 'PARCIAL' | 'PAGADA' | 'VENCIDA' | 'ANULADA'
export type TipoComprobanteCompra = 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'REMITO' | 'TICKET' | 'ORDEN_COMPRA'

export interface ComprasDashboard { proveedoresActivos: number; comprasRegistradas: number; comprasPeriodo: number; cuentasPorPagar: number; pagadoPeriodo: number; comprasVencidas: number }
export interface ProveedorFinanciero { id: string; razonSocial: string; cuit: string; condicionFiscal: TipoClienteFiscal; email?: string; telefono?: string; direccion?: string; categoria?: string; activo: boolean }
export interface ProveedorRequest { razonSocial: string; cuit: string; condicionFiscal: TipoClienteFiscal; email?: string; telefono?: string; direccion?: string; categoria?: string; activo?: boolean }
export interface CompraItemRequest { insumoId?: string; descripcion: string; cantidad: number; unidad: string; precioUnitario: number; ivaPorcentaje?: number }
// Feature 84: atribución de la compra a lotes (prorrateo por hectárea en el backend).
export interface CompraRequest { proveedorId: string; operarioId?: string; tipoComprobante: TipoComprobanteCompra; numeroComprobante: string; fechaEmision: string; fechaVencimiento: string; observaciones?: string; loteIds?: string[]; items: CompraItemRequest[] }
export interface CompraItemProveedor { id: string; insumoId?: string; insumoNombre?: string; descripcion: string; cantidad: number; unidad: string; precioUnitario: number; ivaPorcentaje: number; subtotal: number }
// Feature 84: lote atribuido a una compra (con superficie para el prorrateo).
export interface CompraLote { loteId: string; loteNombre: string; area: number }
export interface CompraProveedor { id: string; proveedorId: string; proveedorRazonSocial: string; proveedorCuit: string; operarioId?: string; operarioNombre?: string; tipoComprobante: TipoComprobanteCompra; numeroComprobante: string; fechaEmision: string; fechaVencimiento: string; estado: EstadoCompra; subtotal: number; iva: number; total: number; saldoPendiente: number; observaciones?: string; loteIds?: string[]; lotes?: CompraLote[]; items?: CompraItemProveedor[] }
export interface PagoProveedorRequest { compraId: string; operarioId?: string; fecha: string; metodoPago: MetodoPago; importe: number; referencia?: string; observaciones?: string }
export interface PagoProveedor { id: string; compraId: string; comprobante: string; proveedorRazonSocial: string; operarioId?: string; operarioNombre?: string; fecha: string; metodoPago: MetodoPago; importe: number; referencia?: string; observaciones?: string }

@Injectable({ providedIn: 'root' })
export class FinanzasComprasService {
  private readonly http = inject(HttpClient)
  private readonly base = `${API_BASE_URL}/finanzas/compras-proveedores`

  dashboard(params?: { fechaDesde?: string; fechaHasta?: string }) {
    return this.http.get<ApiResponse<ComprasDashboard> | ComprasDashboard>(`${this.base}/dashboard`, { params: clean(params) }).pipe(map(unwrap))
  }

  proveedores(params?: { search?: string; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<ProveedorFinanciero>> | PageResponse<ProveedorFinanciero>>(`${this.base}/proveedores`, { params: clean(params) }).pipe(map(unwrap))
  }

  createProveedor(data: ProveedorRequest) {
    return this.http.post<ApiResponse<ProveedorFinanciero> | ProveedorFinanciero>(`${this.base}/proveedores`, data).pipe(map(unwrap))
  }

  updateProveedor(id: string, data: ProveedorRequest) {
    return this.http.put<ApiResponse<ProveedorFinanciero> | ProveedorFinanciero>(`${this.base}/proveedores/${id}`, data).pipe(map(unwrap))
  }

  deleteProveedor(id: string) {
    return this.http.delete(`${this.base}/proveedores/${id}`)
  }

  compras(params?: { search?: string; estado?: EstadoCompra; fechaDesde?: string; fechaHasta?: string; page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<CompraProveedor>> | PageResponse<CompraProveedor>>(`${this.base}/compras`, { params: clean(params) }).pipe(map(unwrap))
  }

  createCompra(data: CompraRequest) {
    return this.http.post<ApiResponse<CompraProveedor> | CompraProveedor>(`${this.base}/compras`, data).pipe(map(unwrap))
  }

  pagos(params?: { page?: number; size?: number }) {
    return this.http.get<ApiResponse<PageResponse<PagoProveedor>> | PageResponse<PagoProveedor>>(`${this.base}/pagos`, { params: clean(params) }).pipe(map(unwrap))
  }

  createPago(data: PagoProveedorRequest) {
    return this.http.post<ApiResponse<PagoProveedor> | PagoProveedor>(`${this.base}/pagos`, data).pipe(map(unwrap))
  }
}
