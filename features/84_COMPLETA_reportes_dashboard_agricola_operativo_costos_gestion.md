# 84 - Reportes: dashboard operativo agrícola (costos por hectárea + gestión)

## Descripción
Rework del dashboard operativo agrícola (`/reportes/agricola`, **solo web**) para
dividirlo en dos partes:

1. **Estadísticas** de un período determinado, filtrables por lote(s), cultivo(s) o
   todos juntos. La métrica principal es el **costo total por hectárea**, compuesto
   por (a) el costo de los insumos aplicados y (b) el costo de los comprobantes de
   compra (arrendamiento, servicios de terceros, etc.) atribuidos a los lotes.
2. **Gestión** (administrativo): alertas consolidadas, órdenes de aplicación
   pendientes de validar, resumen de órdenes de trabajo y tareas recomendadas.

Hoy el dashboard es una foto de toda la campaña, sin filtros de período/lote, y los
KPIs `COSTO_HECTAREA` y `MARGEN_BRUTO_PROYECTADO` figuran en `null` ("Sin datos
disponibles"). Esta feature los llena con datos reales y agrega el modelo de costos
que los alimenta.

> **Relación con la feature 61**: la 61 (pendiente) planteaba refinar la card de
> costo/ha para contemplar terceros. Esta feature 84 **absorbe y amplía** ese
> objetivo. Se recomienda cerrar la 61 o reducir su alcance únicamente al conteo de
> días de precipitación por lote/polígono (ver Fuera de Alcance).

## Decisiones de diseño (validadas con el usuario)
- **Naturaleza de la métrica**: costo/ha = **egresos** (no margen). No se atribuyen
  ingresos de venta a los lotes.
- **Comprobantes que aportan costo**: **Compras a proveedores** (`CompraProveedor`).
  Facturación de ventas queda fuera del cálculo de costo.
- **Atribución del comprobante a lotes**: selector múltiple de lotes al cargar la
  compra; el monto se **prorratea proporcional a la superficie (ha)** de cada lote.
- **Costo de insumos aplicados**: se contabiliza recién cuando la **orden de
  aplicación queda `VALIDADA`**. La orden pasa a referenciar un insumo del catálogo
  (`InsumoAgricola`) **desde inventario propio**; al validar se genera un
  `MovimientoInsumoAgricola` (SALIDA/USO) que descuenta stock y toma el costo.
- **Filtro "tipos"** = **cultivo** (no existe enum de tipo de lote en el modelo).
- **Plataforma**: dashboard **solo web**. Mobile solo recibe el cambio del
  formulario de orden de aplicación (selector de insumo).

### Decisiones abiertas (default aplicable; confirmar en revisión)
- Monto de la compra a prorratear: **`total`** (con IVA) por default; alternativa
  `subtotal` (neto) si el IVA es recuperable.
- Insumo sin `precioUnitario` cargado: contribuye **0** al costo y se marca una
  advertencia visible en el dashboard.

## Modelo de datos (migración `V56`)
1. **`finanzas_compra_lotes`** — tabla de vínculo N:N: `id`, `compra_id`
   (FK → `finanzas_compras`), `lote_id` (FK → `lotes`), timestamps de auditoría. El
   prorrateo por hectárea se calcula en tiempo de lectura (no se persiste el monto).
2. **`ordenes_aplicacion.insumo_id`** — FK nullable → `insumos_agricolas`. Nullable
   por compatibilidad con órdenes existentes; requerido a nivel aplicación en las
   órdenes nuevas.
3. **`movimientos_insumos.orden_aplicacion_id`** — FK nullable → `ordenes_aplicacion`.
   Sirve para **idempotencia** (no duplicar el costo si se re-valida una orden) y
   para trazabilidad orden → movimiento.

## Cálculo del costo por hectárea
**Costo total de un lote en el período =**
- **(A) Insumos aplicados**: `Σ` de `MovimientoInsumoAgricola` con
  `tipoMovimiento ∈ {SALIDA, USO}`, del lote, con `fecha` dentro del período →
  `cantidad × costoUnitario`. Incluye los generados por órdenes validadas y los
  movimientos manuales.
- **(B) Compras atribuidas**: por cada `CompraProveedor` con `fechaEmision` dentro
  del período que incluya al lote en su selección →
  `compra.total × (area_lote / Σ area de los lotes de esa compra)`.

**$/ha del lote** = costo total del lote ÷ `area`.
**$/ha del conjunto filtrado** = `Σ` costos de los lotes filtrados ÷ `Σ` superficies.

## Métricas del dashboard

### PARTE 1 — Estadísticas (filtro: período + lote(s) + cultivo(s) + todos)
**KPIs**
1. Costo total ($).
2. **Costo por hectárea ($/ha)** — métrica principal.
3. Costo de insumos ($ y % del total).
4. Costo de comprobantes ($ y % del total).
5. Costo por tonelada ($/tn) — costo total ÷ toneladas cosechadas en período (solo
   si hay cosecha).
6. Hectáreas consideradas + nº de lotes.

**Gráficos de costo**
7. Ranking $/ha por lote (barras).
8. Composición del costo (donut): insumos vs tipos de comprobante.
9. Evolución mensual del costo (línea) dentro del período.
10. Costo/ha por cultivo (barras).
11. Mapa de lotes con toggle **salud ↔ costo/ha**.

**Contexto productivo (ya existente; pasa a respetar el filtro)**
12. Rendimiento tn/ha (actual vs histórico).
13. Índice de salud de cultivos (%).
14. Precipitación acumulada (mm).
15. Distribución de cultivos (ha / %).
16. Estados fenológicos por cultivo.
17. Resumen de cosecha (toneladas, pérdida, destinos) — feature 60.

**Actividad de aplicaciones (período)**
18. Órdenes de aplicación: validadas / pendientes / rechazadas.
19. Dosis total de insumo aplicada en el período.

### PARTE 2 — Gestión (sin filtro de período)
- **A. Alertas consolidadas**: clima (`AlertaClima`), plagas activas
  (`DeteccionPlaga` ABIERTA/EN_TRATAMIENTO), stock bajo/reorden y vencimientos de
  insumos (`InsumosDashboard`), mantenimiento de maquinaria pendiente — con
  severidad, lote y fecha.
- **B. Órdenes de aplicación pendientes de validar** (estado `ACEPTADA`), con acción
  directa "Validar".
- **C. Resumen de órdenes de trabajo** por estado (pendientes / en progreso /
  vencidas / completadas), desde `OrdenTrabajoDashboard`.
- **D. Tareas recomendadas** (ya existente).

## Requisitos técnicos

### Backend
- **Migración `V56`** con las 3 estructuras del modelo de datos.
- **`CompraProveedor`**: relación con lotes (`finanzas_compra_lotes`).
  `CompraRequest`/`CompraResponse` suman `loteIds`. Persistencia del vínculo en el
  alta/edición de la compra.
- **`OrdenAplicacion`**: campo `insumo` (FK). `OrdenAplicacionRequest`/`Response`
  suman `insumoId` (+ nombre resuelto en el response). En `POST /{id}/validar` se
  genera el `MovimientoInsumoAgricola` (SALIDA/USO): `lote = orden.lote`,
  `cantidad = dosis × superficieTratadaHa`, `costoUnitario = insumo.precioUnitario`,
  `orden_aplicacion_id = orden.id`; descuenta stock y respeta idempotencia.
- **Endpoint Parte 1**: `GET /api/v1/agricola/reportes/costos` con params
  `desde`, `hasta`, `loteIds`, `cultivos`. Devuelve KPIs 1–6, series/rankings 7–10,
  datos del mapa 11, contexto 12–17 filtrado y actividad 18–19.
- **Endpoint Parte 2**: `GET /api/v1/agricola/reportes/gestion` (sin período) que
  consolida alertas, órdenes pendientes de validar, resumen de órdenes de trabajo y
  tareas recomendadas. Puede reutilizar los servicios/DTOs existentes.
- **Repositorios**: agregaciones nuevas en `MovimientoInsumoAgricolaRepository`
  (suma de costos por lote y período) y query de compras por lote/período.
- Mantener el patrón backend-driven (sin datos mockeados en el frontend).
- **Permisos**: los nuevos endpoints de reportes usan el permiso del dashboard
  agrícola actual; la generación del movimiento al validar respeta las reglas de la
  feature 58.

### Frontend web
- **`reportes-agricola-page`**: reorganizar en dos partes con barra de filtros
  (rango de fechas + multiselect de lotes + multiselect de cultivos + "todos"),
  refetch de la Parte 1 al cambiar filtros. Nuevos KPIs, gráficos (ApexCharts /
  componentes existentes) y toggle del mapa. Servicio `AgricolaService` con los
  métodos de los dos endpoints nuevos.
- **`finanzas-compras`**: selector múltiple de lotes en el formulario del
  comprobante de compra.
- Lenguaje visual premium dark SaaS ya definido (CLAUDE.md); tooltips de gráficos
  según la regla visual de tooltips premium.

### Mobile
- Formulario de orden de aplicación (`agricola/plagas` / `ordenes-aplicacion`):
  selector de insumo del catálogo (inventario). El catálogo de insumos debe quedar
  **cacheado para funcionar offline** (coherente con la feature 58 offline).
- Sin dashboard en mobile.

## Testing
- Backend (JUnit/Mockito): prorrateo por hectárea, costo de insumo al validar la
  orden, idempotencia de re-validación, filtros del endpoint de costos.
- `tsc` web + mobile; `ng build` de producción dentro de budgets.

## Fuera de alcance
- Ingresos/venta por lote (no se atribuyen).
- Dashboard en mobile.
- Entidad "Campo/Establecimiento": el "campo completo" = suma de todos los lotes.
- Conteo de **días** de precipitación por lote/polígono (queda como remanente de la
  feature 61; puede folderse en una feature posterior si se desea).

## Dependencias
- Feature 10-reportes (dashboard agrícola base), 15 (inventario de insumos),
  18 (compras a proveedores), 58 (órdenes de aplicación tercerizadas),
  60 (cosecha: pérdidas y destino), 72 (utilidades por id).
- Supersede parcialmente la feature 61 (costo/ha con terceros).

## Estado
Realizada. Backend (migración V56, prorrateo por ha, costo de insumo al validar
idempotente, endpoints `/reportes/agricola/costos` y `/gestion`, `/inventario/insumos/activos`),
web (dashboard 2 partes según diseño, multiselect de lotes en Compras, selector de
insumo en órdenes de aplicación) y mobile (selector de insumo + catálogo offline)
implementados y validados (tests JUnit 19/19, type-check web y mobile limpios).
El toggle ARS/USD queda preparado (USD deshabilitado); su integración real es la
feature 85.
