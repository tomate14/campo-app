# 78 - Mobile: especies similares (GBIF) en modo offline

## Descripción
Hacer que todo lo relativo a **"Especies similares (GBIF)"** (feature 75) funcione
también **offline** en la app mobile: que la ficha de una plaga muestre sus especies
similares (con imagen, nombre vulgar, nombre científico y nivel) sin conexión,
usando datos e imágenes previamente sincronizados al dispositivo.

## Contexto
- Feature 75 (backend, en master): `GET /catalogo/{id}/similares` (similares de una
  plaga desde el cache `gbif_especie`, imagen local `/uploads/plagas-similares/...`)
  y `GET /gbif/similares?nombreCientifico=` (descubrimiento en vivo). Mobile ya
  consume ambos y muestra el bloque en la ficha (online).
- Feature 74 (spec, Pendiente): uso offline del catálogo de referencia con carpetas
  `AgroBoost/catalogo` y `AgroBoost/local` dentro del document dir de la app
  (`expo-file-system`), detección de conectividad y cola de sync. Esta feature 78
  reutiliza esa misma infraestructura/patrón.

## Alcance (mobile)
1. **Sync down de similares**: al tener conexión, para las plagas del catálogo (o
   al abrir/guardar una plaga), consumir `GET /catalogo/{id}/similares` y guardar
   localmente (SQLite/JSON) el mapeo `catalogoPlagaId -> [EspecieSimilar]`
   (usageKey, nombreCientifico, nombreVulgar, nivel, licencia, atribucion) + el
   estado de sincronización.
2. **Descarga de imágenes**: bajar cada `imagenUrl` (`/uploads/plagas-similares/...`)
   a `AgroBoost/similares/` (o subcarpeta dentro de `AgroBoost/catalogo/`) con nombre
   estable por `usageKey`/hash, para render offline.
3. **Render offline**: el bloque "Especies similares (GBIF)" de la ficha usa primero
   la data + imagen **local** (`file://.../AgroBoost/similares/...`); si no existe,
   cae a la URL remota (comportamiento online actual). Debe verse sin conexión.
4. **Descubrimiento en vivo = solo online**: el botón "Buscar similares"
   (`/gbif/similares?nombreCientifico=`) requiere red (consulta GBIF en el momento);
   offline se deshabilita con aviso ("Requiere conexión"). Lo que SÍ funciona offline
   son las similares ya sincronizadas por plaga.
5. **Invalidez/espacio**: limpiar imágenes de similares que ya no están en el cache;
   re-descargar si cambió el path. Integrar con la misma detección de conectividad
   (`subscribeConnectivity`/`isOnline`) y, si aplica, con la cola/patrón de la 74.

## Salvedad técnica (igual que la 74)
En React Native/Expo no se puede escribir en el root real del dispositivo de forma
portable → se usa el **document dir de la app** (`FileSystem.documentDirectory`) con
la estructura `AgroBoost/...`.

## Requisitos Técnicos
- `expo-file-system` (crear carpetas, descargar y leer archivos).
- Metadata local persistente (id de plaga -> similares -> archivo local).
- Degradar con gracia sin conexión; no romper el flujo online actual.
- Estilo premium (consistente con el rediseño de la feature 77).

## Dependencias
- Feature 75 (especies similares GBIF, backend + mobile online), 74 (infra offline
  AgroBoost en mobile), 73/54 (catálogo, ficha).

## Estado
Pendiente.
