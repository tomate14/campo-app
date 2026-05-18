# 16 - Inventario: Stock y Control

## Descripción
Control centralizado de todos los stocks (materiales, repuestos, herramientas) con auditoría completa de movimientos.

## Funcionalidades Principales
- Gestión de múltiples almacenes
- Entrada y salida de stock
- Devoluciones y ajustes
- Inventario físico vs. sistema
- Auditoría de discrepancias

## Tareas
1. **Almacenes**: Registro de depósitos y ubicaciones
2. **Entrada de Stock**: Recepción de compras, devoluciones de clientes
3. **Salida de Stock**: Ventas, uso interno, merma
4. **Movimientos**: Transferencias entre almacenes
5. **Ajustes**: Correcciones por inventario físico
6. **Auditoría de Discrepancias**: Sistema vs. realidad
7. **Stock Mínimo/Máximo**: Por producto y almacén
8. **Reporte de Disponibilidad**: Stock por ubicación

## Servicios
- `AlmacenService`: Gestión de depósitos
- `MovimientoStockService`: Entrada, salida, transferencias
- `AuditStockService`: Validación de discrepancias

## Repositorios
- `AlmacenRepository`
- `ProductoRepository`
- `MovimientoRepository`
- `AjusteRepository`

## Requisitos Técnicos
- UUID para productos y movimientos
- Auditoría completa de cambios
- Endpoint REST: `/api/v1/inventario/stock`
- Disponible offline (sincronización)
- Códigos de barras/QR para escaneo

## Integraciones Externas
- Código de barras (EAN, UPC)
- Etiquetas QR

## Dependencias
- Insumos (parte del inventario)
- Finanzas (valorización de stock)
- Compras (recepción de materiales)
- Ventas (salida de stock)
- Reportes (análisis de rotación)
