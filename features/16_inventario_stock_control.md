# 16 - Inventario: Stock y Control

## DescripciÃ³n
Control centralizado de todos los stocks (materiales, repuestos, herramientas) con auditorÃ­a completa de movimientos.

## Funcionalidades Principales
- GestiÃ³n de mÃºltiples almacenes
- Entrada y salida de stock
- Devoluciones y ajustes
- Inventario fÃ­sico vs. sistema
- AuditorÃ­a de discrepancias

## Tareas
1. **Almacenes**: Registro de depÃ³sitos y ubicaciones
2. **Entrada de Stock**: RecepciÃ³n de compras, devoluciones de clientes
3. **Salida de Stock**: Ventas, uso interno, merma
4. **Movimientos**: Transferencias entre almacenes
5. **Ajustes**: Correcciones por inventario fÃ­sico
6. **AuditorÃ­a de Discrepancias**: Sistema vs. realidad
7. **Stock MÃ­nimo/MÃ¡ximo**: Por producto y almacÃ©n
8. **Reporte de Disponibilidad**: Stock por ubicaciÃ³n

## Servicios
- `AlmacenService`: GestiÃ³n de depÃ³sitos
- `MovimientoStockService`: Entrada, salida, transferencias
- `AuditStockService`: ValidaciÃ³n de discrepancias

## Repositorios
- `AlmacenRepository`
- `ProductoRepository`
- `MovimientoRepository`
- `AjusteRepository`

## Requisitos TÃ©cnicos
- UUID para productos y movimientos
- AuditorÃ­a completa de cambios
- Endpoint REST: `/api/v1/inventario/stock`
- Disponible offline (sincronizaciÃ³n)
- CÃ³digos de barras/QR para escaneo

## Integraciones Externas
- CÃ³digo de barras (EAN, UPC)
- Etiquetas QR

## Dependencias
- Insumos (parte del inventario)
- Finanzas (valorizaciÃ³n de stock)
- Compras (recepciÃ³n de materiales)
- Ventas (salida de stock)
- Reportes (anÃ¡lisis de rotaciÃ³n)

