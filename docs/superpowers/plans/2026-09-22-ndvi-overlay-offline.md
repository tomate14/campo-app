# NDVI Overlay Offline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exponer los PNG NDVI reales por lote, superponerlos en los mapas web y mobile, abrir un visor dedicado desde el detalle y mantenerlos disponibles offline en mobile mediante descarga anticipada.

**Architecture:** El backend publica un manifiesto autenticado y un recurso PNG versionado por lote usando el cache existente de `NdviService`. Web consume el manifiesto y blobs online; mobile incorpora el manifiesto al sync-down, descarga archivos de forma atomica a almacenamiento persistente y entrega URI locales a los mapas. Los mapas general y dedicado comparten contratos de overlay georreferenciado y el modo `ndvi`.

**Tech Stack:** Spring Boot 3, Java 17, JUnit 5/Mockito, Angular 21/HttpClient/MapLibre, Expo Router/React Native Maps/MapLibre Web, AsyncStorage, expo-file-system, Jest/TypeScript.

**Spec:** `features/59_COMPLETA_agricola_ndvi_mapa_de_verdes.md`

## Global Constraints

- No generar imagenes simuladas: usar exclusivamente los PNG Sentinel-2 generados por backend.
- NDVI debe estar disponible en el mapa general de todos los lotes y en el visor dedicado de un lote.
- El visor dedicado abre con NDVI activo desde el icono junto a clima.
- Mobile debe descargar anticipadamente la ultima imagen disponible de todos los lotes activos al entrar, recuperar conexion, volver al foreground o sincronizar manualmente.
- Las actualizaciones de cache mobile son atomicas; una descarga fallida conserva la imagen anterior y elimina archivos de lotes inactivos solo tras obtener un manifiesto valido.
- Sin conexion se garantiza overlay, poligono, fecha, fuente y leyenda; el mapa satelital depende del cache del proveedor.
- Fecha y fuente Sentinel-2/CDSE deben permanecer visibles.

## Review Focus

- Imagen ausente para un lote activo: el manifiesto informa `disponible=false` y la UI muestra estado vacio sin romper el mapa.
- PNG actualizado durante una descarga: la version del manifiesto define el nombre/estado instalado y el reemplazo es atomico.
- Manifest o descarga interrumpida: se conserva el cache valido anterior.
- Poligonos no rectangulares: el raster usa el bounding box en orden top-left, top-right, bottom-right, bottom-left y el PNG ya enmascarado limita el dibujo real.
- Cambio rapido entre modos: se revocan object URLs web y no quedan layers/sources duplicados.

---

### Task 1: Contrato backend NDVI

**Files:**
- Create: `backend/src/main/java/com/campoapp/agricultura/ndvi/NdviManifestResponse.java`
- Create: `backend/src/main/java/com/campoapp/agricultura/ndvi/NdviImageResource.java`
- Create: `backend/src/main/java/com/campoapp/agricultura/ndvi/NdviController.java`
- Modify: `backend/src/main/java/com/campoapp/agricultura/ndvi/NdviService.java`
- Test: `backend/src/test/java/com/campoapp/agricultura/NdviServiceTest.java`

**Interfaces:**
- Produces: `GET /api/v1/agricola/ndvi`, `GET /api/v1/agricola/ndvi/{loteId}/imagen`.
- Manifest item: `loteId`, `loteNombre`, `disponible`, `generadoAt`, `version`, `imagenUrl`.

- [ ] Write service tests for available/missing images, safe lookup and active-lot validation.
- [ ] Run the focused test and verify it fails because the manifest/image API does not exist.
- [ ] Implement DTOs, service lookup and authenticated controller with PNG content headers.
- [ ] Run focused and backend tests; record environmental download failures separately.

### Task 2: Cache offline NDVI mobile

**Files:**
- Create: `mobile/shared/ndvi/ndvi.types.ts`
- Create: `mobile/shared/ndvi/ndviCachePlan.ts`
- Create: `mobile/shared/ndvi/ndviCache.ts`
- Create: `mobile/shared/ndvi/__tests__/ndviCachePlan.test.ts`
- Modify: `mobile/shared/api/agricola.ts`
- Modify: `mobile/shared/sync/syncDown.ts`
- Modify: `mobile/package.json`

**Interfaces:**
- Produces: `syncNdviCache()`, `getNdviOverlays()`, `getNdviOverlay(loteId)` and persistent manifest key `ndvi_cache_manifest_v1`.
- Consumes: backend manifest and authenticated PNG endpoint from Task 1.

- [ ] Write planner tests for new/version-changed downloads, unavailable entries and stale removals.
- [ ] Run Jest and verify failure because the planner is missing.
- [ ] Implement pure planning logic, API methods and atomic file cache using `expo-file-system`.
- [ ] Invoke cache sync only after regular sync-down has obtained a valid backend response.
- [ ] Run focused and full mobile tests.

### Task 3: Shared map overlays and NDVI selector

**Files:**
- Modify: `mobile/shared/components/lotes-field-map.types.ts`
- Modify: `mobile/shared/components/lotes-field-map.native.tsx`
- Modify: `mobile/shared/components/lotes-field-map.web.tsx`
- Modify: `mobile/app/(tabs)/lotes.tsx`
- Create: `mobile/shared/ndvi/__tests__/ndviGeometry.test.ts`
- Create: `mobile/shared/ndvi/ndviGeometry.ts`
- Modify: `frontend/src/app/core/services/agricola.service.ts`
- Modify: `frontend/src/app/pages/lotes-page/lotes-page.component.ts`
- Modify: `frontend/src/app/pages/lotes-page/lotes-page.component.html`
- Modify: `frontend/src/app/pages/lotes-page/lotes-page.component.css`

**Interfaces:**
- Produces: map mode `ndvi`, overlay coordinates/bounds and legend/date/source UI.
- Consumes: local mobile URIs from Task 2 and authenticated web blobs from Task 1.

- [ ] Write geometry tests for GeoJSON Polygon bounding boxes and coordinate order.
- [ ] Run Jest and verify failure because the geometry helper is missing.
- [ ] Add `ndvi` to mobile map modes and render local overlays in native/web maps.
- [ ] Add NDVI to the web map selector and render all available active-lot overlays with object URL cleanup.
- [ ] Add visible NDVI legend, generation date and Sentinel-2/CDSE attribution.
- [ ] Run mobile tests/type-check and Angular build/type-check.

### Task 4: Dedicated lot viewers and completion

**Files:**
- Create: `mobile/app/ndvi/[loteId].tsx`
- Modify: `mobile/app/(tabs)/lotes.tsx`
- Create: `frontend/src/app/pages/ndvi-page/ndvi-page.component.ts`
- Create: `frontend/src/app/pages/ndvi-page/ndvi-page.component.html`
- Create: `frontend/src/app/pages/ndvi-page/ndvi-page.component.css`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `features/59_agricola_ndvi_mapa_de_verdes.md`
- Modify: `features/MANIFEST.md`

**Interfaces:**
- Produces: `/ndvi/[loteId]` mobile and `/agricola/lotes/:id/ndvi` web.
- Consumes: selected lot, shared map overlay contracts and NDVI cache/API.

- [ ] Add NDVI icon beside climate in both lot detail headers and route with the selected ID.
- [ ] Build premium dedicated viewers with NDVI active, mode selector, empty/error states and metadata.
- [ ] Verify offline mobile rendering from a local file URI and online web rendering from a blob URL.
- [ ] Run backend, frontend and mobile verification, update feature status and perform final code review.
