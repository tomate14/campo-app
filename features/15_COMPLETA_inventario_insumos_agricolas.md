# 15 - Inventario: Insumos Agricolas

## Descripcion
Gestion integral del stock de insumos agricolas (semillas, fertilizantes, fitosanitarios, etc.) con alertas de reorden.

## Funcionalidades Principales
- Catalogo de insumos
- Stock en tiempo real
- Niveles minimos y maximos
- Lotes y vencimientos
- Trazabilidad de uso

## Tareas
1. **Catalogo de Insumos**: Tipo, marca, presentacion, codigo
2. **Registro de Stock**: Cantidad disponible por insumo
3. **Ubicacion en Deposito**: Donde se almacena cada insumo
4. **Lote y Vencimiento**: Control de fecha de caducidad
5. **Precio Unitario**: Costo de cada insumo
6. **Nivel Minimo de Reorden**: Alertas automaticas
7. **Registro de Uso**: Que insumo se uso en que lote/tarea
8. **Trazabilidad Inversa**: De donde proviene cada insumo

## Servicios
- `InsumoService`: CRUD de insumos
- `StockService`: Gestion de cantidades
- `ReordenService`: Alertas y sugerencias

## Repositorios
- `InsumoRepository`
- `StockRepository`
- `MovimientoInsumoRepository`

## Requisitos Tecnicos
- UUID para insumos
- Auditoria de movimientos de stock
- Endpoint REST: `/api/v1/inventario/insumos`
- Disponible offline (sincronizacion de cambios)
- Notificaciones de vencimiento

## Integraciones Externas
- Proveedores (para reorden automatica)
- Codigos de barras (para escaneo)

## Dependencias
- Siembra-Cosecha (uso de insumos)
- Sanidad (vacunas y medicinas)
- Finanzas (costo de insumos)
- Reportes (analisis de uso)

## Estado
Feature completada con backend, frontend web, migracion, mock data y registro en manifest.
