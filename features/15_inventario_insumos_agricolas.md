# 15 - Inventario: Insumos AgrÃ­colas

## DescripciÃ³n
GestiÃ³n integral del stock de insumos agrÃ­colas (semillas, fertilizantes, fitosanitarios, etc.) con alertas de reorden.

## Funcionalidades Principales
- CatÃ¡logo de insumos
- Stock en tiempo real
- Niveles mÃ­nimos y mÃ¡ximos
- Lotes y vencimientos
- Trazabilidad de uso

## Tareas
1. **CatÃ¡logo de Insumos**: Tipo, marca, presentaciÃ³n, cÃ³digo
2. **Registro de Stock**: Cantidad disponible por insumo
3. **UbicaciÃ³n en DepÃ³sito**: DÃ³nde se almacena cada insumo
4. **Lote y Vencimiento**: Control de fecha de caducidad
5. **Precio Unitario**: Costo de cada insumo
6. **Nivel MÃ­nimo de Reorden**: Alertas automÃ¡ticas
7. **Registro de Uso**: QuÃ© insumo se usÃ³ en quÃ© lote/tarea
8. **Trazabilidad Inversa**: De dÃ³nde proviene cada insumo

## Servicios
- `InsumoService`: CRUD de insumos
- `StockService`: GestiÃ³n de cantidades
- `ReordenService`: Alertas y sugerencias

## Repositorios
- `InsumoRepository`
- `StockRepository`
- `MovimientoInsumoRepository`

## Requisitos TÃ©cnicos
- UUID para insumos
- AuditorÃ­a de movimientos de stock
- Endpoint REST: `/api/v1/inventario/insumos`
- Disponible offline (sincronizaciÃ³n de cambios)
- Notificaciones de vencimiento

## Integraciones Externas
- Proveedores (para reorden automÃ¡tica)
- CÃ³digos de barras (para escaneo)

## Dependencias
- Siembra-Cosecha (uso de insumos)
- Sanidad (vacunas y medicinas)
- Finanzas (costo de insumos)
- Reportes (anÃ¡lisis de uso)

