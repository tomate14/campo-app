# 48 - Frontend: Ajustar Budget del Bundle Inicial

## Estado
Pendiente.

## Origen
Detectado durante la feature [47](47_COMPLETA_ganaderia_alertas_potreros.md): `ng build` falla el gate de presupuesto del bundle inicial de Angular (`budget 2.35 MB, total 2.51-2.53 MB`). El problema es **preexistente** a la feature 47 (el branch sin sus cambios ya daba 2.51 MB): la compilacion y el type-check pasan, solo falla el budget configurado en `angular.json`.

## Objetivo
Que `npm run build` vuelva a terminar en verde, por una (o ambas) de estas vias:
1. **Recortar el bundle inicial**: revisar que se este haciendo lazy-loading de rutas pesadas (ApexCharts, MapLibre son los candidatos obvios — verificar si entran en el bundle inicial o en chunks), imports especificos en vez de paquetes completos, y eliminar dependencias muertas.
2. **Ajustar el budget** en `angular.json` a un valor realista si el peso es legitimo, documentando el porque.

Preferir la via 1; usar la 2 solo para el remanente justificado.

## Referencias Tecnicas
- `frontend/angular.json` (seccion budgets).
- Sospechosos de peso: `apexcharts`/`ng-apexcharts`, `maplibre-gl`/`@maplibre/ngx-maplibre-gl`, Angular Material (instalado — verificar cuanto se usa realmente).
- `frontend/dist/campo-app-frontend/` para inspeccionar chunks generados.

## Validacion Tecnica (al implementar)
- `npm run build` en verde sin warnings de budget.
- `npm run type-check` y prueba de navegacion basica (dashboard, potreros, reportes) sin regresiones de lazy-loading.
