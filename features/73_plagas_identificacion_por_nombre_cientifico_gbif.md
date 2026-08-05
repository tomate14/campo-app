# 73 - Plagas: catálogo de referencia por cultivo (descarga desde GBIF)

## Descripción
Construir un **catálogo de referencia de plagas por cultivo** descargando material
desde **GBIF** (banco de biodiversidad). A partir de los cultivos definidos en
`utilidad_cultivo`, un mapping curado cultivo→taxones determina qué especies
(plagas/enfermedades/malezas) son relevantes para cada cultivo; por cada taxón se
consulta GBIF por su **nombre científico**, se **descarga la imagen** de referencia
al **volumen Docker** y se crea una **entrada nueva** en una tabla propia que
guarda el **path** de la imagen más su fuente/atribución/licencia.

Esta feature deriva de la 54 (catálogo de plagas con imágenes propias del usuario);
acá las entradas son **de referencia**, descargadas automáticamente, separadas de
las que carga el usuario.

## Decisiones (confirmadas por el usuario)
- **Fuente de taxones: el propio catálogo de plagas** (`catalogo_plagas`), NO una
  lista fija en el backend. La relación cultivo→plaga sale de
  `cultivosAfectados`, que pasa a ser una **selección de `utilidad_cultivo`
  guardando los ids** (no texto libre). Así el usuario mantiene la lista: al dar
  de alta una plaga con sus cultivos, entra sola al catálogo de referencia. Se
  **elimina** el mapping curado (`PlagaReferenciaCatalogo`). *(Cambio pedido: se
  desarrolla en este mismo branch, es parte de la misma feature.)*
- **GBIF sólo aporta la foto** de cada especie (por su `nombreCientifico`), con su
  licencia y atribución.
- **Disparo: scheduler diario a las 03:00** (patrón del scheduler de clima). Se
  agrega además un endpoint manual de "sync ahora" (admin) para operación/pruebas.
- **Imágenes en el volumen Docker** (`backend_uploads`, reutilizado de la 54),
  subcarpeta `plagas-referencia/`. La tabla `plaga_referencia` guarda el **path
  relativo** y se enlaza a la plaga origen (`catalogo_plaga_id`).
- El uso **offline en mobile** se especifica aparte, en la **feature 74**.

## Cambio en `cultivosAfectados` (catálogo de plagas)
- Deja de ser texto libre: en el alta/edición del catálogo se selecciona de la
  lista de `utilidad_cultivo` (multi-selección) y se **guardan los ids** (CSV de
  ids en la columna, ensanchada). Patrón "referencias por id" de la feature 72.
- Responses: `cultivosAfectados` (ids) + `cultivosAfectadosNombres` (valores
  resueltos con `UtilidadNombreResolver`) para mostrar. Web: componente nuevo
  `configurable-multi-select` (CULTIVO). Mobile: multi-chips de CULTIVO.
- Migración: se editan los seeds de `cultivos_afectados` en `V12`/`V17` a ids y se
  regenera la base (no está en producción).

## Flujo (backend)
1. Scheduler `@Scheduled(cron "0 0 3 * * *")` (y endpoint manual) recorre las filas
   activas de `utilidad_cultivo`.
2. Para cada cultivo, se consulta `catalogo_plagas` con
   `FIND_IN_SET(cultivoId, cultivos_afectados)` y `nombre_cientifico` no vacío: esas
   son las plagas de ese cultivo. De cada una se toma
   `{nombreComun, nombreCientifico, tipo, catalogoPlagaId}`.
3. Por cada plaga, si aún no está descargada (idempotente por cultivo+plaga):
   - `GET api.gbif.org/v1/species/match?name={nombreCientifico}` → `usageKey`.
   - `GET api.gbif.org/v1/occurrence/search?taxonKey={key}&mediaType=StillImage&limit=n`
     → primera media con **licencia reutilizable** (Creative Commons): `identifier`
     (URL), `license`, `rightsHolder`.
   - Descargar los bytes de la imagen y guardarlos en
     `{campo.storage.uploads-dir}/plagas-referencia/{uuid}.{ext}` (reusar
     `FileStorageService`). Registrar la fila con el path.
4. Sólo se conservan imágenes con licencia CC (se guarda `license` y `rightsHolder`
   para mostrar **atribución**). Si un taxón no tiene media con licencia válida, se
   registra la entrada sin imagen (o se omite) y se loguea.
5. Degradar con gracia ante fallo de red / rate limit (no romper el arranque; el
   scheduler reintenta al día siguiente).

## Origen de los taxones (ya no es una lista fija)
Los taxones de cada cultivo salen del catálogo de plagas cargado por el usuario
(`catalogo_plagas`, vía `cultivosAfectados` por id). Los 3 seeds existentes
(Oruga cogollera/MAIZ,SORGO; Roya asiática/SOJA; Yuyo colorado/SOJA,MAIZ,GIRASOL)
ya alcanzan para probar; sumar plagas al catálogo amplía la cobertura sin tocar
código. Se **elimina** el componente `PlagaReferenciaCatalogo`.

## Alcance
### Backend
- `cultivosAfectados` por id: se ensancha `catalogo_plagas.cultivos_afectados` y se
  editan los seeds de `V12`/`V17` a ids de `utilidad_cultivo` (regenerar base).
  DTOs `CatalogoPlagaRequest`/`Response` con ids + `cultivosAfectadosNombres`.
- `plaga_referencia`: se le agrega `catalogo_plaga_id` (link a la plaga origen) y la
  unicidad pasa a `(cultivo_id, catalogo_plaga_id)`. Se edita la `V50` y se regenera.
- `RestClient` a GBIF (ya hecho).
- Servicio de sync reescrito: por cada cultivo, `FIND_IN_SET` sobre `catalogo_plagas`
  + match + media CC + descarga a volumen (dedupe de descarga por nombre científico)
  + upsert. Se elimina `PlagaReferenciaCatalogo`.
- Scheduler 03:00 + endpoint manual `POST /plagas/catalogo-referencia/sync` (admin).
- Lectura `GET /plagas/catalogo-referencia?cultivo=` con `cultivoNombre`, atribución.
- Imágenes servidas por el `/uploads/**` ya existente (feature 54).

### Frontend web
- `configurable-multi-select` nuevo (CULTIVO) para `cultivosAfectados` en el alta/
  edición del catálogo; la tabla/ficha muestran `cultivosAfectadosNombres`.
- Vista "Catálogo de referencia" (ya hecha) agrupada por cultivo con atribución +
  botón admin de sync. Estilo premium dark SaaS.

### Mobile
- Multi-chips de CULTIVO para `cultivosAfectados` en el alta/edición del catálogo;
  displays con los nombres resueltos.
- El uso offline del catálogo de referencia va en la **feature 74**.

## Requisitos Técnicos
- Confirmar/guardar licencia CC + atribución de cada imagen; no mostrar imágenes
  sin licencia reutilizable.
- Idempotencia (no re-descargar lo ya guardado); logs de resultado (bajadas/fallos).
- Red saliente del backend a `api.gbif.org` (y descarga desde el host de media,
  típicamente iNaturalist S3).

## Dependencias
- Feature 54 (storage en volumen + `/uploads/**`), 71/72 (catálogo `utilidad_cultivo`
  y referencias por id), 02 (patrón scheduler/cliente HTTP externo de clima).

## Estado
En progreso (2ª iteración): se cambia `cultivosAfectados` a ids de `utilidad_cultivo`
y el sync pasa a derivar los taxones del catálogo de plagas (se elimina la lista
fija). En el mismo branch, por pedido del usuario.

### 1ª iteración (base, ya verificada contra GBIF real)
Realizada (backend + web; mobile queda en la feature 74). Verificada end-to-end
contra Docker con GBIF real:
- V50 crea `plaga_referencia`. Fix de infra: al sumar el bean `gbifRestClient`
  quedaron 2 `RestClient` y `ClimaServiceImpl` (inyección por campo con `@Qualifier`
  vía Lombok) no resolvía; se agregó `backend/lombok.config`
  (`copyableAnnotations += @Qualifier`, `@Value`) y se copia en el Dockerfile.
- `POST /catalogo-referencia/sync` sobre GBIF: 6 cultivos, 18 procesados, 16
  imágenes descargadas al volumen, 1 sin media CC (fila sin imagen, degradación
  correcta). 2º sync → 0 descargadas, 16 omitidas (idempotente por
  cultivo+nombreCientifico).
- `GET /catalogo-referencia` devuelve `cultivoNombre`/`tipoNombre` resueltos,
  `imagenUrl`, licencia CC + atribución; filtro `?cultivo=` OK. La imagen real se
  sirve en `/uploads/plagas-referencia/...` (200 image/jpeg, sin token).
- Web: pestaña "Catálogo de referencia" agrupada por cultivo, cada especie con
  imagen (render confirmado 2048×1536), nombre común/científico, badge de tipo,
  atribución + licencia + "Ver original", y botón admin "Actualizar catálogo de
  referencia" (sync). Sin errores de consola.
- El scheduler `@Scheduled(cron 0 0 3 * * *)` queda activo para la corrida diaria.
- Gates verdes: `mvn clean package` (compile + test-compile), `npm run type-check`.
