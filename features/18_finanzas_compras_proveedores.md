# 18 - Finanzas: Compras y Proveedores

## DescripciÃ³n
GestiÃ³n de compras, proveedores y proceso de adquisiciÃ³n de insumos y materiales con control de presupuesto.

## Funcionalidades Principales
- Registro de proveedores
- GeneraciÃ³n de Ã³rdenes de compra
- RecepciÃ³n de materiales
- Control de pagos a proveedores
- AnÃ¡lisis de precios comparativos

## Tareas
1. **Proveedores**: Registro con datos de contacto y fiscales
2. **CatÃ¡logo de Precios**: Insumos disponibles por proveedor
3. **Orden de Compra**: Solicitud formal de materiales
4. **Cotizaciones**: Comparativa de precios entre proveedores
5. **RecepciÃ³n**: Ingreso a stock de materiales comprados
6. **FacturaciÃ³n**: RecepciÃ³n de factura de compra
7. **Pago a Proveedores**: Registro de pagos (efectivo, transferencia, cheque)
8. **Deuda a Proveedores**: Cuentas por pagar

## Servicios
- `ProveedorService`: GestiÃ³n de proveedores
- `OrdenCompraService`: CreaciÃ³n y seguimiento
- `CotizacionService`: Comparativa de precios
- `PagoService`: Registro de pagos

## Repositorios
- `ProveedorRepository`
- `OrdenCompraRepository`
- `CotizacionRepository`
- `FacturaCompraRepository`

## Requisitos TÃ©cnicos
- UUID para Ã³rdenes
- AuditorÃ­a completa
- Endpoint REST: `/api/v1/finanzas/compras`
- Disponible offline
- Alertas de vencimiento de pagos

## Integraciones Externas
- Proveedores (APIs de precios)
- AFIP (detalles de proveedores)

## Dependencias
- Inventario (materiales a comprar)
- Presupuesto (control de gasto)
- Reportes (anÃ¡lisis de compras)

