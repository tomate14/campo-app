# 53 - Mobile: Alta de plaga (catálogo) desde el selector

## Descripción
En la pantalla de control de plagas mobile, el formulario de "Nueva detección"
tiene un selector horizontal de **Plaga** que solo permite elegir del catálogo
existente. Se agrega, **al principio de esa lista**, un chip circular con borde
punteado y un "+" para dar de alta una plaga nueva en el catálogo cuando haga
falta, sin salir del flujo. El formulario de alta debe mostrar la **misma
información que la pantalla web** de catálogo de plagas.

## Contexto
- Mobile: `mobile/app/agricola/plagas.tsx` (selector `OptionPicker` de "Plaga"
  dentro de `DetectionForm`, alimentado por `getCatalogoPlagas`).
- Web (referencia de campos): `frontend/src/app/pages/plagas-page` — modal
  "Nuevo catálogo" con: nombre común, nombre científico, tipo
  (PLAGA/ENFERMEDAD/MALEZA), cultivos afectados, umbral de acción y síntomas.
- Backend: ya existe `POST /agricola/plagas/catalogo`
  (`PlagasController`), usado por la web. No requiere cambios de backend.
- Offline-first (feature 24): las cargas de agricultura se encolan por el
  interceptor de outbox; el catálogo de plagas debe sumarse a ese allowlist.

## Alcance
1. **API mobile**: agregar `CatalogoPlagaRequest` en tipos y la función
   `createCatalogoPlaga` (POST `/agricola/plagas/catalogo`).
2. **UI**: en el `OptionPicker` de Plaga (formulario de detección), anteponer un
   chip circular con borde punteado (dashed) y un ícono "+" real (lucide `Plus`).
   No usar texto/siglas como ícono.
3. **Formulario de alta**: al tocar el chip, abrir un formulario (modal o
   pantalla) con los mismos campos que la web:
   - Nombre común (obligatorio)
   - Nombre científico
   - Tipo (chips/selección: PLAGA, ENFERMEDAD, MALEZA; default PLAGA)
   - Cultivos afectados
   - Umbral de acción
   - Síntomas (textarea)
   - `activo` = true por defecto.
   Estilo premium dark SaaS consistente con la pantalla de plagas actual.
4. **Post-guardado**: crear vía API, refrescar el catálogo y dejar
   **seleccionada** la plaga recién creada en el formulario de detección.
5. **Offline**: agregar la regla del catálogo al interceptor de outbox
   (`/agricola/plagas/catalogo`) para que el alta funcione sin señal y se
   sincronice, coherente con la feature 24.

## Requisitos Técnicos
- No tocar backend (endpoint ya existe).
- Reutilizar el lenguaje visual y componentes de `plagas.tsx`.
- Gate: `npx tsc --noEmit` verde.

## Dependencias
- Feature 37 (control de plagas y aplicaciones fitosanitarias).
- Feature 24 (offline-first / outbox) para el encolado.

## Estado
Realizada.
