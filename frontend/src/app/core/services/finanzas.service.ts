import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { API_BASE_URL } from './api.config'
import type { ApiResponse, PageResponse } from '../models/agricola.models'

function unwrap<T>(response: ApiResponse<T> | T): T {
  return response && typeof response === 'object' && 'data' in (response as Record<string, unknown>) ? (response as ApiResponse<T>).data : response as T
}
function clean(params?: Record<string, unknown>) {
  if (!params) return undefined
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')) as Record<string, string | number | boolean>
}

export type TipoClienteFiscal = 'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTO' | 'EXENTO' | 'CONSUMIDOR_FINAL'
export type TipoComprobante = 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'RECIBO' | 'NOTA_CREDITO_A' | 'NOTA_CREDITO_B' | 'NOTA_CREDITO_C'
export type EstadoFactura = 'BORRADOR' | 'EMITIDA' | 'PARCIAL' | 'COBRADA' | 'VENCIDA' | 'ANULADA'
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE' | 'TARJETA' | 'RETENCION' | 'OTRO'

export interface FacturacionDashboard { clientesActivos: number; facturasEmitidas: number; ventasMes: number; cuentasPorCobrar: number; cobradoMes: number; vencidas: number }
export interface ClienteFinanciero { id: string; razonSocial: string; cuit: string; condicionFiscal: TipoClienteFiscal; email?: string; telefono?: string; direccion?: string; activo: boolean }
export interface ClienteRequest { razonSocial: string; cuit: string; condicionFiscal: TipoClienteFiscal; email?: string; telefono?: string; direccion?: string; activo?: boolean }
export interface FacturaItemRequest { insumoId?: string; descripcion: string; cantidad: number; unidad: string; precioUnitario: number; ivaPorcentaje?: number }
export interface FacturaRequest { clienteId: string; operarioId?: string; tipoComprobante: TipoComprobante; puntoVenta: string; fechaEmision: string; fechaVencimiento: string; observaciones?: string; items: FacturaItemRequest[] }
export interface FacturaVenta { id: string; clienteId: string; clienteRazonSocial: string; clienteCuit: string; operarioId?: string; operarioNombre?: string; tipoComprobante: TipoComprobante; puntoVenta: string; numeroComprobante: string; fechaEmision: string; fechaVencimiento: string; estado: EstadoFactura; estadoFiscal: string; cae?: string; subtotal: number; iva: number; total: number; saldoPendiente: number; observaciones?: string }
export interface CobroRequest { facturaId: string; operarioId?: string; fecha: string; metodoPago: MetodoPago; importe: number; referencia?: string; observaciones?: string }
export interface CobroVenta { id: string; facturaId: string; comprobante: string; clienteRazonSocial: string; operarioId?: string; operarioNombre?: string; fecha: string; metodoPago: MetodoPago; importe: number; referencia?: string }
export interface NotaCreditoRequest { facturaId: string; operarioId?: string; fecha: string; importe: number; motivo: string }
export interface NotaCreditoVenta { id: string; facturaId: string; comprobante: string; clienteRazonSocial: string; operarioId?: string; operarioNombre?: string; fecha: string; importe: number; motivo: string; cae?: string }

@Injectable({ providedIn: 'root' })
export class FinanzasService {
  private readonly http = inject(HttpClient)
  private readonly base = `${API_BASE_URL}/finanzas/facturacion`
  dashboard(params?: { fechaDesde?: string; fechaHasta?: string }) { return this.http.get<ApiResponse<FacturacionDashboard> | FacturacionDashboard>(`${this.base}/dashboard`, { params: clean(params) }).pipe(map(unwrap)) }
  clientes(params?: { search?: string; page?: number; size?: number }) { return this.http.get<ApiResponse<PageResponse<ClienteFinanciero>> | PageResponse<ClienteFinanciero>>(`${this.base}/clientes`, { params: clean(params) }).pipe(map(unwrap)) }
  createCliente(data: ClienteRequest) { return this.http.post<ApiResponse<ClienteFinanciero> | ClienteFinanciero>(`${this.base}/clientes`, data).pipe(map(unwrap)) }
  updateCliente(id: string, data: ClienteRequest) { return this.http.put<ApiResponse<ClienteFinanciero> | ClienteFinanciero>(`${this.base}/clientes/${id}`, data).pipe(map(unwrap)) }
  deleteCliente(id: string) { return this.http.delete(`${this.base}/clientes/${id}`) }
  facturas(params?: { search?: string; estado?: EstadoFactura; fechaDesde?: string; fechaHasta?: string; page?: number; size?: number }) { return this.http.get<ApiResponse<PageResponse<FacturaVenta>> | PageResponse<FacturaVenta>>(`${this.base}/facturas`, { params: clean(params) }).pipe(map(unwrap)) }
  createFactura(data: FacturaRequest) { return this.http.post<ApiResponse<FacturaVenta> | FacturaVenta>(`${this.base}/facturas`, data).pipe(map(unwrap)) }
  cobros(params?: { page?: number; size?: number }) { return this.http.get<ApiResponse<PageResponse<CobroVenta>> | PageResponse<CobroVenta>>(`${this.base}/cobros`, { params: clean(params) }).pipe(map(unwrap)) }
  createCobro(data: CobroRequest) { return this.http.post<ApiResponse<CobroVenta> | CobroVenta>(`${this.base}/cobros`, data).pipe(map(unwrap)) }
  notasCredito(params?: { page?: number; size?: number }) { return this.http.get<ApiResponse<PageResponse<NotaCreditoVenta>> | PageResponse<NotaCreditoVenta>>(`${this.base}/notas-credito`, { params: clean(params) }).pipe(map(unwrap)) }
  createNotaCredito(data: NotaCreditoRequest) { return this.http.post<ApiResponse<NotaCreditoVenta> | NotaCreditoVenta>(`${this.base}/notas-credito`, data).pipe(map(unwrap)) }
}
