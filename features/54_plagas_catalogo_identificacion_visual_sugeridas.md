# 54 - Plagas: catálogo con identificación visual y plagas sugeridas

## Descripción
Enriquecer el catálogo de plagas con material visual e identificación asistida:
imágenes de la plaga, imágenes de posibles plagas para comparar, área/zona típica
y umbral de acción; y a partir del nombre científico mostrar imágenes de
referencia para confirmar la identidad, además de sugerir plagas relacionadas o
similares.

## Contexto
- Catálogo actual: `CatalogoPlaga` (backend `PlagasController` + entidad) con
  `nombreComun`, `nombreCientifico`, `tipo`, `cultivosAfectados`, `sintomas`,
  `umbralAccion`, `activo`. Consumido por web (`plagas-page`) y mobile
  (`plagas.tsx`, alta desde el selector — feature 53).

## Alcance
1. **Imágenes del catálogo**: permitir asociar una o varias imágenes a cada
   `CatalogoPlaga` (foto principal + galería de "posibles plagas"). Persistencia
   de imágenes (definir almacenamiento: ver Requisitos).
2. **Campos adicionales**: reforzar/mostrar "área o zona típica de la plaga" y el
   `umbralAccion` en las fichas web y mobile.
3. **Identificación por nombre científico**: dado el `nombreCientifico`, mostrar
   imágenes de referencia externas para que el usuario confirme si es esa plaga.
4. **Plagas sugeridas / relacionadas**: listar plagas similares para descartar
   confusiones.

## Criterio sugerido para "plagas relacionadas/similares"
El usuario pidió proponer criterio. Sugerencia (combinable, con score):
- Mismo `tipo` (PLAGA / ENFERMEDAD / MALEZA).
- Mismo **género taxonómico** = primera palabra del `nombreCientifico`
  (p. ej. *Spodoptera* frigiperda ↔ *Spodoptera* cosmioides).
- Solapamiento de `cultivosAfectados` (comparten al menos un cultivo).
- Similitud de texto en `sintomas` (coincidencia de palabras clave).
Ranking: priorizar mismo género + cultivo compartido; luego tipo + síntomas.
Implementación pragmática: cálculo en backend sobre el catálogo propio (sin ML).

## Fuente de imágenes por nombre científico (a confirmar licencia)
Propuesta: consultar un banco de biodiversidad por nombre científico y cachear:
- **GBIF** (`api.gbif.org`, media por especie, pagina de la API: https://techdocs.gbif.org/en/openapi/) o **iNaturalist** (`api.inaturalist.org`).
- Guardar en backend la URL/So thumbnail cacheado por especie para no depender de
  la red en cada consulta y respetar rate limits.
- Confirmar licencia de reuso de cada imagen (mostrar atribución si corresponde).
No inferir ni scrapear fuentes que lo prohíban.

## Requisitos Técnicos
- Almacenamiento de imágenes: definir (columna con URL + storage de archivos, o
  tabla `catalogo_plaga_imagen`). Evaluar tamaño/formatos.
- Endpoints REST para subir/listar imágenes del catálogo y para "sugeridas".
- Web y mobile: galería en la ficha de plaga y en el alta (feature 53).
- Estilo premium dark SaaS.

## Decisiones (confirmadas por el usuario)
- **Almacenamiento de imágenes: filesystem + servido estático.** Los archivos se
  guardan en disco del backend (`${UPLOADS_DIR:/app/uploads}/plagas-catalogo/`),
  servidos por un `WebMvcConfigurer` en `/uploads/**` (permitAll en Security para
  que las `<img>` carguen sin header JWT). Una tabla `catalogo_plaga_imagen`
  guarda la **metadata** (path relativo, nombre, content-type, tamaño, principal,
  orden), no los bytes. Docker monta un volumen persistente para `/app/uploads`.
- **La identificación por nombre científico con imágenes externas (GBIF/
  iNaturalist) se difiere a la feature 73** (llamadas de red salientes +
  licencias). En la 54 entran: imágenes propias, zona/área típica + umbral en las
  fichas, y plagas sugeridas/relacionadas (algoritmo sobre el catálogo propio).
- **Mobile también sube imágenes** (se agrega `expo-image-picker`), en paridad
  con web (galería + captura/subida). 

## Alcance cerrado en esta feature (54)
### Backend
- V49: agrega `zona_tipica` a `catalogo_plagas` y crea `catalogo_plaga_imagen`.
- Storage en filesystem + `WebMvcConfigurer` `/uploads/**` + permitAll en Security
  + config multipart (archivo ≤ 6MB) + property `campo.storage.uploads-dir`.
- Endpoints: subir/listar/borrar imágenes del catálogo; editar catálogo (para
  setear zona); "sugeridas" (`GET /catalogo/{id}/sugeridas`). `CatalogoPlagaRequest`
  suma `zonaTipica`; `CatalogoPlagaResponse` suma `zonaTipica`, `imagenes[]` e
  `imagenPrincipalUrl`.
- Algoritmo de sugeridas (score sobre el catálogo propio): mismo `tipo`, mismo
  género (1ra palabra del `nombreCientifico`), solape de `cultivosAfectados`,
  similitud de palabras clave en `sintomas`.

### Web y mobile
- Ficha de plaga con galería, zona/área típica, umbral y bloque de "plagas
  sugeridas"; alta/edición con zona y subida de imágenes. Estilo premium dark SaaS.

## Dependencias
- Feature 37 (plagas) y 53 (alta de catálogo desde mobile).
- Deriva la feature 73 (identificación por nombre científico vía GBIF/iNaturalist).

## Estado
Realizada (parte diferida a la feature 73). Verificada end-to-end contra Docker:
- V49 aplicada (columna `zona_tipica` + tabla `catalogo_plaga_imagen`); backend
  healthy sin errores.
- Storage filesystem: el Dockerfile crea `/app/uploads` con owner `spring` para
  que el volumen persistente sea escribible por el usuario no-root; subir imagen
  persiste el archivo y `GET /uploads/plagas-catalogo/xxx.png` responde 200
  `image/png` **sin** token (permitAll). DELETE hace soft-delete + borra el archivo.
- `PUT /catalogo/{id}` setea `zonaTipica`; el catálogo devuelve `zonaTipica`,
  `imagenes[]` e `imagenPrincipalUrl`. Sugeridas para "Oruga cogollera" → "Yuyo
  colorado" (score 2, motivo "Comparte cultivos: MAIZ"), exacto al algoritmo.
- Web: tabla del catálogo con columnas Zona típica / Umbral / acciones Ver ficha
  y Editar; modal de ficha premium con galería (la imagen carga desde el origin
  del backend), zona, umbral, cultivos, síntomas y bloque "Plagas sugeridas" con
  sus motivos; subida/borrado de imagen y alta/edición con zona. Sin errores de
  consola. `npm run type-check` verde.
- Mobile: `expo-image-picker` agregado; ficha con galería + captura/subida
  (online) + sugeridas + zona + edición; `PUT` offline por outbox, upload solo
  online. `tsc` + jest verdes.
- La identificación por nombre científico con imágenes externas (GBIF/iNaturalist)
  quedó como feature 73.
