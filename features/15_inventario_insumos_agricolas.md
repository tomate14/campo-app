# 15 - Inventario: Insumos Agrícolas

## Descripción
Gestión integral del stock de insumos agrícolas (semillas, fertilizantes, fitosanitarios, etc.) con alertas de reorden.

## Funcionalidades Principales
- Catálogo de insumos
- Stock en tiempo real
- Niveles mínimos y máximos
- Lotes y vencimientos
- Trazabilidad de uso

## Tareas
1. **Catálogo de Insumos**: Tipo, marca, presentación, código
2. **Registro de Stock**: Cantidad disponible por insumo
3. **Ubicación en Depósito**: Dónde se almacena cada insumo
4. **Lote y Vencimiento**: Control de fecha de caducidad
5. **Precio Unitario**: Costo de cada insumo
6. **Nivel Mínimo de Reorden**: Alertas automáticas
7. **Registro de Uso**: Qué insumo se usó en qué lote/tarea
8. **Trazabilidad Inversa**: De dónde proviene cada insumo

## Servicios
- `InsumoService`: CRUD de insumos
- `StockService`: Gestión de cantidades
- `ReordenService`: Alertas y sugerencias

## Repositorios
- `InsumoRepository`
- `StockRepository`
- `MovimientoInsumoRepository`

## Requisitos Técnicos
- UUID para insumos
- Auditoría de movimientos de stock
- Endpoint REST: `/api/v1/inventario/insumos`
- Disponible offline (sincronización de cambios)
- Notificaciones de vencimiento

## Integraciones Externas
- Proveedores (para reorden automática)
- Códigos de barras (para escaneo)

## Dependencias
- Siembra-Cosecha (uso de insumos)
- Sanidad (vacunas y medicinas)
- Finanzas (costo de insumos)
- Reportes (análisis de uso)
