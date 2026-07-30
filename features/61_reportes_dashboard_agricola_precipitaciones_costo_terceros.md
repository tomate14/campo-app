# 61 - Reportes: refinamientos del dashboard agrícola (precipitaciones y costo/ha)

## Descripción
Refinar dos cards del dashboard agrícola: la de precipitaciones, para mostrar la
cantidad de días (por lote o por polígono completo), y la de costo por hectárea,
para que contemple la facturación de los terceros involucrados.

## Alcance
1. **Card de precipitaciones — días por lote/polígono**: además del acumulado en
   mm, mostrar la cantidad de días (con lluvia / considerados) por lote o para el
   polígono completo del establecimiento. Aprovecha la serie diaria ya
   sincronizada (`clima_precipitacion_diaria`).
2. **Card de costo por hectárea — terceros**: revisar el cálculo del costo por
   hectárea para que **contemple la facturación sobre los terceros involucrados**
   (p. ej. aplicadores tercerizados de la feature 58, servicios contratados),
   además de los insumos. Hoy el KPI figura sin datos.

## Requisitos Técnicos
- Backend: extender el cálculo del dashboard agrícola
  (`ReporteAgricolaDashboardService`) para el conteo de días de precipitación y
  para el costo/ha con costos de terceros (vincular con compras/finanzas y con las
  órdenes/aplicaciones tercerizadas).
- Web: actualizar las cards correspondientes en `reportes-agricola-page`.
- Mantener el patrón backend-driven (sin datos mockeados en el frontend).

## Dependencias
- Feature 10-reportes (dashboard agrícola), 02/13-precipitaciones,
  17/18 (finanzas/compras), 58 (órdenes de aplicación tercerizadas).

## Estado
Pendiente.
