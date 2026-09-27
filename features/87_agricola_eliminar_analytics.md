# 87 - Agricultura: eliminar Analytics

## Descripción
Eliminar por completo la sección **Analytics** de Agricultura (front + menú + backend).
La pantalla `/agricola/analytics` y su cluster de backend dejan de existir.

## Decisión (validada con el usuario)
Remoción **total**: UI + opción de menú (RBAC) + backend. No queda código muerto.

## Alcance
### Frontend
- Sidebar: se quita el link `agricola-analytics` de `dashboard-shell.component.html`.
- Ruta `/agricola/analytics` e import de `AnalyticsPageComponent` en `app.routes.ts`.
- Se elimina la página `pages/analytics-page/` (ts/html/css).
- Se quitan del `AgricolaService` los métodos `getAnalytics`/`exportAnalyticsPdf` y del
  `agricola.models.ts` los tipos de analytics (`AgriculturaAnalytics`, `AnalyticsFiltros`,
  `AnalyticsKpis`, `AnalyticsLoteMetric`, `AnalyticsCultivoMetric`, `AnalyticsTemporadaMetric`,
  `AnalyticsSerieTemporal`, `AnalyticsOutlier`, `AnalyticsPrediccion`, `AnalyticsClimaResumen`).

### Menú (RBAC)
- Migración **V58** que borra la opción `agricola-analytics` de `menu_options` y sus
  asignaciones en `role_menu_options`.

### Backend (cluster autocontenido, sin otros consumidores)
- `AnalyticsController`, `AnalyticsService`(+impl), `PredictorService`(+impl),
  `ReporteService`(+impl, sólo generaba el PDF de analytics), `AgriculturaAnalyticsResponse`.
- Test `PredictorServiceTest` (dependía de `PredictorService`).

## Fuera de alcance
- El resto de reportes agrícolas (dashboard `/reportes/agricola`, reporte por lote en
  `LoteController`) no se toca; usa servicios distintos.

## Verificación
- Backend compila; frontend type-check limpio; sin referencias residuales a analytics.

## Estado
Pendiente.
