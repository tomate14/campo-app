# Feature 82 - Plagas: burbujas de alta de eventos en el mapa (formularios inline)

## Objetivo
Agregar en la vista web de **plagas** (`plagas-page`) un **rail de burbujas de acción sobre el mapa**,
similar al de mobile (`mobile/app/(tabs)/lotes.tsx`), para **dar de alta los distintos eventos**. Al
hacer click en una burbuja se **muestra el formulario web inline** (modal) que da de alta ese evento —
NO se redirige a otra página.

Sólo **web** (Angular). Sin backend nuevo (se reutilizan los endpoints y modales existentes).

## Estado actual (base)
`frontend/src/app/pages/plagas-page/plagas-page.component.{ts,html,css}` ya tiene, como modales inline:
- **DETECCION** (flujo de 2 pasos: foto opcional + formulario) — se abre con `nuevaDeteccion()` /
  `openModal('DETECCION')`.
- **APLICACION** (`aplicacionForm`) y **SEGUIMIENTO** (`seguimientoForm`): hoy se abren SIEMPRE desde
  una detección concreta (`openModal('APLICACION'|'SEGUIMIENTO', deteccion)`, usan
  `selectedDeteccion()` en el encabezado) — no tienen selector de detección.
- **HISTORICO**, **CATALOGO**, **FICHA**.
- NO existe un formulario de **evento de siembra** en plagas (vive en `siembra-page`).
El botón superior "Registrar evento" hoy dispara `nuevaDeteccion()`.

## Alcance / implementación (web)
Sobre el mapa de `plagas-page`, agregar un **rail de burbujas** (mismos labels/íconos/colores que
`actions` de mobile) que abran formularios inline:
1. **Registrar evento** (`#9FE870`) → nuevo modal inline de **EventoSiembra**: campos loteId,
   tipoEvento, estadoFenologico, descripcion, fecha (replicar el form de `siembra-page`), guardado con
   `agricolaService.createEvento(...)`.
2. **Registrar aplicación** (`#6EA8FF`) → modal **APLICACION** existente, pero abierto desde la
   burbuja SIN detección: agregar un **selector de detección** (dropdown con las detecciones
   disponibles) al modal cuando no viene una pre-seleccionada. Guardado con
   `createAplicacionFitosanitaria(deteccionId, ...)`. Si no hay detecciones, informar/deshabilitar.
3. **Registrar seguimiento** (`#39D0D8`) → modal **SEGUIMIENTO** existente, análogo: selector de
   detección cuando no viene pre-seleccionada. Guardado con `createSeguimientoPlaga(deteccionId, ...)`.
4. **Nueva detección** (`#9A7DFF`, primaria) → modal **DETECCION** existente (`nuevaDeteccion()`).

- Las acciones ya existentes por detección (pin-card / fila de tabla → Aplicación/Seguimiento/
  Histórico) siguen funcionando igual (con la detección pre-seleccionada, sin mostrar el selector).
- Al guardar cualquiera: cerrar el modal y refrescar los datos/tablas correspondientes.
- Estética premium dark SaaS; íconos SVG reales (mismos que mobile: evento/planilla, aplicación/
  spray, seguimiento/brote, detección/crosshair). El rail se ubica sobre el mapa (overlay), como el
  `actionRail` de mobile.

## Fuera de alcance
- Redirección a otras páginas (todo es inline).
- Mobile (esta feature es sólo web; mobile ya tiene el rail).
- Backend/migraciones.

## Criterios de aceptación
- El mapa de plagas muestra las burbujas de acción (evento, aplicación, seguimiento, detección).
- Cada burbuja abre el formulario web inline para dar de alta ese evento (sin redirigir).
- Aplicación/seguimiento desde la burbuja permiten elegir la detección; desde una detección concreta
  siguen viniendo pre-seleccionadas.
- Registrar evento crea un EventoSiembra vía `createEvento`.
- `type-check` / build de Angular sin errores nuevos.
