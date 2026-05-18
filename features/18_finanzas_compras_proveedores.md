# 18 - Finanzas: Compras y Proveedores

## Descripción
Gestión de compras, proveedores y proceso de adquisición de insumos y materiales con control de presupuesto.

## Funcionalidades Principales
- Registro de proveedores
- Generación de órdenes de compra
- Recepción de materiales
- Control de pagos a proveedores
- Análisis de precios comparativos

## Tareas
1. **Proveedores**: Registro con datos de contacto y fiscales
2. **Catálogo de Precios**: Insumos disponibles por proveedor
3. **Orden de Compra**: Solicitud formal de materiales
4. **Cotizaciones**: Comparativa de precios entre proveedores
5. **Recepción**: Ingreso a stock de materiales comprados
6. **Facturación**: Recepción de factura de compra
7. **Pago a Proveedores**: Registro de pagos (efectivo, transferencia, cheque)
8. **Deuda a Proveedores**: Cuentas por pagar

## Servicios
- `ProveedorService`: Gestión de proveedores
- `OrdenCompraService`: Creación y seguimiento
- `CotizacionService`: Comparativa de precios
- `PagoService`: Registro de pagos

## Repositorios
- `ProveedorRepository`
- `OrdenCompraRepository`
- `CotizacionRepository`
- `FacturaCompraRepository`

## Requisitos Técnicos
- UUID para órdenes
- Auditoría completa
- Endpoint REST: `/api/v1/finanzas/compras`
- Disponible offline
- Alertas de vencimiento de pagos

## Integraciones Externas
- Proveedores (APIs de precios)
- AFIP (detalles de proveedores)

## Dependencias
- Inventario (materiales a comprar)
- Presupuesto (control de gasto)
- Reportes (análisis de compras)
