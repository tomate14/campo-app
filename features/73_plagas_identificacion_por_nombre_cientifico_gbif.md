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
- **Fuente: GBIF, "por cultivo", creando entradas nuevas.** No se enriquecen las
  plagas existentes: se generan filas de referencia nuevas en una tabla propia.
- **Disparo: scheduler diario a las 03:00** (patrón del scheduler de clima). Se
  agrega además un endpoint manual de "sync ahora" (admin) para operación/pruebas.
- **Imágenes en el volumen Docker** (`backend_uploads`, reutilizado de la 54),
  subcarpeta `plagas-referencia/`. La tabla nueva guarda el **path relativo**.
- El uso **offline en mobile** se especifica aparte, en la **feature 74**.

## Flujo (backend)
1. Scheduler `@Scheduled(cron "0 0 3 * * *")` (y endpoint manual) recorre las filas
   activas de `utilidad_cultivo`.
2. Para cada cultivo, un **mapping curado** cultivo(valor)→lista de taxones
   `{nombreComun, nombreCientifico, tipo}` define qué especies bajar. GBIF no lista
   "plagas de X cultivo", por eso el vínculo cultivo→taxón es conocimiento propio.
3. Por cada taxón, si aún no está descargado (idempotente por cultivo+nombre
   científico):
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

## Mapping curado inicial (cultivo → taxones)
Contexto agro argentino. `tipo` usa el id del catálogo `TIPO_PLAGA`
(`tpla-plaga`/`tpla-enfermedad`/`tpla-maleza`).
- **SOJA**: Phakopsora pachyrhizi (roya asiática, enfermedad); Nezara viridula
  (chinche verde, plaga); Rachiplusia nu (oruga medidora, plaga); Amaranthus
  hybridus (yuyo colorado, maleza); Cercospora sojina (mancha ojo de rana, enf.).
- **MAIZ**: Spodoptera frugiperda (oruga cogollera, plaga); Dalbulus maidis
  (chicharrita, plaga); Puccinia sorghi (roya común, enfermedad); Diabrotica
  speciosa (vaquita, plaga).
- **TRIGO**: Puccinia striiformis (roya amarilla, enf.); Puccinia triticina (roya
  de la hoja, enf.); Schizaphis graminum (pulgón verde, plaga); Fusarium
  graminearum (fusariosis de la espiga, enf.).
- **GIRASOL**: Plasmopara halstedii (mildiu, enf.); Rachiplusia nu (oruga, plaga);
  Verticillium dahliae (verticilosis, enf.).
- **SORGO**: Melanaphis sacchari (pulgón amarillo, plaga); Colletotrichum
  sublineolum (antracnosis, enf.).
- **OTRO**: sin taxones.

## Alcance
### Backend
- Migración: tabla nueva `plaga_referencia` (id, cultivo_id ref a `utilidad_cultivo`,
  nombre_comun, nombre_cientifico, tipo, path imagen NULL, fuente, gbif_usage_key,
  url_original, licencia, atribucion, activo, timestamps, deleted_at; UNIQUE por
  cultivo_id + nombre_cientifico para idempotencia).
- `RestClient` a GBIF (bean + properties, patrón `ClimaConfig`/`ClimaProperties`).
- Servicio de sync (mapping curado + match + media + descarga a volumen + upsert).
- Scheduler 03:00 + endpoint manual `POST /plagas/catalogo-referencia/sync` (admin).
- Endpoints de lectura: `GET /plagas/catalogo-referencia?cultivo=` (agrupable por
  cultivo), devolviendo `imagenUrl` (`/uploads/...`), `cultivoNombre`, atribución.
- Imágenes servidas por el `/uploads/**` ya existente (feature 54).

### Frontend web
- Vista "Catálogo de referencia" en la pantalla de plagas: agrupado por cultivo,
  con la imagen descargada, nombre común/científico, tipo y **atribución/licencia**
  visible. Botón (admin) "Actualizar catálogo de referencia" que llama al sync
  manual. Estilo premium dark SaaS.

### Mobile
- Fuera de alcance acá: va en la **feature 74** (uso offline).

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
