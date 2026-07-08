# 44 - Frontend: Modernizacion de Graficos Compartidos con ApexCharts

## Estado
Pendiente.

## Origen
El usuario reporto que la estetica de los graficos de barras, donut y linea usados en los dashboards no es moderna. Se acordo migrar los componentes compartidos de SVG hand-rolled a `ng-apexcharts` (ya usado en `reportes-ganaderia-page` y `finanzas-reportes-page`) aplicando gradientes, glow verde sutil, curvas suaves y el tooltip premium ya definido en el proyecto.

## Objetivo
Reemplazar el renderizado interno de los graficos compartidos por ApexCharts manteniendo el mismo lenguaje visual premium dark SaaS ya usado en Dashboard Ganadero y Dashboard Financiero, sin romper el contrato publico (`@Input()`) de los componentes para no tener que tocar las pantallas que ya los consumen.

## Alcance
Componentes a migrar (`frontend/src/app/shared/`):
- `material-bar-chart` - barras con gradiente, esquinas redondeadas, glow en el valor destacado, linea de promedio.
- `material-donut-chart` - anillo con gradiente por segmento, extremos redondeados, glow y centro tipo vidrio.
- `material-line-chart` - curva suave (smooth), area con relleno degradado, glow en el trazo, series primaria y secundaria.

Tooltip: reemplazar `PremiumChartTooltipComponent` por el patron `apex-tooltip-card` (HTML custom via `tooltip.custom` de ApexCharts) ya usado en `reportes-ganaderia-page` y `finanzas-reportes-page`, respetando la Regla Visual de Tooltips del proyecto (card dark SaaS, banda superior, icono, badge, filas icono-label-valor, footer de leyenda).

Pantallas consumidoras que deben verse sin cambios de contrato (no requieren edicion salvo ajuste visual necesario):
- `reportes-agricola-page` (usa `material-line-chart` y `material-donut-chart`).
- `analytics-page` (usa `material-bar-chart` en 5 graficos distintos).

## Fuera de Alcance
- No se migran los graficos que ya usan ApexCharts directamente (Dashboard Ganadero, Dashboard Financiero).
- No se agregan tipos de grafico nuevos (radialBar multi-anillo, mapas, etc.) mas alla del donut existente.

## Validacion Tecnica
- `npx ng build --configuration development`
- Verificacion visual en navegador de `analytics-page` y `reportes-agricola-page` (dev server), incluyendo estado de tooltip al pasar el mouse y estado vacio (`emptyText`).
