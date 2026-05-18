# 17 - Finanzas: Facturación y Ventas

## Descripción
Sistema completo de facturación, emisión de comprobantes y gestión de venta de productos agrícolas.

## Funcionalidades Principales
- Emisión de facturas y recibos
- Integración con AFIP
- Control de pagos
- Deuda de clientes
- Historial de transacciones

## Tareas
1. **Clientes**: Registro de compradores con datos fiscales
2. **Facturas**: Generación de comprobantes tipo A, B, C
3. **Integración AFIP**: Validación CAE, CAI, números de serie
4. **Cobro**: Registro de pagos (efectivo, tarjeta, cheque, transferencia)
5. **Deuda**: Seguimiento de cuentas por cobrar
6. **Devoluciones**: Notas de crédito y reembolsos
7. **Comprobantes**: Justificante impreso o digital
8. **Reportes Fiscales**: Libros de IVA, declaraciones juradas

## Servicios
- `FacturaService`: Emisión de comprobantes
- `CobroService`: Gestión de pagos
- `AFIPService`: Integración tributaria
- `ClienteService`: Gestión de datos fiscales

## Repositorios
- `FacturaRepository`
- `ClienteRepository`
- `CobroRepository`
- `DeudaRepository`

## Requisitos Técnicos
- UUID para facturas
- Auditoría completa de cambios
- Endpoint REST: `/api/v1/finanzas/facturacion`
- Generación de PDF
- Disponible offline (sincronización posterior)

## Integraciones Externas
- AFIP (Administración Federal de Ingresos Públicos)
- Pasarelas de pago (para cobro electrónico)
- Procesadores de tarjeta de crédito

## Dependencias
- Inventario (productos a vender)
- Operarios (quién vende)
- Reportes (informes de ventas)
