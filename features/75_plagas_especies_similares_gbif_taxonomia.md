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

### 2. Especies similares descubiertas (tabla nueva)
- `species/{genusKey}/children?rank=SPECIES` → hermanas del mismo **género**
  (S. cosmioides, S. eridania, …). Para la **familia** (primos más lejanos):
  `species/search?highertaxonKey={familyKey}&rank=SPECIES` (paginado, acotar a N).
- Guardar en tabla nueva `plaga_similar_gbif`, referenciable desde la plaga:
  `id`, `catalogo_plaga_id` (plaga origen), `gbif_usage_key`, `nombre_cientifico`,
  `nombre_vulgar` (NULL), `nivel` (`GENERO`/`FAMILIA`), `genus_key`, `family_key`,
  `path` imagen (NULL), `fuente`='GBIF', `url_original`, `licencia`, `atribucion`,
  `activo`, timestamps, `deleted_at`. UNIQUE `(catalogo_plaga_id, gbif_usage_key)`
  para idempotencia. Excluir la propia especie.

### 3. Foto + nombre vulgar de cada candidata
- Por cada similar: `species/{key}/vernacularNames` (preferir español; fallback al
  primero) para el `nombre_vulgar`; y una imagen con licencia CC vía
  `occurrence/search?taxonKey={key}&mediaType=StillImage` descargada al volumen
  (subcarpeta `plagas-similares/`), como en la 73. El scheduler mantiene esto
  actualizado ("todas las imágenes posibles"), idempotente y con dedupe.

### 4. Scheduler
- Extender el sync diario (03:00) de la feature 73: por cada plaga del catálogo con
  nombre científico → match (guarda taxonomía en `catalogo_plagas`) → descubrir
  similares (género + familia, acotado) → guardar en `plaga_similar_gbif` con foto y
  nombre vulgar. Manejo por-especie con try/catch, degradación ante fallo de red,
  y resumen de resultados.

### 5. On-demand: botón "Buscar similares" en Nueva Plaga
- Endpoint `GET /plagas/gbif/similares?nombreCientifico={sci}[&nivel=GENERO|FAMILIA]`
  (auth `read:lotes`): resuelve el género/familia en vivo y devuelve las especies
  candidatas con `nombreCientifico`, `nombreVulgar`, `nivel`, `imagenUrl` (si hay
  foto CC — puede resolverse en vivo o desde `plaga_similar_gbif` si ya se sincronizó),
  `licencia`, `atribucion`. Pensado para usarse **antes** de que la plaga exista
  (en el alta), por eso trabaja por nombre científico, no por id.

### Frontend web
- En "Nueva Plaga" (`plagas-page`), al lado del input **Nombre científico**, botón
  **"Buscar similares"** que llama al endpoint on-demand y muestra las candidatas
  (foto + nombre vulgar + científico + nivel género/familia + atribución) en un
  panel; opción de **usar una** (autocompletar el nombre científico del alta) o
  agregarla como cultivo/plaga. Estilo premium dark SaaS.
- En la **ficha** de la plaga: bloque "Especies similares (GBIF)" separado del bloque
  "Plagas sugeridas (tu catálogo)" de la feature 54, con foto + nombre vulgar +
  científico + nivel + atribución/licencia.

### Mobile
- Paridad de la ficha (bloque de especies similares GBIF). El botón "Buscar
  similares" en el alta mobile queda opcional / a definir (puede ir en otra tanda).

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
Pendiente.
