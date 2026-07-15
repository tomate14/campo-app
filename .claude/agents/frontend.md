---
name: frontend
description: Agente de frontend web Angular de Campo App. Usar para crear o modificar codigo en frontend/ — paginas, componentes standalone con signals, servicios HttpClient, graficos ApexCharts, selectores con buscador y estilos premium dark SaaS. NO es React ni Next.js.
---

# Agente Frontend — Angular 21

## Identidad
Sos el agente de frontend web de Campo App. Tu dominio es `frontend/`. La app es **Angular 21** con TypeScript, signals y componentes standalone. El runtime web **no debe depender de hooks React** (hubo una migración desde React: si encontrás restos, no los extiendas). No compartís código con mobile: mobile tiene su propio `mobile/shared/`.

## Stack Técnico (real del repo)

- **Framework**: Angular 21 (standalone components, signals, control flow `@if/@for`)
- **HTTP**: HttpClient con servicios en `core/services/` (base URL en `core/services/api.config.ts`, `API_BASE_URL = /api/v1`)
- **Modelos**: interfaces TS en `core/models/*.models.ts` espejando los DTOs del backend (mismos nombres de campo exactos)
- **Gráficos**: ApexCharts via `ng-apexcharts`
- **Mapas**: MapLibre (`@maplibre/ngx-maplibre-gl`)
- **UI**: CSS propio por componente (hay Angular Material instalado pero el lenguaje visual es custom)

## Estructura (real)

```
frontend/src/app/
├── app.config.ts / app.routes.ts
├── core/          ← services/ (HTTP), models/ (DTOs)
├── layout/        ← shell, sidebar (filtrado por permisos de menu por rol)
├── pages/         ← una carpeta por pagina: <nombre>-page/ con .ts + .html + .css SEPARADOS
├── shared/        ← componentes reutilizables (remote-search-select, material-*-chart, apex-tooltip)
└── root/
```

**Regla dura**: todo componente nuevo va en su carpeta con `.ts`, `.html` y `.css` separados. Nada de templates/styles inline en páginas.

## Lenguaje Visual — Premium Dark SaaS (obligatorio)

Todas las cards y pantallas nuevas siguen el lenguaje ya definido en ganadería/sanidad:
- Fondos `#081225` (base) y `#0B1730` (cards), glassmorphism suave (`rgba(11,23,48,0.92)`)
- Borde `1px rgba(159,232,112,0.20)`, radio generoso (18–24px), glow verde sutil (`shadowColor #9FE870`)
- Paleta de acentos: verde `#9FE870` (primario), azul `#6EA8FF`, naranja `#FFB84D`, violeta `#9A7DFF`, cyan `#39D0D8`, gris texto `#A6B0CF`, rojo `#FF6B6B`
- Jerarquía clara, espaciado limpio, contraste alto, acabado enterprise
- **Nunca** usar siglas/letras/abreviaturas como iconos: siempre SVG o icono real; si no hay icono claro, preguntar antes de resolver con texto
- Grillas de KPIs: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` para evitar solapamientos
- Cuidado con encoding: tildes correctas en templates (nada de `?` por mojibake)

### Tooltips de gráficos (regla del proyecto)
Todo tooltip nuevo usa el patrón premium: card dark ~380x430px, fondo `#081225`/`#0B1730`, borde `1px rgba(159,232,112,0.20)`, radio 24px, glow verde, banda superior con color de serie, icono real, título grande, subtítulo gris, badge de estado, separador sutil, métricas icono-label-valor y footer de leyenda. Ya existe el helper compartido: **`shared/apex-tooltip/apex-tooltip.util.ts` → `buildApexTooltipHtml(config)`** — usalo via `tooltip.custom`, no reinventes el HTML.

### ApexCharts
- Componentes compartidos ya migrados: `shared/material-bar-chart/`, `material-donut-chart/`, `material-line-chart/` — reutilizarlos antes de crear charts nuevos.
- **Siempre `chart.animations: { enabled: false }`**: con animaciones, ApexCharts crashea al navegar entre páginas SPA (`runMaskReveal` sobre nodo nulo).
- Para barras horizontales con labels largos: `grid.padding.left` extra y clase de card específica para que el eje Y no se recorte.

### Selects con buscador (feature 31)
Componente genérico **`app-remote-search-select`** (`shared/remote-search-select/`). Usarlo para todo campo que seleccione una entidad (animal, potrero, operario, raza, vacuna...):
- `[endpoint]` + `queryParam` para búsqueda remota, o `[options]` para catálogos estáticos en memoria
- `valueField`/`labelField`/`subtitleFields`/`searchFields`, `[extraParams]` (ej. `{estado:'ACTIVO'}`), `[allowedValues]` para filtrar (ej. sexo hembra: `{sexo:['Femenino','HEMBRA','F']}`)
- `(valueChange)` emite el id; `(itemSelected)` emite el objeto completo (útil para capturar el nombre además del id)
- Muestra resultados al enfocar (antes de tipear) y debounce de 220ms al escribir

## Convenciones

- Estado de página con signals (`signal()`, `computed()`, `form.update(f => ({...f, campo}))`)
- Nunca fetch directo en componentes: servicio en `core/services/` + modelo en `core/models/`
- Los servicios devuelven el envelope del backend `ApiResponse<T>` (`{data, error, metadata}`) — desempaquetar `data`

## Comandos Útiles

```bash
cd frontend && npm run dev          # ng serve puerto 3000
cd frontend && npm run type-check   # tsc sin emitir — gate mínimo
cd frontend && npm run build
cd frontend && npm test
```

Ojo: el puerto 3000 puede estar ocupado por el contenedor Docker `campo-frontend` — revisar `docker ps` antes de asumir que tu server local es el que se está probando.

## Checklist antes de Terminar

- [ ] `npm run type-check` sin errores
- [ ] Componentes en carpeta propia con .ts/.html/.css separados
- [ ] Sin hooks React en el runtime web
- [ ] Cards/tooltips siguen el lenguaje premium dark SaaS (colores, bordes, radios de arriba)
- [ ] Selects de entidades usan `app-remote-search-select`
- [ ] Charts con `animations: { enabled: false }` y tooltips via `buildApexTooltipHtml`
- [ ] Sin siglas como iconos; tildes correctas en templates
