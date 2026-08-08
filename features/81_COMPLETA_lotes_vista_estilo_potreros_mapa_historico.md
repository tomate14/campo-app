# Feature 81 - Vista de lotes estilo potreros (mapa + panel + alta por dibujo + histórico)

## Objetivo
Migrar la vista web de **lotes** (`lotes-page`) para que sea **similar a la de potreros**
(`ganaderia-potreros-page`): un mapa operativo a la izquierda con los lotes dibujados, un
**panel-resumen a la derecha** con las cards de cada lote, **alta de lote dibujando el polígono en el
mapa**, y **al hacer click sobre un lote delimitado se muestra su histórico** en un modal de detalle.

Sólo **web** (Angular). No incluye alertas (los lotes no tienen alertas); el click nunca crea nada,
sólo abre el histórico. El alta/edición/borrado se hace por botones.

## Estado actual
- `frontend/src/app/pages/lotes-page/lotes-page.component.{ts,html,css}` es hoy una **lista de cards
  premium** (cada lote es una card ancha con mini-mapa a la derecha), con filtros, botones
  "Nuevo lote" (abre modal `lote-form`), "Detalle" (navega a `/agricola/lotes/:id`), Editar,
  Eliminar, e Importar/Exportar GeoJSON.
- El detalle `lote-detail-page` hoy sólo muestra nombre/cultivo/temporada/área + un mapa del lote
  (sin histórico).
- La vista de potreros (patrón objetivo) ya tiene: KPIs arriba, `map-layout` = `map-panel` (mapa con
  `mgl-map`, polígonos por `mgl-geojson-source`/`mgl-layer`, dibujo por vértices) + `aside.side-panel`
  (lista de cards con métricas), modales de detalle/alta. Handlers de dibujo:
  `drawingPoints` (signal), `startNewMapping`, `onMapClick`, `onMapDoubleClick`, `undoPoint`,
  `cancelDrawing`, `draftAreaHa` (=`computeAreaHectares`), `openModalFromPoints`, `savePotrero`.

## Alcance / implementación (web, Angular)
Reescribir `lotes-page` tomando `ganaderia-potreros-page` como referencia visual y de interacción.

### 1. Layout
- Header con título + acciones: **"Nuevo lote"** (inicia dibujo), **"Deshacer punto"**,
  **"Guardar"** (habilitado con ≥3 puntos → abre form), **"Cancelar dibujo"**, y mantener
  **Importar/Exportar GeoJSON**. Conservar la card de filtros existente (o moverla como en potreros).
- KPIs arriba (metric-grid): p. ej. cantidad de lotes, superficie total (ha), cultivos distintos.
- `map-layout` de 2 columnas:
  - **`map-panel`** (izquierda): `mgl-map` renderizando **todos los lotes** como polígono relleno +
    línea (color por estado/cultivo) desde un `mgl-geojson-source`, más un **pin/centroide por lote**
    (usar `computeCentroid`). Toggle Satélite/Mapa como potreros.
  - **`aside.side-panel`** (derecha): "Lotes registrados" con la lista de **cards-resumen** por lote
    (nombre, cultivo, temporada, área, pH, siembra/cosecha; reutilizar las métricas actuales) y menú
    kebab con "Ver histórico / Editar / Eliminar". Click en la card selecciona/centra el lote.

### 2. Alta de lote por dibujo (como potreros)
- "Nuevo lote" → `startDrawing` (limpia `drawingPoints`). `onMapClick` agrega vértices;
  `onMapDoubleClick` (o "Guardar" con ≥3 puntos) finaliza y abre el modal `lote-form` **pre-cargado
  con el polígono dibujado** (`buildPolygon(points)` + `computeCentroid`), donde se completan los
  datos restantes (nombre, cultivo, temporada, etc.). Guardar usa `createLote`/`updateLote`.
- Reutilizar `shared/lote-form` (que ya trae `lote-map-editor`) recibiendo el polígono inicial;
  y los helpers de `shared/lote-geometry` (`parsePolygon`, `buildPolygon`, `computeCentroid`,
  `computeAreaHectares`, `sanitizePoints`).

### 3. Render de lotes en el mapa (pines/polígonos)
- Todos los lotes con polígono se dibujan; los que tienen lat/long muestran pin en el centroide.
- Hover → tooltip con nombre/cultivo/área (como el `map-tooltip` de potreros).

### 4. Click en lote delimitado → histórico (modal de detalle)
- Click en el polígono de un lote (o en "Ver histórico" de la card) abre un **modal de detalle tipo
  potreros** con el **histórico del lote**:
  - Encabezado + resumen desde `getReporteLote(id)` (`LoteReporte`: cultivo/temporada/área,
    cantidadEventos, cantidadCosechas, análisis de suelo, rendimientos, último cultivo).
  - Timeline/listas de **siembras** (`getEventosByLote`), **cosechas** (`getCosechasByLote`) y
    **detecciones del lote** (filtrar `getDeteccionesPlaga()` por `loteId`).
  - Botón "Ver detalle completo" que navega a `/agricola/lotes/:id` (opcional).
- El click **no** crea nada. No hay alertas ni creación de eventos por click.

## Convenciones visuales
Lenguaje premium dark SaaS de Campo App (fondos #081225/#0B1730, borde `rgba(159,232,112,.2)`,
radios 18-24px, glow verde), íconos SVG reales (nada de siglas/letras). Reutilizar clases/estilos de
`ganaderia-potreros-page` donde aplique.

## Fuera de alcance
- Alertas sobre lotes (no existen).
- Backend nuevo: se reutilizan los endpoints existentes (`/agricola/lotes`, `/agricola/lotes/:id`,
  `/agricola/lotes/:id/reporte`, `/agricola/siembra/lote/:id`, `/agricola/cosecha/lote/:id`,
  detecciones). No hay migraciones.
- Mobile (esta feature es sólo web).

## Criterios de aceptación
- La vista de lotes muestra mapa + panel-resumen a la derecha, con los lotes dibujados.
- Se puede dar de alta un lote dibujando el polígono en el mapa y completando el form.
- Al hacer click sobre un lote delimitado se abre su histórico (resumen + siembras/cosechas/
  detecciones) en un modal.
- El click no crea eventos; alta/edición/borrado por botones.
- `type-check` / build de Angular sin errores nuevos.
