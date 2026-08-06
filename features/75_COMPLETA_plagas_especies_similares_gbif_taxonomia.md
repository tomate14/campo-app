# 75 - Plagas: especies similares desde GBIF (taxonomía + sugeridas externas + búsqueda por familia)

## Descripción
Ampliar la integración con GBIF (feature 73) para **descubrir especies similares**
a una plaga a partir de su parentesco taxonómico, aunque esas especies **no estén
en el catálogo propio**. Sirve para el escenario de campo: "creemos que es la plaga
X, pero podría ser una parecida (misma género/familia) que no teníamos fichada".

Dos usos:
1. **Batch (scheduler)**: al sincronizar, además de la foto, guardar la
   **taxonomía** de cada plaga (género/familia) y **descubrir + persistir las
   especies hermanas** (mismo género/familia) con su foto y nombre vulgar, para
   mostrarlas como "similares" en la ficha de la plaga.
2. **On-demand (botón en "Nueva Plaga")**: al lado del input de nombre científico,
   un botón **"Buscar similares"** que consulta GBIF en vivo y sugiere especies de
   la misma familia/género del nombre científico tipeado, para comparar/elegir.

## Decisiones (confirmadas por el usuario)
- **Modelo: cache global de especies GBIF** (`gbif_especie`, una fila por `usageKey`
  con taxonomía + imagen + nombre vulgar + licencia). La taxonomía de cada plaga
  (`gbif_genus_key`/`gbif_family_key`) se guarda en `catalogo_plagas`. Las
  "similares de la plaga X" se **calculan** matcheando género/familia contra el
  cache; no se duplica por plaga.
- **Alcance de similitud: género + familia**, con **topes configurables por .env**:
  `GBIF_SIMILAR_MAX_POR_NIVEL` (ej. 12) y `GBIF_SIMILAR_MAX_NIVELES` (ej. 2 →
  nivel 1 GÉNERO, nivel 2 FAMILIA; si es 1, solo género).
- **Botón on-demand: rápido, miniatura remota sin descargar** (muestra la URL de
  GBIF/iNat directo). La descarga/persistencia de imágenes al volumen la hace el
  **scheduler**.
- **Mobile incluido** en esta feature (bloque de similares en la ficha + botón).

## Contexto
- Feature 73: ya existe el `RestClient` a GBIF, el `FileStorageService.storeBytes`,
  el volumen `/uploads`, la tabla `plaga_referencia` y el scheduler 03:00. Esta
  feature **depende de la 73** (reutiliza esa infraestructura).
- Feature 54: la ficha de la plaga ya tiene un bloque "Plagas sugeridas" pero es
  **sobre el catálogo propio**. Acá se suma una fuente **externa** (GBIF) de
  especies similares; deben convivir claramente diferenciadas en la ficha.

## Alcance

### 1. Taxonomía de la plaga (enriquecer tabla existente)
- Al hacer `species/match?name={nombreCientifico}`, guardar del resultado:
  `gbif_usage_key`, `gbif_genus_key`, `gbif_family_key`, `gbif_genero` (texto),
  `gbif_familia` (texto), `nombre_cientifico_aceptado`, `rank`.
- Persistir estos campos **en `catalogo_plagas`** (columnas nuevas, nullable,
  completadas por el scheduler). Es la "tabla existente" de la plaga.

### 2. Especies descubiertas (cache global `gbif_especie`)
- `species/{genusKey}/children?rank=SPECIES` → hermanas del mismo **género**
  (S. cosmioides, S. eridania, …). Para la **familia** (primos más lejanos):
  `species/search?highertaxonKey={familyKey}&rank=SPECIES` (paginado, acotar a N).
- Guardar en **cache global** `gbif_especie` (una fila por especie, no por plaga):
  `id`, `usage_key` (UNIQUE), `nombre_cientifico`, `nombre_vulgar` (NULL),
  `genus_key`, `family_key`, `genero`, `familia`, `rank`, `path` imagen (NULL),
  `url_original`, `licencia`, `atribucion`, `activo`, timestamps, `deleted_at`.
- Las "similares de la plaga X" se **calculan al leer**: `gbif_especie` donde
  `genus_key = X.gbif_genus_key` (nivel GÉNERO) o `family_key = X.gbif_family_key`
  con distinto género (nivel FAMILIA), excluyendo `usage_key = X.gbif_usage_key`,
  ordenadas género→familia y acotadas por `GBIF_SIMILAR_MAX_POR_NIVEL`. `GBIF_SIMILAR_MAX_NIVELES`
  controla cuántos niveles (1 = solo género, 2 = género + familia).

### 3. Foto + nombre vulgar de cada candidata (scheduler)
- Por cada especie del cache: `species/{key}/vernacularNames` (preferir español;
  fallback al primero) para el `nombre_vulgar`; y una imagen con licencia CC vía
  `occurrence/search?taxonKey={key}&mediaType=StillImage` **descargada al volumen**
  (subcarpeta `plagas-similares/`), como en la 73. Idempotente y con dedupe por
  `usage_key`.

### 4. Scheduler
- Extender el sync diario (03:00) de la feature 73: por cada plaga del catálogo con
  nombre científico → match (guarda taxonomía en `catalogo_plagas`) → descubrir
  similares (género + familia, según topes .env) → **upsert en `gbif_especie`** con
  nombre vulgar y foto descargada. Manejo por-especie con try/catch, degradación
  ante fallo de red, y resumen de resultados.

### 5. On-demand: botón "Buscar similares" en Nueva Plaga
- Endpoint `GET /plagas/gbif/similares?nombreCientifico={sci}[&nivel=GENERO|FAMILIA]`
  (auth `read:lotes`): resuelve el género/familia en vivo y devuelve las especies
  candidatas con `nombreCientifico`, `nombreVulgar`, `nivel`, `imagenUrl`
  (**miniatura remota**: la URL de GBIF/iNat resuelta en vivo, sin descargar; si la
  especie ya está en `gbif_especie` se reusa su dato), `licencia`, `atribucion`.
  Pensado para usarse **antes** de que la plaga exista (en el alta), por eso trabaja
  por nombre científico, no por id.

### Mobile (incluido en esta feature)

### Frontend web
- En "Nueva Plaga" (`plagas-page`), al lado del input **Nombre científico**, botón
  **"Buscar similares"** que llama al endpoint on-demand y muestra las candidatas
  (foto + nombre vulgar + científico + nivel género/familia + atribución) en un
  panel; opción de **usar una** (autocompletar el nombre científico del alta) o
  agregarla como cultivo/plaga. Estilo premium dark SaaS.
- En la **ficha** de la plaga: bloque "Especies similares (GBIF)" separado del bloque
  "Plagas sugeridas (tu catálogo)" de la feature 54, con foto + nombre vulgar +
  científico + nivel + atribución/licencia.

- Paridad de la ficha (bloque de especies similares GBIF) **y** el botón "Buscar
  similares" en el alta de catálogo (llama al mismo endpoint on-demand).

## GBIF (endpoints usados)
- `species/match?name=` → usageKey + genusKey + familyKey + rank + scientificName.
- `species/{genusKey}/children?rank=SPECIES` → hermanas de género.
- `species/search?highertaxonKey={familyKey}&rank=SPECIES` → especies de la familia.
- `species/{key}/vernacularNames` → nombre vulgar.
- `occurrence/search?taxonKey={key}&mediaType=StillImage` → foto con licencia.

## Requisitos Técnicos
- Solo imágenes con licencia CC + atribución (igual que la 73). Acotar cantidad de
  similares por nivel (ej. máx N género + N familia) para no saturar GBIF ni la UI.
- Idempotencia y logs. Degradar ante fallo de red / rate limit.
- GBIF **no** identifica por foto: esto es similitud **taxonómica**, no visual. La
  identificación por imagen (iNaturalist CV / Pl@ntNet) sería otra feature.

## Dependencias
- Feature 73 (integración GBIF, scheduler, storage, `plaga_referencia`), 54
  (ficha de la plaga y "plagas sugeridas" propias), 72 (referencias por id).

## Estado
Realizada (backend + web + mobile). Verificada end-to-end contra Docker con GBIF real:
- V51 agrega taxonomía a `catalogo_plagas` y crea el cache `gbif_especie`
  (columna `taxon_rank`: `rank` es palabra reservada en MySQL 8 — se renombró).
- `POST /gbif/similares/sync`: 3 plagas → 65 especies descubiertas, 26 imágenes
  descargadas al volumen, 0 fallidas. Taxonomía escrita (Oruga cogollera →
  género Spodoptera, familia Noctuidae).
- `GET /catalogo/{id}/similares` (ficha): 24 similares = 12 GÉNERO + 12 FAMILIA
  (respeta `GBIF_SIMILAR_MAX_POR_NIVEL=12`, `GBIF_SIMILAR_MAX_NIVELES=2`), con
  nombre vulgar (español) e imagen local `/uploads/plagas-similares/...`.
- `GET /gbif/similares?nombreCientifico=` (on-demand): cacheadas → imagen local;
  no cacheadas (ej. Apis mellifera) → miniatura **remota** `http` sin descargar.
- Web: bloque "Especies similares (GBIF)" en la ficha (separado de "Plagas
  sugeridas") y botón "Buscar similares" en Nueva Plaga con panel de candidatas +
  "Usar" (autocompleta el nombre científico). Sin errores de consola.
- Mobile: bloque en la ficha + botón "Similares" en el alta. `tsc` verde.
- Scheduler 03:00 corre también `sincronizarSimilares()`.
- Gates verdes: `mvn clean package`, `npm run type-check`, `tsc` mobile.
